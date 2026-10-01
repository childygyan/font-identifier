/**
 * fontscan.ts — client-side automatic font recognition engine.
 *
 * How it works (all in the browser, the image is never uploaded):
 *  1. The uploaded image is grayscaled, binarized (Otsu) and polarity-normalized.
 *  2. Connected-component analysis splits the lettering into individual letters.
 *  3. Each letter is normalized to a 16x16 shape fingerprint and compared
 *     against a build-time database of every glyph of every font (also 16x16).
 *     The font + character are worked out together, like a human would.
 *  4. The top candidates are re-checked by rendering the detected text in each
 *     real font and comparing the whole word, proportions intact.
 *
 * Results are honest "closest shape matches" with similarity scores — the user
 * always verifies visually against the side-by-side preview.
 */

export interface ScanDb {
  grid: number;
  charset: string;
  /** font slugs, index-aligned with fonts[] */
  slugs: string[];
  /** nFonts * nChars bytes: glyph width/height ratio mapped 0..255 (0 = missing) */
  aspects: Uint8Array;
  /** nFonts * nChars * 128 bytes: 256 nibbles row-major, ink = 15 */
  data: Uint8Array;
  /** slug -> gstatic TTF url, for stage-2 FontFace rendering */
  urls: Record<string, string>;
  /** slug -> display name */
  names: Record<string, string>;
}

export interface LetterHit {
  box: { x: number; y: number; w: number; h: number };
  /** best-guess character for this letter position */
  char: string;
  /** per-font best distance for this letter (fontIdx -> dist), sparse */
  fontDist: Map<number, number>;
  /** per-font best character for this letter (fontIdx -> char), sparse */
  fontChar: Map<number, string>;
  bestDist: number;
  /** a word gap was detected before this letter */
  spaceBefore: boolean;
}

export interface RankedFont {
  slug: string;
  name: string;
  /** stage-2 word similarity 0..1 */
  similarity: number;
  /** displayed match percentage (calibrated) */
  matchPct: number;
  stage1Rank: number;
}

export interface ScanOk {
  ok: true;
  letters: LetterHit[];
  detectedText: string;
  /** top candidates after stage 2, best first */
  results: RankedFont[];
  /** tight word crop of the upload, for side-by-side display */
  refCropUrl: string;
  lowConfidence: boolean;
}

export interface ScanFail {
  ok: false;
  reason: "few-letters" | "too-many" | "no-contrast" | "db-error";
  detail: string;
}

export type ScanResult = ScanOk | ScanFail;

const GRID = 16;
const STAGE1_KEEP = 14;
const STAGE2_KEEP = 8;

/* ------------------------------------------------------------------ */
/* database loading                                                    */
/* ------------------------------------------------------------------ */

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function loadScanDb(
  names: Record<string, string>,
  onProgress?: (msg: string) => void,
): Promise<ScanDb> {
  onProgress?.("Loading font shape database…");
  const [fpRes, urlRes] = await Promise.all([
    fetch("/scan/fingerprints.json"),
    fetch("/scan/font-urls.json"),
  ]);
  if (!fpRes.ok || !urlRes.ok) throw new Error("shape database missing");
  const fp = await fpRes.json();
  const urls = (await urlRes.json()) as Record<string, string>;
  return {
    grid: fp.grid as number,
    charset: fp.charset as string,
    slugs: fp.fonts as string[],
    aspects: b64ToBytes(fp.aspects as string),
    data: b64ToBytes(fp.data as string),
    urls,
    names,
  };
}

/* ------------------------------------------------------------------ */
/* image preprocessing                                                 */
/* ------------------------------------------------------------------ */

interface GrayImage {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}

function imageToGray(img: HTMLImageElement, targetH = 420): GrayImage {
  const scale = Math.min(1, targetH / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = Math.round(0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]);
  }
  return { data: gray, w, h };
}

function otsuThreshold(gray: Uint8ClampedArray): number {
  const hist = new Int32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let bestT = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      bestT = t;
    }
  }
  return bestT;
}

/** Binarize: returns ink=1 mask with dark-text-on-light polarity. */
function binarize(gray: GrayImage): { bin: Uint8Array; w: number; h: number } {
  const { data, w, h } = gray;
  const t = otsuThreshold(data);
  const bin = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i++) bin[i] = data[i] < t ? 1 : 0;
  // polarity: if the rim is mostly ink, the text is light-on-dark -> invert
  let rim = 0;
  let rimInk = 0;
  const rimPx = 8;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < rimPx || y < rimPx || x >= w - rimPx || y >= h - rimPx) {
        rim++;
        rimInk += bin[y * w + x];
      }
    }
  }
  if (rim > 0 && rimInk / rim > 0.5) {
    for (let i = 0; i < bin.length; i++) bin[i] = bin[i] ? 0 : 1;
  }
  return { bin, w, h };
}

/* ------------------------------------------------------------------ */
/* letter segmentation (connected components)                          */
/* ------------------------------------------------------------------ */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
}

function connectedComponents(bin: Uint8Array, w: number, h: number): Box[] {
  const label = new Int32Array(w * h).fill(-1);
  const boxes: Box[] = [];
  const stack: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (bin[i] !== 1 || label[i] !== -1) continue;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    let area = 0;
    stack.push(i);
    label[i] = boxes.length;
    while (stack.length > 0) {
      const p = stack.pop() as number;
      const x = p % w;
      const y = (p / w) | 0;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const np = ny * w + nx;
          if (bin[np] === 1 && label[np] === -1) {
            label[np] = boxes.length;
            stack.push(np);
          }
        }
      }
    }
    boxes.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, area });
  }
  return boxes;
}

/** Merge i/j dots and tittles into the stem below them. */
function mergeDots(boxes: Box[]): Box[] {
  if (boxes.length === 0) return boxes;
  const areas = boxes.map((b) => b.area).sort((a, b) => a - b);
  const medianArea = areas[Math.floor(areas.length / 2)] as number;
  const medianH = boxes
    .map((b) => b.h)
    .sort((a, b) => a - b)[Math.floor(boxes.length / 2)] as number;
  const used = new Array(boxes.length).fill(false);
  const out: Box[] = [];
  const mergeInto = new Map<number, number>();
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i] as Box;
    if (b.area > medianArea * 0.45 || b.h > medianH * 0.5) continue;
    // small mark: look for a taller box below with horizontal overlap
    const cx = b.x + b.w / 2;
    let best = -1;
    let bestGap = Infinity;
    for (let j = 0; j < boxes.length; j++) {
      if (j === i) continue;
      const o = boxes[j] as Box;
      if (o.h < medianH * 0.5) continue;
      const ocx = o.x + o.w / 2;
      const gap = o.y - (b.y + b.h);
      if (gap < 0 || gap > medianH * 0.9) continue;
      if (Math.abs(cx - ocx) > Math.max(b.w, o.w) * 0.8) continue;
      if (gap < bestGap) {
        bestGap = gap;
        best = j;
      }
    }
    if (best >= 0) {
      used[i] = true;
      mergeInto.set(best, i);
    }
  }
  for (let j = 0; j < boxes.length; j++) {
    if (used[j]) continue;
    const b = { ...(boxes[j] as Box) };
    const dot = mergeInto.get(j);
    if (dot !== undefined) {
      const d = boxes[dot] as Box;
      const x0 = Math.min(b.x, d.x);
      const y0 = Math.min(b.y, d.y);
      const x1 = Math.max(b.x + b.w, d.x + d.w);
      const y1 = Math.max(b.y + b.h, d.y + d.h);
      b.x = x0;
      b.y = y0;
      b.w = x1 - x0;
      b.h = y1 - y0;
      b.area += d.area;
    }
    out.push(b);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* letter fingerprinting                                               */
/* ------------------------------------------------------------------ */

const fpCanvas = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = GRID;
  c.height = GRID;
  return c;
})();

/** Normalize one letter box to a 16x16 nibble fingerprint (ink = 15). */
function letterFingerprint(gray: GrayImage, box: Box): { fp: Uint8Array; aspectByte: number } {
  const pad = 0.08;
  const x0 = Math.max(0, Math.floor(box.x - box.w * pad));
  const y0 = Math.max(0, Math.floor(box.y - box.h * pad));
  const x1 = Math.min(gray.w, Math.ceil(box.x + box.w + box.w * pad));
  const y1 = Math.min(gray.h, Math.ceil(box.y + box.h + box.h * pad));
  const cw = Math.max(1, x1 - x0);
  const ch = Math.max(1, y1 - y0);

  const src = document.createElement("canvas");
  src.width = cw;
  src.height = ch;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  const imgData = sctx.createImageData(cw, ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const g = gray.data[(y0 + y) * gray.w + (x0 + x)] as number;
      const o = (y * cw + x) * 4;
      imgData.data[o] = g;
      imgData.data[o + 1] = g;
      imgData.data[o + 2] = g;
      imgData.data[o + 3] = 255;
    }
  }
  sctx.putImageData(imgData, 0, 0);

  const c = fpCanvas as HTMLCanvasElement;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, GRID, GRID);
  ctx.drawImage(src, 0, 0, GRID, GRID);
  const px = ctx.getImageData(0, 0, GRID, GRID).data;
  const fp = new Uint8Array(GRID * GRID);
  for (let i = 0; i < GRID * GRID; i++) {
    const g = px[i * 4] as number;
    fp[i] = Math.round(((255 - g) / 255) * 15);
  }
  const aspectByte = Math.round((Math.min(4, box.w / box.h) / 4) * 255);
  return { fp, aspectByte };
}

/* ------------------------------------------------------------------ */
/* stage 1: fingerprint matching                                       */
/* ------------------------------------------------------------------ */

function matchLetters(
  letters: { fp: Uint8Array; aspectByte: number }[],
  db: ScanDb,
): LetterHit[] {
  const nChars = db.charset.length;
  const nFonts = db.slugs.length;
  const results: LetterHit[] = [];

  for (const L of letters) {
    const fontDist = new Map<number, number>();
    const fontChar = new Map<number, string>();
    let bestDist = Infinity;
    let bestChar = "?";
    let bestFont = -1;
    for (let f = 0; f < nFonts; f++) {
      const fbase = f * nChars;
      let fBest = Infinity;
      let fBestChar = "";
      for (let ch = 0; ch < nChars; ch++) {
        const ab = db.aspects[fbase + ch] as number;
        if (ab === 0) continue; // missing glyph
        if (Math.abs(ab - L.aspectByte) > 90) continue; // aspect prefilter
        const dbase = (fbase + ch) * 128;
        let sad = 0;
        for (let k = 0; k < 128; k++) {
          const b = db.data[dbase + k] as number;
          const hi = b >> 4;
          const lo = b & 15;
          const o = k * 2;
          sad += Math.abs(hi - (L.fp[o] as number)) + Math.abs(lo - (L.fp[o + 1] as number));
          if (sad >= fBest) break; // early exit
        }
        if (sad < fBest) {
          fBest = sad;
          fBestChar = db.charset[ch] as string;
        }
      }
      if (fBest < Infinity) {
        fontDist.set(f, fBest);
        fontChar.set(f, fBestChar);
        if (fBest < bestDist) {
          bestDist = fBest;
          bestChar = fBestChar;
          bestFont = f;
        }
      }
    }
    void bestFont;
    results.push({ box: { x: 0, y: 0, w: 0, h: 0 }, char: bestChar, fontDist, fontChar, bestDist, spaceBefore: false });
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* stage 2: render-based re-check                                      */
/* ------------------------------------------------------------------ */

const loadedFaces = new Set<string>();

async function ensureFontFace(slug: string, db: ScanDb): Promise<boolean> {
  if (loadedFaces.has(slug)) return true;
  const url = db.urls[slug];
  const name = db.names[slug] ?? slug;
  if (!url) return false;
  try {
    const face = new FontFace(name, `url(${url})`, {});
    const loaded = await face.load();
    document.fonts.add(loaded);
    loadedFaces.add(slug);
    return true;
  } catch {
    return false;
  }
}

interface WordBitmap {
  data: Uint8Array; // 1 = ink
  w: number;
  h: number;
}

/** Render text in a font, binarize, tight-crop, normalize to height 64. */
async function renderWordBitmap(
  slug: string,
  text: string,
  db: ScanDb,
): Promise<WordBitmap | null> {
  const okFace = await ensureFontFace(slug, db);
  if (!okFace) return null;
  const name = db.names[slug] ?? slug;
  const size = 120;
  const meas = document.createElement("canvas");
  const mctx = meas.getContext("2d", { willReadFrequently: true })!;
  mctx.font = `${size}px "${name}"`;
  const tw = Math.ceil(mctx.measureText(text).width) + 40;
  const c = document.createElement("canvas");
  c.width = Math.max(2, tw);
  c.height = size + 60;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#000";
  ctx.font = `${size}px "${name}"`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 20, size);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  // binarize + tight crop
  let x0 = c.width;
  let y0 = c.height;
  let x1 = -1;
  let y1 = -1;
  const bin = new Uint8Array(c.width * c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const o = (y * c.width + x) * 4;
      const g = 0.299 * (img.data[o] as number) + 0.587 * (img.data[o + 1] as number) + 0.114 * (img.data[o + 2] as number);
      const ink = g < 128 ? 1 : 0;
      bin[y * c.width + x] = ink;
      if (ink) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < x0) return null;
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const H = 64;
  const W = Math.max(1, Math.round((cw / ch) * H));
  const nc = document.createElement("canvas");
  nc.width = W;
  nc.height = H;
  const nctx = nc.getContext("2d", { willReadFrequently: true })!;
  const crop = document.createElement("canvas");
  crop.width = cw;
  crop.height = ch;
  const cctx = crop.getContext("2d", { willReadFrequently: true })!;
  const cropImg = cctx.createImageData(cw, ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const ink = bin[(y0 + y) * c.width + (x0 + x)] as number;
      const o = (y * cw + x) * 4;
      const v = ink ? 0 : 255;
      cropImg.data[o] = v;
      cropImg.data[o + 1] = v;
      cropImg.data[o + 2] = v;
      cropImg.data[o + 3] = 255;
    }
  }
  cctx.putImageData(cropImg, 0, 0);
  nctx.drawImage(crop, 0, 0, W, H);
  const np = nctx.getImageData(0, 0, W, H).data;
  const out = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    out[i] = (np[i * 4] as number) < 128 ? 1 : 0;
  }
  return { data: out, w: W, h: H };
}

/** Reference word bitmap from the upload's letter boxes. */
function referenceWordBitmap(
  bin: Uint8Array,
  w: number,
  h: number,
  boxes: Box[],
): WordBitmap {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (const b of boxes) {
    if (b.x < x0) x0 = b.x;
    if (b.y < y0) y0 = b.y;
    if (b.x + b.w - 1 > x1) x1 = b.x + b.w - 1;
    if (b.y + b.h - 1 > y1) y1 = b.y + b.h - 1;
  }
  const pad = 4;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad);
  y1 = Math.min(h - 1, y1 + pad);
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const H = 64;
  const W = Math.max(1, Math.round((cw / ch) * H));
  const src = document.createElement("canvas");
  src.width = cw;
  src.height = ch;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  const img = sctx.createImageData(cw, ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const ink = bin[(y0 + y) * w + (x0 + x)] as number;
      const o = (y * cw + x) * 4;
      const v = ink ? 0 : 255;
      img.data[o] = v;
      img.data[o + 1] = v;
      img.data[o + 2] = v;
      img.data[o + 3] = 255;
    }
  }
  sctx.putImageData(img, 0, 0);
  const nc = document.createElement("canvas");
  nc.width = W;
  nc.height = H;
  const nctx = nc.getContext("2d", { willReadFrequently: true })!;
  nctx.drawImage(src, 0, 0, W, H);
  const np = nctx.getImageData(0, 0, W, H).data;
  const out = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = (np[i * 4] as number) < 128 ? 1 : 0;
  return { data: out, w: W, h: H };
}

/** Word similarity with a small horizontal shift search. */
function wordSimilarity(a: WordBitmap, b: WordBitmap): number {
  const H = 64;
  const ow = Math.min(a.w, b.w);
  const mw = Math.max(a.w, b.w);
  if (ow < 4) return 0;
  let best = 0;
  for (let shift = -6; shift <= 6; shift += 2) {
    let agree = 0;
    let total = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < ow; x++) {
        const ax = x;
        const bx = x + shift;
        if (bx < 0 || bx >= b.w) continue;
        total++;
        if ((a.data[y * a.w + ax] as number) === (b.data[y * b.w + bx] as number)) agree++;
      }
    }
    if (total > 0) {
      const s = agree / total;
      if (s > best) best = s;
    }
  }
  return best * Math.pow(ow / mw, 0.6);
}

/* ------------------------------------------------------------------ */
/* main entry                                                          */
/* ------------------------------------------------------------------ */

export interface ScanCallbacks {
  onProgress?: (msg: string) => void;
}

/** Calibrate raw similarity into a displayed percentage. Tuned on test images. */
function toMatchPct(sim: number): number {
  // sim ~0.97 for near-perfect renders, ~0.75 for decent matches, <0.6 poor.
  const pct = Math.round(100 * Math.min(1, Math.max(0, (sim - 0.45) / (0.95 - 0.45))));
  return Math.max(3, Math.min(99, pct));
}

export async function scanImage(
  img: HTMLImageElement,
  db: ScanDb,
  cb: ScanCallbacks = {},
): Promise<ScanResult> {
  const say = cb.onProgress ?? (() => {});
  try {
    say("Reading your image…");
    await new Promise((r) => setTimeout(r, 30));
    const gray = imageToGray(img);
    say("Separating ink from background…");
    await new Promise((r) => setTimeout(r, 30));
    const { bin, w, h } = binarize(gray);

    // sanity: need a reasonable amount of ink
    let inkCount = 0;
    for (let i = 0; i < bin.length; i++) inkCount += bin[i];
    const inkFrac = inkCount / bin.length;
    if (inkFrac < 0.005 || inkFrac > 0.6) {
      return {
        ok: false,
        reason: "no-contrast",
        detail:
          "I couldn't find clear lettering in this image. Try a tighter crop around the text, with plain background behind the letters.",
      };
    }

    say("Finding individual letters…");
    await new Promise((r) => setTimeout(r, 30));
    let boxes = connectedComponents(bin, w, h);
    const imgArea = w * h;
    boxes = boxes.filter((b) => b.area >= imgArea * 0.00012 && b.w >= 3 && b.h >= 5);
    boxes = mergeDots(boxes);
    // drop specks relative to the median letter
    if (boxes.length > 0) {
      const areas = boxes.map((b) => b.area).sort((a, b) => a - b);
      const med = areas[Math.floor(areas.length / 2)] as number;
      boxes = boxes.filter((b) => b.area >= med * 0.1);
    }
    boxes.sort((a, b) => a.x - b.x);

    if (boxes.length < 2) {
      return {
        ok: false,
        reason: "few-letters",
        detail:
          "I could only separate " +
          boxes.length +
          " letter shape" +
          (boxes.length === 1 ? "" : "s") +
          ". Joined-up or script lettering can't be measured one letter at a time — try a word in a print-style font, cropped tightly.",
      };
    }
    if (boxes.length > 60) {
      return {
        ok: false,
        reason: "too-many",
        detail:
          "I found too many tiny shapes (" +
          boxes.length +
          "). Crop tightly around just the words you want identified — no icons, no background clutter.",
      };
    }

    say(`Measuring ${boxes.length} letters…`);
    await new Promise((r) => setTimeout(r, 30));
    const fps = boxes.map((b) => letterFingerprint(gray, b));

    say("Comparing against 148 fonts…");
    await new Promise((r) => setTimeout(r, 30));
    const hits = matchLetters(fps, db);
    for (let i = 0; i < hits.length; i++) {
      (hits[i] as LetterHit).box = boxes[i] as Box;
    }

    // word gaps: a gap clearly wider than the usual inter-letter gap is a space.
    // relative rule (calibrated on test images): beats both fixed fractions.
    {
      const posGaps: number[] = [];
      for (let i = 1; i < boxes.length; i++) {
        const prev = boxes[i - 1] as Box;
        const cur = boxes[i] as Box;
        const gap = cur.x - (prev.x + prev.w);
        if (gap > 0) posGaps.push(gap);
      }
      posGaps.sort((a, b) => a - b);
      const medGap = (posGaps[Math.floor(posGaps.length / 2)] as number) || 8;
      const widths = boxes.map((b) => b.w).sort((a, b) => a - b);
      const medW = (widths[Math.floor(widths.length / 2)] as number) || 10;
      for (let i = 1; i < hits.length; i++) {
        const prev = boxes[i - 1] as Box;
        const cur = boxes[i] as Box;
        const gap = cur.x - (prev.x + prev.w);
        if (gap > medW * 0.25 && gap > medGap * 2.2) {
          (hits[i] as LetterHit).spaceBefore = true;
        }
      }
    }
    const maxH = Math.max(...boxes.map((b) => b.h));

    // stage-1 font ranking: sum of per-letter best distances
    const nFonts = db.slugs.length;
    const totals = new Array<number>(nFonts).fill(Infinity);
    for (let f = 0; f < nFonts; f++) {
      let sum = 0;
      let count = 0;
      for (const hh of hits) {
        const d = hh.fontDist.get(f);
        if (d !== undefined) {
          sum += d;
          count++;
        }
      }
      if (count === hits.length) totals[f] = sum / count;
    }
    const stage1 = totals
      .map((t, f) => ({ f, t }))
      .filter((e) => e.t < Infinity)
      .sort((a, b) => a.t - b.t)
      .slice(0, STAGE1_KEEP);

    // Re-read each letter using the stage-2 shortlist's alphabets: for every
    // letter position, take the character from whichever shortlisted font
    // matched that letter's shape best. Like a human who shortlists a few
    // lookalike fonts and then reads the word through each of them.
    // Fixes o/0, l/I style confusions that come from mixing alphabets.
    const shortlist = stage1.slice(0, STAGE2_KEEP).map((e) => (e as { f: number }).f);
    if (shortlist.length === 0) {
      return {
        ok: false,
        reason: "db-error",
        detail: "The letter shapes didn't match anything in the font library. Try a cleaner, higher-contrast image.",
      };
    }
    const refined = hits.map((hh) => {
      let bestF = shortlist[0] as number;
      let bestD = Infinity;
      for (const f of shortlist) {
        const d = hh.fontDist.get(f);
        if (d !== undefined && d < bestD) {
          bestD = d;
          bestF = f;
        }
      }
      return hh.fontChar.get(bestF) ?? hh.char;
    });
    // Case resolution. The vote above picks the best-matching character, but for
    // fonts whose upper/lowercase share one shape (Bebas's p IS its P) the vote
    // is a coin flip, so geometry must decide. For each letter we compare the
    // input against both cases across the shortlist: if the two distances are
    // close the shape is case-ambiguous and geometry decides, otherwise the
    // fingerprint vote stands.
    //   - descender letters (g j p q y): the TOP edge decides (cap top = upper)
    //   - everything else: relative height decides (tall vs the line = upper).
    //     The bar is 0.85 not 1.0 because real caps can measure a little short
    //     (thin top strokes sometimes vanish in binarization).
    const lineTop = Math.min(...boxes.map((b) => b.y));
    const DESCENDERS = "gjpqy";
    const nChars = db.charset.length;
    function caseDist(
      L: { fp: Uint8Array; aspectByte: number },
      f: number,
      ch: string,
    ): number {
      const ci = db.charset.indexOf(ch);
      if (ci < 0) return Infinity;
      const ab = db.aspects[f * nChars + ci] as number;
      if (!ab || Math.abs(ab - L.aspectByte) > 90) return Infinity;
      const dbase = (f * nChars + ci) * 128;
      let sad = 0;
      for (let k = 0; k < 128; k++) {
        const b = db.data[dbase + k] as number;
        const o = k * 2;
        sad +=
          Math.abs((b >> 4) - (L.fp[o] as number)) +
          Math.abs((b & 15) - (L.fp[o + 1] as number));
      }
      return sad;
    }
    const outChars: string[] = [];
    for (let i = 0; i < hits.length; i++) {
      const hh = hits[i] as LetterHit;
      let ch = refined[i] as string;
      const lo = ch.toLowerCase();
      const hi = ch.toUpperCase();
      if (lo !== hi && /^[a-z]$/i.test(ch)) {
        let dLo = Infinity;
        let dHi = Infinity;
        for (const f of shortlist) {
          const a = caseDist(fps[i] as { fp: Uint8Array; aspectByte: number }, f, lo);
          if (a < dLo) dLo = a;
          const b = caseDist(fps[i] as { fp: Uint8Array; aspectByte: number }, f, hi);
          if (b < dHi) dHi = b;
        }
        const m = Math.min(dLo, dHi);
        const M = Math.max(dLo, dHi);
        // coin flip only when the two cases are genuinely close
        if (M < Infinity && Math.abs(dLo - dHi) <= Math.max(150, 0.15 * M)) {
          if (DESCENDERS.indexOf(lo) !== -1) {
            ch = hh.box.y <= lineTop + 0.12 * maxH ? hi : lo;
          } else {
            ch = hh.box.h >= 0.85 * maxH ? hi : lo;
          }
        }
      }
      outChars.push(ch);
    }
    // A capital I sitting mid-word next to lowercase letters is almost always
    // a misread lowercase l (a genuine mid-word I is vanishingly rare).
    // Word-initial I is left alone: Image/Iron vs lorem-like are ambiguous.
    for (let i = 0; i < outChars.length; i++) {
      if (outChars[i] === "I" && i > 0 && !(hits[i] as LetterHit).spaceBefore) {
        const prev = outChars[i - 1] as string;
        const next =
          i + 1 < outChars.length && !(hits[i + 1] as LetterHit).spaceBefore
            ? (outChars[i + 1] as string)
            : "";
        if (/[a-z]/.test(prev) || /[a-z]/.test(next)) outChars[i] = "l";
      }
    }
    let detectedText = "";
    for (let i = 0; i < hits.length; i++) {
      if (i > 0 && (hits[i] as LetterHit).spaceBefore) detectedText += " ";
      detectedText += outChars[i];
    }
    const stage1LetterUncertain = refined.some((c) => c === "?");
    const stage1AvgDist = hits.reduce((s, hh) => s + hh.bestDist, 0) / hits.length;

    // reference crop data-url for the side-by-side view
    const refBmp = referenceWordBitmap(bin, w, h, boxes);
    const refCropUrl = wordBitmapToDataUrl(refBmp);

    say("Double-checking the closest matches…");
    const stage2: { slug: string; name: string; similarity: number; stage1Rank: number }[] = [];
    const shortText = detectedText.replace(/\?/g, "").trim() || detectedText;
    for (let i = 0; i < Math.min(STAGE2_KEEP, stage1.length); i++) {
      const e = stage1[i] as { f: number; t: number };
      const slug = db.slugs[e.f] as string;
      const rendered = await renderWordBitmap(slug, shortText, db);
      const similarity = rendered ? wordSimilarity(refBmp, rendered) : 0;
      stage2.push({
        slug,
        name: db.names[slug] ?? slug,
        similarity,
        stage1Rank: i + 1,
      });
      say(`Double-checking the closest matches… (${i + 1}/${Math.min(STAGE2_KEEP, stage1.length)})`);
    }
    // Rank purely by the whole-word render similarity, so the displayed rank
    // order always agrees with the shown percentages.
    stage2.sort((a, b) => b.similarity - a.similarity);
    const results: RankedFont[] = stage2.map((s) => ({
      ...s,
      matchPct: toMatchPct(s.similarity),
    }));
    // Honest uncertainty: flag weak matches AFTER the final ranking. A top
    // score under ~40% means even the best render barely resembles the upload.
    const topPct = results.length ? (results[0] as RankedFont).matchPct : 0;
    const lowConfidence =
      stage1LetterUncertain || topPct < 40 || stage1AvgDist > 2600;

    return { ok: true, letters: hits, detectedText, results, refCropUrl, lowConfidence };
  } catch (err) {
    return {
      ok: false,
      reason: "db-error",
      detail: "Something went wrong while scanning. Please try again with a different image.",
    };
  }
}

/** Re-run only stage 2 (after the user corrects the detected text). */
export async function rerankWithText(
  text: string,
  refDataUrl: string,
  candidates: { slug: string; name: string; stage1Rank: number }[],
  db: ScanDb,
  onProgress?: (msg: string) => void,
): Promise<RankedFont[]> {
  const refBmp = await dataUrlToWordBitmap(refDataUrl);
  const out: RankedFont[] = [];
  const clean = text.trim() || "?";
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i] as { slug: string; name: string; stage1Rank: number };
    onProgress?.(`Re-checking ${c.name}… (${i + 1}/${candidates.length})`);
    const rendered = await renderWordBitmap(c.slug, clean, db);
    const similarity = rendered && refBmp ? wordSimilarity(refBmp, rendered) : 0;
    out.push({ ...c, similarity, matchPct: toMatchPct(similarity) });
  }
  out.sort((a, b) => b.similarity - a.similarity);
  return out;
}

function wordBitmapToDataUrl(bmp: WordBitmap): string {
  const c = document.createElement("canvas");
  c.width = bmp.w;
  c.height = bmp.h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(bmp.w, bmp.h);
  for (let i = 0; i < bmp.w * bmp.h; i++) {
    const v = (bmp.data[i] as number) ? 0 : 255;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

function dataUrlToWordBitmap(url: string): Promise<WordBitmap | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, c.width, c.height).data;
      const out = new Uint8Array(c.width * c.height);
      for (let i = 0; i < out.length; i++) out[i] = (px[i * 4] as number) < 128 ? 1 : 0;
      resolve({ data: out, w: c.width, h: c.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
