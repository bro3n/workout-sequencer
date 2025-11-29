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
});
