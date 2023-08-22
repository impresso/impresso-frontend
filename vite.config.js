import { defineConfig } from 'vite'
import path from 'path'
// import vue from '@vitejs/plugin-vue'
import vue from '@vitejs/plugin-vue2'
// import vueI18n from '@intlify/vite-plugin-vue-i18n'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_PATH || '/',
  plugins: [
    vue(),
    // vueI18n({
    //   // compositionOnly: false,
    //   include: path.resolve(__dirname, './src/i18n/**'),
    // }),
    vueI18n({
      bridge: false,
      include: path.resolve(__dirname, './src/i18n/**'),
      customBlockLangs: ['json'],
      strictMessage: false,
      compositionOnly: false,
    }),
  ],

  // esbuild: {
  //   jsxFactory: 'h',
  //   jsxFragment: 'Fragment',
  // },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vue/composition-api': 'vue',
      'vue-i18n-bridge': 'vue-i18n-bridge/dist/vue-i18n-bridge.runtime.esm-bundler.js',
      //'vue-i18n': path.resolve(__dirname, './node_modules/vue-i18n/dist/vue-i18n.common.js'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
