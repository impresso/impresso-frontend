import { defineConfig } from 'vite'
import path from 'path'
// import vue from '@vitejs/plugin-vue'
import vue from '@vitejs/plugin-vue2'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_PATH || '/',
  plugins: [
    vue(),
    vueI18n({
      // compositionOnly: false,
      include: path.resolve(__dirname, './src/i18n/**'),
    }),
    // VueI18nPlugin({
    //   include: path.resolve(__dirname, './src/i18n/**'),
    //   strictMessage: false,
    //   compositionOnly: false,
    // }),
  ],

  // esbuild: {
  //   jsxFactory: 'h',
  //   jsxFragment: 'Fragment',
  // },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
