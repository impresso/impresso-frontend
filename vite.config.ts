import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import autoprefixer from "autoprefixer"
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default ({ mode }: { mode: string }) => {

  const env = loadEnv(mode, process.cwd())

  const SocketIoProxyPath = `^${env.VITE_MIDDLELAYER_API_SOCKET_PATH}`
  const ApiIiifProxyPath = [
    '^',
    String(env.VITE_MIDDLELAYER_API_PATH).replace(/\/+$/, ''),
    '/proxy/',
  ].join('')

  // https://vitejs.dev/config/
  return  defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      // VueDevTools(),
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
    },
    server: {
      proxy: {
        [SocketIoProxyPath]: {
          target: env.VITE_MIDDLELAYER_API,
          ws: true,
          changeOrigin: true,
        },
        // this is from IIIF stored in the datagase, thsy usually contain /api/proxy
        [ApiIiifProxyPath]: {
          target: env.VITE_MIDDLELAYER_API,
          ws: false,
          changeOrigin: true,
        }
      }
    }
  })
}
