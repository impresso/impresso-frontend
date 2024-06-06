import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import autoprefixer from "autoprefixer"
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools({
      // breaks JSON in i18n - look into it
      // componentInspector: false,
      // https://github.com/nuxt/devtools/issues/572
      // componentInspector: {
      //   cleanHtml: true,
      //   // enabled: false,
      //   // vue: 3
      // }
    }),
    VueI18nPlugin({
      compositionOnly: false,
      strictMessage: false,
      escapeHtml: true,
    })
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
