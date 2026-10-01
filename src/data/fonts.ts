// Curated font database for the Font Identifier site.
// Every entry is a real, freely-available Google Font. Traits drive the Q&A
// wizard scoring and the "similar fonts" computation.

export type FontCategory = "serif" | "sans-serif" | "display" | "handwritten" | "monospace";
export type SerifStyle = "none" | "slab" | "bracketed" | "modern" | "oldstyle";
export type Contrast = "low" | "medium" | "high";
export type WeightFeel = "light" | "regular" | "bold" | "black";
export type XHeight = "low" | "medium" | "high";

export const MOODS = [
  "elegant",
  "formal",
  "friendly",
  "playful",
  "bold",
  "modern",
  "techy",
  "vintage",
  "editorial",
  "minimal",
  "luxurious",
  "casual",
] as const;

export interface FontEntry {
  name: string;
  slug: string;
  category: FontCategory;
  serif: SerifStyle;
  contrast: Contrast;
  weight: WeightFeel;
  xHeight: XHeight;
  moods: string[];
  weights: number[];
  popularity: number; // 1-100, rough ordering for defaults
  tags: string[];
  description: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function f(
  name: string,
  category: FontCategory,
  serif: SerifStyle,
  contrast: Contrast,
  weight: WeightFeel,
  xHeight: XHeight,
  moods: string[],
  weights: number[],
  popularity: number,
  tags: string[],
  description: string,
): FontEntry {
  return { name, slug: slugify(name), category, serif, contrast, weight, xHeight, moods, weights, popularity, tags, description };
}

export const FONTS: FontEntry[] = [
  // ---------------- SERIF ----------------
  f("Playfair Display", "serif", "modern", "high", "bold", "medium",
    ["elegant", "editorial", "luxurious"], [400, 500, 600, 700, 800, 900], 98,
    ["headline", "fashion", "wedding", "luxury", "didone"],
    "A high-contrast Didone serif made for headlines — fashion editorials, wedding stationery and luxury branding."),
  f("Merriweather", "serif", "oldstyle", "low", "regular", "high",
    ["editorial", "friendly", "formal"], [300, 400, 700, 900], 92,
    ["body", "reading", "book", "blog"],
    "A sturdy text serif designed for comfortable long-form reading on screens."),
  f("Lora", "serif", "bracketed", "medium", "regular", "medium",
    ["elegant", "editorial", "friendly"], [400, 500, 600, 700], 88,
    ["body", "calligraphic", "blog"],
    "A calligraphy-rooted serif with soft curves — elegant for body text and quotes."),
  f("PT Serif", "serif", "bracketed", "medium", "regular", "high",
    ["formal", "editorial"], [400, 700], 80,
    ["body", "russian", "cyrillic"],
    "A transitional serif built for legibility, with wide proportions and strong serifs."),
  f("Cormorant Garamond", "serif", "modern", "high", "light", "low",
    ["elegant", "luxurious", "formal"], [300, 400, 500, 600, 700], 85,
    ["wedding", "fashion", "light", "delicate"],
    "A delicate, light Garamond revival — airy and refined for invitations and luxury headlines."),
  f("EB Garamond", "serif", "oldstyle", "medium", "regular", "medium",
    ["elegant", "formal", "editorial"], [400, 500, 600, 700, 800], 86,
    ["classic", "book", "body"],
    "A faithful open-source revival of the classic Garamond — timeless for books and formal documents."),
  f("Crimson Pro", "serif", "oldstyle", "medium", "regular", "medium",
    ["editorial", "formal"], [400, 500, 600, 700], 74,
    ["book", "body", "reading"],
    "A book serif with a slightly narrow build — crisp for dense editorial text."),
  f("Libre Baskerville", "serif", "oldstyle", "medium", "regular", "high",
    ["formal", "editorial"], [400, 700], 82,
    ["body", "book", "classic"],
    "A screen-optimized Baskerville with a tall x-height — classic and highly readable."),
  f("Bodoni Moda", "serif", "modern", "high", "regular", "medium",
    ["elegant", "luxurious", "editorial"], [400, 500, 600, 700, 800, 900], 84,
    ["fashion", "didone", "vogue", "headline"],
    "The iconic high-contrast Didone — dramatic thick-thin strokes for fashion and luxury headlines."),
  f("Cinzel", "serif", "modern", "medium", "regular", "medium",
    ["elegant", "luxurious", "formal"], [400, 500, 600, 700, 800, 900], 83,
    ["roman", "inscriptional", "all-caps", "luxury", "wedding"],
    "An inscriptional Roman serif inspired by classical lettering — stately in all caps."),
  f("Marcellus", "serif", "oldstyle", "medium", "regular", "medium",
    ["elegant", "luxurious"], [400], 72,
    ["roman", "wedding", "luxury"],
    "A soft flared serif with Roman proportions — calm and premium for short headlines."),
  f("Italiana", "serif", "modern", "high", "light", "medium",
    ["elegant", "luxurious"], [400], 70,
    ["fashion", "thin", "wedding"],
    "An ultra-thin Italian-style serif — whisper-light elegance for luxury branding."),
  f("Fraunces", "serif", "oldstyle", "medium", "bold", "medium",
    ["editorial", "playful", "modern"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 90,
    ["variable", "wonky", "headline", "soft"],
    "A quirky variable serif with 'wonk' axes — warm, characterful headlines with an editorial edge."),
  f("Source Serif 4", "serif", "bracketed", "medium", "regular", "medium",
    ["formal", "editorial"], [400, 600, 700], 78,
    ["body", "adobe", "reading"],
    "Adobe's workhorse text serif — neutral and dependable for interfaces and documents."),
  f("Noto Serif", "serif", "bracketed", "medium", "regular", "medium",
    ["formal", "editorial"], [400, 500, 600, 700], 81,
    ["body", "multilingual"],
    "The serif companion to Noto Sans — a clean, universal text serif for global content."),
  f("Zilla Slab", "serif", "slab", "low", "regular", "medium",
    ["techy", "friendly", "modern"], [300, 400, 500, 600, 700], 79,
    ["slab", "mozilla", "tech"],
    "Mozilla's friendly slab serif — sturdy and approachable with a techy personality."),
  f("Roboto Slab", "serif", "slab", "low", "regular", "medium",
    ["modern", "friendly", "formal"], [400, 500, 600, 700, 800, 900], 87,
    ["slab", "headline", "tech"],
    "A geometric slab serif with open curves — confident headlines and UI accents."),
  f("Arvo", "serif", "slab", "low", "bold", "high",
    ["friendly", "modern", "bold"], [400, 700], 77,
    ["slab", "chunky", "headline"],
    "A chunky slab serif with generous proportions — bold and friendly for display use."),
  f("Bitter", "serif", "slab", "medium", "regular", "high",
    ["editorial", "friendly"], [400, 500, 600, 700, 800], 75,
    ["slab", "body", "reading"],
    "A slab serif tuned for e-ink and long reading — robust with a literary feel."),
  f("Alegreya", "serif", "oldstyle", "medium", "regular", "medium",
    ["editorial", "friendly"], [400, 500, 700, 800, 900], 73,
    ["book", "body", "literature"],
    "A dynamic serif with a calligraphic rhythm — lively for literature and long texts."),
  f("Vollkorn", "serif", "oldstyle", "medium", "regular", "medium",
    ["editorial", "formal"], [400, 500, 600, 700, 800, 900], 71,
    ["book", "body", "german"],
    "A sturdy German book serif — quiet, dark texture for serious reading."),
  f("Domine", "serif", "bracketed", "medium", "bold", "high",
    ["formal", "editorial"], [400, 500, 600, 700], 69,
    ["headline", "body"],
    "A strong transitional serif that holds up at both headline and text sizes."),
  f("Old Standard TT", "serif", "modern", "medium", "regular", "medium",
    ["formal", "editorial"], [400, 700], 62,
    ["classic", "academic"],
    "A classic modern-serif in the Russian academic tradition — precise and formal."),
  f("Cardo", "serif", "oldstyle", "medium", "regular", "medium",
    ["formal", "editorial"], [400, 700], 64,
    ["academic", "classic", "book"],
    "A large, classical old-style serif designed for scholarly and biblical texts."),
  f("Gilda Display", "serif", "modern", "high", "regular", "medium",
    ["elegant", "luxurious"], [400], 60,
    ["headline", "didone"],
    "A delicate high-contrast display serif — refined for short elegant headlines."),
  f("Prata", "serif", "modern", "high", "regular", "medium",
    ["elegant", "luxurious"], [400], 66,
    ["headline", "didone", "fashion"],
    "A graceful Didone with distinctive letterforms — boutique elegance for headlines."),
  f("Yeseva One", "serif", "bracketed", "medium", "bold", "medium",
    ["elegant", "friendly"], [400], 68,
    ["headline", "display", "wedding"],
    "A feminine display serif with calligraphic flair — decorative yet readable headlines."),
  f("Abril Fatface", "serif", "modern", "high", "black", "medium",
    ["elegant", "editorial", "bold"], [400], 89,
    ["didone", "poster", "fashion", "fat"],
    "An ultra-bold Didone for posters and mastheads — pure typographic drama."),
  // ---------------- SANS-SERIF ----------------
  f("Inter", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "techy"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 100,
    ["ui", "interface", "app", "body"],
    "The default UI sans of the modern web — neutral, legible, endlessly versatile."),
  f("Roboto", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "friendly"], [100, 300, 400, 500, 700, 900], 99,
    ["ui", "android", "google", "body"],
    "Google's grotesque sans — mechanical yet friendly, the Android system voice."),
  f("Open Sans", "sans-serif", "none", "low", "regular", "high",
    ["friendly", "minimal", "modern"], [300, 400, 500, 600, 700, 800], 97,
    ["ui", "body", "web"],
    "A humanist sans optimized for on-screen legibility — the web's workhorse."),
  f("Lato", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "modern", "minimal"], [100, 300, 400, 700, 900], 95,
    ["body", "corporate", "warm"],
    "A warm humanist sans with semi-rounded details — corporate-friendly and calm."),
  f("Montserrat", "sans-serif", "none", "low", "bold", "medium",
    ["modern", "bold", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 96,
    ["geometric", "headline", "urban", "logo"],
    "A geometric sans inspired by urban signage — confident headlines and logos."),
  f("Poppins", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "modern", "playful"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 94,
    ["geometric", "rounded", "logo"],
    "A geometric sans with near-perfect circles — friendly and modern for brands."),
  f("Nunito", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "playful", "casual"], [200, 300, 400, 500, 600, 700, 800, 900, 1000], 88,
    ["rounded", "soft", "ui"],
    "A rounded sans with soft terminals — warm and approachable for friendly interfaces."),
  f("Raleway", "sans-serif", "none", "low", "light", "medium",
    ["elegant", "modern", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 90,
    ["thin", "headline", "fashion"],
    "An elegant thin geometric sans — airy headlines with a fashion sensibility."),
  f("Oswald", "sans-serif", "none", "low", "bold", "medium",
    ["bold", "modern", "strong"], [200, 300, 400, 500, 600, 700], 91,
    ["condensed", "headline", "poster"],
    "A condensed gothic for headlines — tall, narrow and assertive."),
  f("Bebas Neue", "sans-serif", "none", "low", "bold", "medium",
    ["bold", "strong", "modern"], [400], 93,
    ["condensed", "all-caps", "poster", "headline"],
    "The all-caps condensed poster sans — loud, tall headlines that demand attention."),
  f("Archivo", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "bold"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 87,
    ["grotesque", "variable", "headline"],
    "A versatile grotesque with an expanded family — from text to black display weights."),
  f("Work Sans", "sans-serif", "none", "low", "regular", "medium",
    ["modern", "friendly", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 85,
    ["grotesque", "ui"],
    "An early-grotesque revival tuned for screens — honest and hardworking."),
  f("DM Sans", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "techy"], [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], 89,
    ["geometric", "ui", "startup"],
    "A geometric-humanist hybrid with a low x-height quirk — the startup favorite."),
  f("Manrope", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "techy"], [200, 300, 400, 500, 600, 700, 800], 88,
    ["geometric", "ui", "app"],
    "A clean geometric sans with open apertures — modern app interfaces love it."),
  f("Outfit", "sans-serif", "none", "low", "regular", "medium",
    ["modern", "techy", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 86,
    ["geometric", "ui"],
    "A crisp geometric sans with a techy edge — sharp for dashboards and brands."),
  f("Plus Jakarta Sans", "sans-serif", "none", "low", "regular", "high",
    ["modern", "friendly", "minimal"], [200, 300, 400, 500, 600, 700, 800], 87,
    ["ui", "app", "rounded"],
    "Jakarta's humanist sans — slightly rounded, highly legible, quietly distinctive."),
  f("Public Sans", "sans-serif", "none", "low", "regular", "high",
    ["formal", "minimal", "modern"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 80,
    ["government", "ui", "neutral"],
    "The US government's open sans — neutral, accessible, built for public interfaces."),
  f("Source Sans 3", "sans-serif", "none", "low", "regular", "medium",
    ["modern", "minimal", "friendly"], [200, 300, 400, 500, 600, 700, 800, 900], 84,
    ["adobe", "ui", "body"],
    "Adobe's open humanist sans — the clean UI companion to Source Serif."),
  f("Noto Sans", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "formal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 83,
    ["multilingual", "ui", "body"],
    "Google's universal sans covering 1,000+ languages — clarity without borders."),
  f("Fira Sans", "sans-serif", "none", "low", "regular", "medium",
    ["techy", "modern", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 78,
    ["mozilla", "ui", "humanist"],
    "Mozilla's humanist sans for Firefox OS — legible with a technical warmth."),
  f("Ubuntu", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "modern", "techy"], [300, 400, 500, 700], 82,
    ["linux", "humanist", "ui"],
    "The Ubuntu OS typeface — humanist, open and unmistakably techy-friendly."),
  f("PT Sans", "sans-serif", "none", "low", "regular", "high",
    ["formal", "minimal"], [400, 700], 74,
    ["cyrillic", "body", "ui"],
    "A sturdy humanist sans with Cyrillic roots — dependable for text and UI."),
  f("Hind", "sans-serif", "none", "low", "regular", "high",
    ["friendly", "minimal"], [300, 400, 500, 600, 700], 72,
    ["devanagari", "multilingual", "body"],
    "A clean sans designed alongside Devanagari — balanced for multilingual text."),
  f("Mukta", "sans-serif", "none", "low", "regular", "high",
    ["friendly", "minimal"], [200, 300, 400, 500, 600, 700, 800], 70,
    ["devanagari", "body"],
    "A monolinear Devanagari-Latin sans — simple and highly readable."),
  f("Karla", "sans-serif", "none", "low", "regular", "medium",
    ["playful", "modern", "friendly"], [200, 300, 400, 500, 600, 700, 800], 76,
    ["grotesque", "quirky", "ui"],
    "A quirky grotesque with unexpected curves — playful but professional."),
  f("Cabin", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "modern", "minimal"], [400, 500, 600, 700], 75,
    ["humanist", "body", "ui"],
    "A humanist sans with softened edges — warm for body text and interfaces."),
  f("Quicksand", "sans-serif", "none", "low", "regular", "medium",
    ["playful", "friendly", "casual"], [300, 400, 500, 600, 700], 81,
    ["rounded", "geometric", "soft"],
    "A rounded geometric sans with a soft, youthful bounce."),
  f("Comfortaa", "sans-serif", "none", "low", "light", "medium",
    ["playful", "friendly", "casual"], [300, 400, 500, 600, 700], 77,
    ["rounded", "geometric", "logo"],
    "An ultra-rounded geometric sans — bubbly and modern for friendly brands."),
  f("Jost", "sans-serif", "none", "low", "regular", "medium",
    ["elegant", "modern", "minimal"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 79,
    ["geometric", "futura", "fashion"],
    "A Futura-inspired geometric sans — refined minimalism for fashion and design."),
  f("Josefin Sans", "sans-serif", "none", "low", "light", "medium",
    ["elegant", "modern", "minimal"], [100, 200, 300, 400, 500, 600, 700], 78,
    ["geometric", "thin", "vintage"],
    "A vintage-geometric sans with tall elegance — 1930s charm, modern spacing."),
  f("Exo 2", "sans-serif", "none", "low", "regular", "medium",
    ["techy", "modern", "bold"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 76,
    ["futuristic", "sci-fi", "headline"],
    "A futuristic sans with a technical skeleton — sci-fi headlines and gaming UI."),
  f("Barlow", "sans-serif", "none", "low", "regular", "medium",
    ["modern", "minimal", "techy"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 83,
    ["grotesque", "ui", "california"],
    "A California grotesque with a slightly rounded warmth — great for UI and wayfinding."),
  f("Barlow Condensed", "sans-serif", "none", "low", "regular", "medium",
    ["bold", "modern", "strong"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 82,
    ["condensed", "headline", "poster"],
    "The condensed cut of Barlow — punchy narrow headlines with industrial character."),
  f("Titillium Web", "sans-serif", "none", "low", "regular", "medium",
    ["techy", "modern", "formal"], [200, 300, 400, 600, 700, 900], 73,
    ["ui", "academic"],
    "Born in an Italian university — a technical sans with open, academic clarity."),
  f("Heebo", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal", "friendly"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 77,
    ["hebrew", "multilingual", "ui"],
    "A Hebrew-Latin sans with a warm, contemporary voice for global interfaces."),
  f("Rubik", "sans-serif", "none", "low", "regular", "medium",
    ["playful", "modern", "friendly"], [300, 400, 500, 600, 700, 800, 900], 85,
    ["rounded", "hebrew", "ui"],
    "A slightly-rounded sans with rounded corners — cheerful for UI and branding."),
  f("Mulish", "sans-serif", "none", "low", "regular", "medium",
    ["modern", "minimal", "friendly"], [200, 300, 400, 500, 600, 700, 800, 900, 1000], 84,
    ["ui", "body", "minimal"],
    "A minimalist sans for long text — quiet, clean and highly legible."),
  f("Assistant", "sans-serif", "none", "low", "regular", "high",
    ["modern", "minimal"], [200, 300, 400, 500, 600, 700, 800], 71,
    ["hebrew", "ui"],
    "A neutral Hebrew-Latin sans — understated clarity for interfaces."),
  f("Cantarell", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "modern"], [400, 700], 68,
    ["humanist", "gnome", "ui"],
    "GNOME's humanist sans — open and readable at small UI sizes."),
  f("Dosis", "sans-serif", "none", "low", "light", "medium",
    ["playful", "modern", "casual"], [200, 300, 400, 500, 600, 700, 800], 74,
    ["rounded", "thin", "headline"],
    "A rounded, extra-light-friendly sans — airy and informal for youthful brands."),
  f("Varela Round", "sans-serif", "none", "low", "regular", "medium",
    ["friendly", "playful", "casual"], [400], 72,
    ["rounded", "soft", "logo"],
    "A softly rounded sans drawn for a coffee brand — gentle and welcoming."),
  f("Baloo 2", "sans-serif", "none", "low", "bold", "medium",
    ["playful", "friendly", "bold"], [400, 500, 600, 700, 800], 80,
    ["rounded", "chunky", "devanagari"],
    "A chunky rounded sans with Indian-script roots — joyful and bold."),
  f("Fredoka", "sans-serif", "none", "low", "regular", "medium",
    ["playful", "friendly", "casual"], [300, 400, 500, 600, 700], 79,
    ["rounded", "soft", "logo"],
    "A soft rounded sans with a hand-drawn warmth — friendly logos and headlines."),
  f("League Spartan", "sans-serif", "none", "low", "bold", "medium",
    ["bold", "modern", "strong"], [100, 200, 300, 400, 500, 600, 700, 800, 900], 78,
    ["geometric", "headline", "strong"],
    "A strong geometric sans with a modernist backbone — bold, compact headlines."),
  f("Anton", "sans-serif", "none", "low", "black", "medium",
    ["bold", "strong"], [400], 86,
    ["condensed", "poster", "headline", "impact"],
    "A heavyweight condensed sans — maximum impact for posters and titles."),
  f("Archivo Black", "sans-serif", "none", "low", "black", "medium",
    ["bold", "strong", "modern"], [400], 81,
    ["heavy", "headline", "poster"],
    "The black weight of Archivo, built for display — dense, confident headlines."),
  f("League Gothic", "sans-serif", "none", "low", "regular", "medium",
    ["bold", "vintage", "strong"], [400], 69,
    ["condensed", "vintage", "poster"],
    "A revival of the classic gothic condensed — vintage poster authority."),
  f("Fjalla One", "sans-serif", "none", "low", "regular", "medium",
    ["bold", "modern", "strong"], [400], 71,
    ["condensed", "headline"],
    "A medium-contrast condensed sans — punchy headlines with Scandinavian restraint."),
  // ---------------- DISPLAY ----------------
  f("Alfa Slab One", "display", "slab", "low", "black", "medium",
    ["bold", "vintage", "strong"], [400], 84,
    ["slab", "poster", "heavy", "headline"],
    "An extreme slab serif for display — heavy, vintage poster muscle."),
  f("Bungee", "display", "none", "low", "regular", "medium",
    ["playful", "bold", "modern"], [400], 82,
    ["signage", "urban", "poster"],
    "A signage-inspired display face for vertical impact — urban and loud."),
  f("Monoton", "display", "none", "low", "regular", "medium",
    ["vintage", "playful"], [400], 74,
    ["neon", "inline", "retro", "deco"],
    "A retro inline display evoking neon marquees — pure vintage showmanship."),
  f("Press Start 2P", "display", "none", "low", "regular", "medium",
    ["techy", "playful", "vintage"], [400], 85,
    ["pixel", "retro", "gaming", "8-bit"],
    "The 8-bit pixel font — instant retro-gaming nostalgia in every glyph."),
  f("Rye", "display", "bracketed", "medium", "regular", "medium",
    ["vintage", "playful"], [400], 70,
    ["western", "circus", "decorative"],
    "A tuscan-style western display — circus posters and saloon signage."),
  f("Smokum", "display", "bracketed", "medium", "regular", "medium",
    ["vintage", "playful"], [400], 58,
    ["western", "decorative"],
    "Another wild-west tuscan — ornamental and unapologetically vintage."),
  f("Ewert", "display", "none", "low", "regular", "medium",
    ["playful", "vintage"], [400], 60,
    ["ornamental", "decorative", "pattern"],
    "A decorative face built from wood-type ornaments — pattern-like display type."),
  f("Fascinate", "display", "none", "low", "bold", "medium",
    ["playful", "vintage"], [400, 700, 900], 66,
    ["deco", "inline", "retro"],
    "A deco inline display with roaring-twenties flair — glamorous and bold."),
  f("Titan One", "display", "none", "low", "regular", "medium",
    ["playful", "bold"], [400], 76,
    ["chunky", "poster", "cartoon"],
    "A chunky cartoon display — bouncy, heavy headlines with a smile."),
  f("Luckiest Guy", "display", "none", "low", "regular", "medium",
    ["playful", "bold"], [400], 75,
    ["cartoon", "chunky", "poster"],
    "A jolly heavy display straight from cartoon lettering — fun with weight."),
  f("Bangers", "display", "none", "low", "regular", "medium",
    ["playful", "bold", "vintage"], [400], 77,
    ["comic", "cartoon", "poster"],
    "Mid-century comic-book lettering — action-packed display energy."),
  f("Creepster", "display", "none", "low", "regular", "medium",
    ["playful", "vintage"], [400], 68,
    ["horror", "halloween", "spooky"],
    "A dripping horror display — Halloween posters and spooky headlines."),
  f("Nosifer", "display", "none", "low", "regular", "medium",
    ["playful"], [400], 62,
    ["horror", "dripping", "halloween"],
    "Melting, oozing display letterforms — horror with a grin."),
  f("Black Ops One", "display", "none", "low", "regular", "medium",
    ["bold", "strong", "techy"], [400], 72,
    ["military", "stencil", "poster"],
    "A stencil-military display — rugged headlines with tactical attitude."),
  f("Audiowide", "display", "none", "low", "regular", "medium",
    ["techy", "modern", "bold"], [400], 71,
    ["futuristic", "wide", "sci-fi"],
    "A wide futuristic display — sci-fi interfaces and synthwave artwork."),
  f("Orbitron", "display", "none", "low", "bold", "medium",
    ["techy", "modern", "bold"], [400, 500, 600, 700, 800, 900], 83,
    ["futuristic", "geometric", "sci-fi", "space"],
    "Geometric sci-fi letterforms — the sound of the future in type."),
  f("Michroma", "display", "none", "low", "regular", "medium",
    ["techy", "modern", "minimal"], [400], 67,
    ["futuristic", "wide", "minimal"],
    "A wide, minimal futuristic sans — quiet technology, wide spacing."),
  f("Syncopate", "display", "none", "low", "bold", "medium",
    ["techy", "modern", "minimal"], [400, 700], 65,
    ["futuristic", "wide", "geometric"],
    "Wide geometric capitals with a rhythmic pulse — modern and airy."),
  f("Cinzel Decorative", "display", "modern", "medium", "bold", "medium",
    ["elegant", "luxurious", "vintage"], [400, 700, 900], 69,
    ["roman", "ornamental", "wedding"],
    "Cinzel's ornamental sibling — decorative Roman capitals for special occasions."),
  f("Metal Mania", "display", "none", "low", "regular", "medium",
    ["bold", "vintage"], [400], 61,
    ["metal", "rock", "heavy"],
    "A heavy-metal display with jagged edges — rock posters and band merch."),
  f("Pirata One", "display", "none", "low", "regular", "medium",
    ["vintage", "playful"], [400], 63,
    ["blackletter", "gothic", "pirate"],
    "A pirate-style blackletter — swashbuckling display with gothic roots."),
  f("UnifrakturMaguntia", "display", "none", "low", "regular", "low",
    ["vintage", "formal"], [400], 59,
    ["blackletter", "fraktur", "gothic"],
    "A classic Fraktur blackletter — old-German manuscript authority."),
  f("New Rocker", "display", "none", "low", "regular", "medium",
    ["bold", "vintage"], [400], 57,
    ["tattoo", "rock", "gothic"],
    "A tattoo-flavored blackletter — rock-and-roll gothic display."),
  f("Trade Winds", "display", "none", "low", "regular", "medium",
    ["vintage", "playful"], [400], 56,
    ["tiki", "retro", "decorative"],
    "A breezy tiki-style display — retro vacation vibes in letterform."),
  f("Rubik Glitch", "display", "none", "low", "regular", "medium",
    ["techy", "playful", "modern"], [400], 64,
    ["glitch", "distorted", "poster"],
    "Rubik shattered into glitch fragments — digital-decay display type."),
  f("Rubik Burned", "display", "none", "low", "regular", "medium",
    ["playful", "bold"], [400], 60,
    ["distressed", "grunge", "poster"],
    "A charred, eroded Rubik — grunge posters and distressed headlines."),
  f("Rubik Storm", "display", "none", "low", "regular", "medium",
    ["playful", "bold"], [400], 58,
    ["distressed", "grunge"],
    "Rubik weathered by a storm — rough display texture with energy."),
  f("Rubik Marker Hatch", "display", "none", "low", "regular", "medium",
    ["playful", "casual"], [400], 62,
    ["marker", "hand-drawn", "sketch"],
    "A marker-sketched Rubik — hand-drawn display with hatched texture."),
  // ---------------- HANDWRITTEN ----------------
  f("Pacifico", "handwritten", "none", "low", "regular", "medium",
    ["playful", "friendly", "casual"], [400], 90,
    ["script", "retro", "logo", "surf"],
    "The classic retro surf script — flowing, fun and endlessly friendly."),
  f("Dancing Script", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "playful", "casual"], [400, 500, 600, 700], 89,
    ["script", "wedding", "casual"],
    "A lively casual script with bouncing baseline — invitations and friendly brands."),
  f("Caveat", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly", "playful"], [400, 500, 600, 700], 87,
    ["handwriting", "note", "marker"],
    "Natural handwriting with a marker feel — annotations, notes and informal UI."),
  f("Satisfy", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly", "playful"], [400], 78,
    ["script", "retro", "logo"],
    "A 1950s-style casual script — retro diner charm for logos."),
  f("Great Vibes", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "luxurious"], [400], 84,
    ["script", "wedding", "calligraphy", "formal"],
    "A formal copperplate-style script — wedding invitations at their most elegant."),
  f("Allura", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "luxurious"], [400], 76,
    ["script", "wedding", "calligraphy"],
    "A refined calligraphic script — graceful swashes for formal occasions."),
  f("Parisienne", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "luxurious", "playful"], [400], 73,
    ["script", "french", "wedding"],
    "A French-flavored casual script — chic and romantic with a wink."),
  f("Sacramento", "handwritten", "none", "low", "regular", "medium",
    ["elegant", "casual"], [400], 75,
    ["script", "monoline", "wedding"],
    "A monoline script with vintage soul — simple, sweet and versatile."),
  f("Shadows Into Light", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly", "playful"], [400], 82,
    ["handwriting", "note", "thin"],
    "Thin, airy handwriting — like a note left on the fridge, in the best way."),
  f("Permanent Marker", "handwritten", "none", "low", "bold", "medium",
    ["casual", "playful", "bold"], [400], 83,
    ["marker", "handwriting", "bold"],
    "A fat marker scrawl — bold annotations and playful emphasis."),
  f("Kalam", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly"], [300, 400, 700], 74,
    ["handwriting", "devanagari", "note"],
    "Handwriting with Indian-script harmony — informal and warm."),
  f("Gochi Hand", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400], 71,
    ["handwriting", "note"],
    "A neat casual hand — tidy notes with personality."),
  f("Indie Flower", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful", "friendly"], [400], 72,
    ["handwriting", "cute"],
    "A cute, loopy hand — playful notes and youthful designs."),
  f("Patrick Hand", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly"], [400], 70,
    ["handwriting", "note", "neat"],
    "Neat print handwriting — friendly clarity for informal text."),
  f("Homemade Apple", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400], 66,
    ["handwriting", "cute", "note"],
    "A charmingly imperfect hand — homemade warmth for personal projects."),
  f("Nothing You Could Do", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400, 500, 600, 700], 65,
    ["handwriting", "note"],
    "Quick-jot handwriting — the authentic look of a hurried note."),
  f("Reenie Beanie", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400, 500], 63,
    ["handwriting", "note"],
    "A bouncy teen hand — energetic and informal."),
  f("Rock Salt", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful", "vintage"], [400], 67,
    ["handwriting", "grunge", "note"],
    "A rough felt-tip hand — grungy notes with attitude."),
  f("Covered By Your Grace", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400], 64,
    ["handwriting", "marker", "note"],
    "A casual marker hand — relaxed notes and doodles."),
  f("Just Another Hand", "handwritten", "none", "low", "regular", "medium",
    ["casual"], [400], 60,
    ["handwriting", "note"],
    "An everyday hand — unpretentious and readable."),
  f("Marck Script", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "casual"], [400], 68,
    ["script", "cyrillic", "wedding"],
    "A Cyrillic-friendly brush script — elegant with a hand-painted feel."),
  f("Yellowtail", "handwritten", "none", "low", "regular", "medium",
    ["playful", "casual", "vintage"], [400], 74,
    ["script", "retro", "logo"],
    "A flat-brush retro script — vintage signage with a smile."),
  f("Kaushan Script", "handwritten", "none", "medium", "regular", "medium",
    ["playful", "casual"], [400], 72,
    ["script", "brush", "logo"],
    "A bold brush script — confident strokes for logos and headlines."),
  f("Alex Brush", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "luxurious"], [400], 73,
    ["script", "calligraphy", "wedding"],
    "A delicate calligraphic brush script — refined for formal stationery."),
  f("Tangerine", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "playful"], [400, 700], 69,
    ["script", "calligraphy"],
    "A tall, slender calligraphic hand — graceful with a modern twist."),
  f("Pinyon Script", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "luxurious", "formal"], [400], 67,
    ["script", "copperplate", "wedding"],
    "An elegant roundhand script — formal invitations and fine stationery."),
  f("Herr Von Muellerhoff", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "vintage"], [400], 61,
    ["script", "vintage", "formal"],
    "A vintage German-style script — old-world formality with flair."),
  f("Qwigley", "handwritten", "none", "medium", "regular", "medium",
    ["elegant", "playful"], [400], 59,
    ["script", "handwriting"],
    "A casual elegant hand — personal notes with calligraphic lift."),
  f("Lobster", "handwritten", "none", "low", "bold", "medium",
    ["playful", "vintage", "bold"], [400], 88,
    ["script", "retro", "logo", "bold"],
    "The bold retro script that defined a decade — confident signage lettering."),
  f("Amatic SC", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful", "minimal"], [400, 700], 79,
    ["hand-drawn", "narrow", "all-caps"],
    "A narrow hand-drawn all-caps face — charming for titles and labels."),
  f("Gloria Hallelujah", "handwritten", "none", "low", "regular", "medium",
    ["casual", "playful"], [400], 68,
    ["handwriting", "note"],
    "A cheerful casual hand — upbeat notes and friendly headlines."),
  f("Neucha", "handwritten", "none", "low", "regular", "medium",
    ["casual", "friendly"], [400], 62,
    ["handwriting", "cyrillic", "note"],
    "A direct, honest hand — straightforward informal lettering."),
  // ---------------- MONOSPACE ----------------
  f("Roboto Mono", "monospace", "none", "low", "regular", "medium",
    ["techy", "modern", "minimal"], [100, 200, 300, 400, 500, 600, 700], 86,
    ["code", "terminal", "typewriter"],
    "A monospace companion to Roboto — clean code and terminal text."),
  f("Source Code Pro", "monospace", "none", "low", "regular", "medium",
    ["techy", "modern"], [200, 300, 400, 500, 600, 700, 800, 900], 84,
    ["code", "adobe", "terminal"],
    "Adobe's open-source coding face — highly legible at small sizes."),
  f("JetBrains Mono", "monospace", "none", "low", "regular", "high",
    ["techy", "modern"], [100, 200, 300, 400, 500, 600, 700, 800], 85,
    ["code", "developer", "terminal"],
    "A developer-first mono with taller x-height — built for long coding sessions."),
  f("Fira Code", "monospace", "none", "low", "regular", "medium",
    ["techy", "modern"], [300, 400, 500, 600, 700], 83,
    ["code", "ligatures", "developer"],
    "The coding font famous for ligatures — arrows and operators that flow."),
  f("Space Mono", "monospace", "none", "low", "regular", "medium",
    ["techy", "vintage", "playful"], [400, 700], 78,
    ["code", "retro", "typewriter"],
    "A quirky retro-mono with typewriter soul — code with character."),
  f("IBM Plex Mono", "monospace", "none", "low", "regular", "medium",
    ["techy", "formal", "modern"], [100, 200, 300, 400, 500, 600, 700], 80,
    ["code", "ibm", "terminal"],
    "IBM's engineered mono — precise, corporate and quietly distinctive."),
  f("Courier Prime", "monospace", "slab", "low", "regular", "medium",
    ["vintage", "formal"], [400, 700], 76,
    ["typewriter", "screenplay", "retro"],
    "The screenplay standard — authentic typewriter rhythm for scripts."),
  f("Anonymous Pro", "monospace", "none", "low", "regular", "medium",
    ["techy", "minimal"], [400, 700], 70,
    ["code", "terminal"],
    "A no-nonsense coding mono — plain, honest and readable."),
  f("Ubuntu Mono", "monospace", "none", "low", "regular", "medium",
    ["techy", "friendly"], [400, 700], 72,
    ["code", "linux", "terminal"],
    "The Ubuntu terminal voice — friendly monospace for developers."),
  f("Inconsolata", "monospace", "none", "low", "regular", "medium",
    ["techy", "minimal", "elegant"], [200, 300, 400, 500, 600, 700, 800, 900], 74,
    ["code", "humanist", "terminal"],
    "A humanist mono with elegant proportions — code that reads like prose."),
  f("DM Mono", "monospace", "none", "low", "light", "medium",
    ["techy", "modern", "minimal"], [300, 400, 500], 71,
    ["code", "terminal"],
    "A light, low-contrast mono — modern minimalism for code snippets."),
  f("Major Mono Display", "monospace", "none", "low", "regular", "medium",
    ["techy", "playful", "modern"], [400], 63,
    ["display", "geometric", "poster"],
    "A geometric mono pushed to display size — poster headlines with a code accent."),
];

// ---------------- helpers ----------------

export const fontBySlug = new Map<string, FontEntry>(FONTS.map((f) => [f.slug, f]));

/** Google Fonts CSS URL for a single font entry. */
export function googleFontsUrl(font: FontEntry): string {
  const family = font.name.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${font.weights.join(";")}&display=swap`;
}

/** Combined Google Fonts CSS URL for many fonts (dedupes by family). */
export function googleFontsUrlMany(fonts: FontEntry[]): string {
  const seen = new Set<string>();
  const fams: string[] = [];
  for (const font of fonts) {
    const family = font.name.replace(/ /g, "+");
    if (seen.has(family)) continue;
    seen.add(family);
    fams.push(`family=${family}:wght@${font.weights.join(";")}`);
  }
  return `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap`;
}

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  serif: "Serif",
  "sans-serif": "Sans-Serif",
  display: "Display",
  handwritten: "Handwritten",
  monospace: "Monospace",
};

export const CATEGORY_DESCRIPTIONS: Record<FontCategory, string> = {
  serif: "Fonts with small feet (serifs) — classic, formal and editorial.",
  "sans-serif": "Clean fonts without serifs — modern, minimal and versatile.",
  display: "Decorative statement fonts — posters, logos and headlines.",
  handwritten: "Script and hand-lettered styles — personal and expressive.",
  monospace: "Fixed-width fonts — code, terminals and typewriter vibes.",
};

function traitSimilarity(a: FontEntry, b: FontEntry): number {
  let score = 0;
  if (a.category === b.category) score += 4;
  if (a.serif === b.serif) score += 2;
  if (a.contrast === b.contrast) score += 2;
  if (a.weight === b.weight) score += 1;
  if (a.xHeight === b.xHeight) score += 1;
  const sharedMoods = a.moods.filter((m) => b.moods.includes(m)).length;
  score += sharedMoods;
  return score;
}

/** Fonts most similar to the given font, excluding itself. */
export function similarFonts(font: FontEntry, count = 6): FontEntry[] {
  return FONTS.filter((f) => f.slug !== font.slug)
    .map((f) => ({ f, s: traitSimilarity(font, f) }))
    .sort((x, y) => y.s - x.s || y.f.popularity - x.f.popularity)
    .slice(0, count)
    .map((x) => x.f);
}

// ---------------- Q&A wizard ----------------

export interface WizardQuestion {
  id: string;
  question: string;
  hint?: string;
  options: { value: string; label: string; blurb?: string }[];
}

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "serif",
    question: "Do the letters have serifs — little feet or slabs at the ends of strokes?",
    hint: "Look at the ends of letters like T, E or n.",
    options: [
      { value: "none", label: "No serifs — clean ends", blurb: "Like Arial or Helvetica" },
      { value: "slab", label: "Thick blocky serifs", blurb: "Heavy rectangular feet" },
      { value: "serif", label: "Yes — thin or bracketed serifs", blurb: "Like Times New Roman" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "style",
    question: "Does it look like handwriting, code, or decoration?",
    options: [
      { value: "handwritten", label: "Handwriting / script", blurb: "Flowing, personal, calligraphic" },
      { value: "monospace", label: "Typewriter / code style", blurb: "Every letter the same width" },
      { value: "display", label: "Decorative / poster style", blurb: "Unusual, loud, statement-making" },
      { value: "plain", label: "None of these — plain text style" },
    ],
  },
  {
    id: "contrast",
    question: "Are the strokes even, or do they alternate thick and thin?",
    hint: "Look at the letter o — is it the same thickness all around?",
    options: [
      { value: "low", label: "Even thickness", blurb: "Strokes look uniform" },
      { value: "high", label: "Thick-and-thin", blurb: "Dramatic contrast, like fashion logos" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "weight",
    question: "How heavy does the font feel overall?",
    options: [
      { value: "light", label: "Light / thin", blurb: "Delicate, airy" },
      { value: "regular", label: "Regular / medium", blurb: "Normal book-text weight" },
      { value: "bold", label: "Bold", blurb: "Thick and strong" },
      { value: "black", label: "Extra heavy", blurb: "Poster-level heaviness" },
    ],
  },
  {
    id: "mood",
    question: "What is the overall vibe?",
    options: [
      { value: "elegant", label: "Elegant / luxurious" },
      { value: "formal", label: "Formal / corporate" },
      { value: "friendly", label: "Friendly / casual" },
      { value: "playful", label: "Playful / fun" },
      { value: "bold", label: "Bold / powerful" },
      { value: "modern", label: "Modern / techy" },
      { value: "vintage", label: "Vintage / retro" },
      { value: "editorial", label: "Editorial / literary" },
    ],
  },
];

export type WizardAnswers = Record<string, string>;

/** Score every font against the wizard answers. Returns sorted matches with 0-100 scores. */
export function scoreWizard(answers: WizardAnswers): { font: FontEntry; score: number }[] {
  const results: { font: FontEntry; score: number }[] = [];

  for (const font of FONTS) {
    let points = 0;
    let max = 0;

    // Q1 serif
    const serifAns = answers["serif"];
    if (serifAns && serifAns !== "unsure") {
      max += 3;
      if (serifAns === "none" && font.serif === "none") points += 3;
      else if (serifAns === "slab" && font.serif === "slab") points += 3;
      else if (serifAns === "serif" && (font.serif === "bracketed" || font.serif === "modern" || font.serif === "oldstyle")) points += 3;
    }

    // Q2 style -> category
    const styleAns = answers["style"];
    if (styleAns && styleAns !== "plain") {
      max += 4;
      if (styleAns === font.category) points += 4;
      else if (styleAns === "display" && font.category === "serif" && font.weight !== "regular") points += 1;
    } else if (styleAns === "plain") {
      max += 2;
      if (font.category === "serif" || font.category === "sans-serif") points += 2;
    }

    // Q3 contrast
    const contrastAns = answers["contrast"];
    if (contrastAns && contrastAns !== "unsure") {
      max += 2;
      if (contrastAns === font.contrast) points += 2;
      else if (contrastAns === "low" && font.contrast === "medium") points += 1;
      else if (contrastAns === "high" && font.contrast === "medium") points += 1;
    }

    // Q4 weight
    const weightAns = answers["weight"];
    if (weightAns) {
      max += 2;
      if (weightAns === font.weight) points += 2;
      else if (
        (weightAns === "light" && font.weight === "regular") ||
        (weightAns === "regular" && (font.weight === "light" || font.weight === "bold")) ||
        (weightAns === "bold" && (font.weight === "regular" || font.weight === "black")) ||
        (weightAns === "black" && font.weight === "bold")
      )
        points += 1;
    }

    // Q5 mood
    const moodAns = answers["mood"];
    if (moodAns) {
      max += 2;
      if (font.moods.includes(moodAns)) points += 2;
    }

    if (max > 0) {
      const normalized = Math.round((points / max) * 100);
      // small popularity nudge so famous fonts surface on ties
      results.push({ font, score: Math.min(99, normalized + Math.round(font.popularity / 100)) });
    }
  }

  return results.sort((a, b) => b.score - a.score || b.font.popularity - a.font.popularity);
}
