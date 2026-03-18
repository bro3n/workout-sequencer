// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  debug: true,
  ssr: false,
  sourcemap: {
    server: true,
    client: true,
  },
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],

  i18n: {
    locales: [
      { code: "fr", iso: "fr-FR", name: "Français", file: "fr.json" },
      { code: "en", iso: "en-US", name: "English", file: "en.json" },
      { code: "es", iso: "es-ES", name: "Español", file: "es.json" },
      { code: "zh", iso: "zh-CN", name: "中文", file: "zh.json" },
    ],
    defaultLocale: "fr",
    restructureDir: "./",
    langDir: "locales",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  colorMode: {
    preference: "dark", // Préférence par défaut
    fallback: "dark", // Valeur de secours
    classSuffix: "", // Utiliser 'dark' au lieu de 'dark-mode'
  },

  app: {
    head: {
      link: [{ rel: "manifest", href: "/manifest.webmanifest" }],
      meta: [{ name: "theme-color", content: "#1e293b" }],
    },
  },

  hooks: {
    // Injecte le build ID dans le service worker après génération
    "nitro:build:public-assets": async (nitro) => {
      const { join } = await import("path");
      const { readFileSync, writeFileSync, existsSync } = await import("fs");
      const swPath = join(nitro.options.output.publicDir, "sw.js");
      if (existsSync(swPath)) {
        const buildId = Date.now().toString();
        const content = readFileSync(swPath, "utf-8");
        writeFileSync(swPath, content.replace("__BUILD_ID__", buildId));
      }
    },
  },
});
