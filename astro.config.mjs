import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://crunchyscore.app",
  outDir: "public",
  publicDir: "static",
  integrations: [tailwind(), sitemap(), icon(), mdx()]
});