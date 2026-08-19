export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  srcDir: 'src/',
  css: ['~/app/styles/main.scss'],
  typescript: {
    strict: true,
    typeCheck: false,
  },
  imports: {
    dirs: [],
  },
});
