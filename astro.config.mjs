import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://font-identifier.pages.dev",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
