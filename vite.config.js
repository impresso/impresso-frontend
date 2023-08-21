import { defineConfig } from 'vite'
import path from 'path'
// import vue from '@vitejs/plugin-vue'
import vue from '@vitejs/plugin-vue2'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      compositionOnly: false,
      include: path.resolve(__dirname, './src/i18n/**'),
    }),
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
