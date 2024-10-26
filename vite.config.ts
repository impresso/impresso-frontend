import { fileURLToPath, URL } from 'node:url'
import { join, parse, resolve } from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import VueDevTools from 'vite-plugin-vue-devtools'
import autoprefixer from 'autoprefixer'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd())

  const SocketIoProxyPath = `^${env.VITE_MIDDLELAYER_API_SOCKET_PATH}`
  const ApiIiifProxyPath = [
    '^',
    String(env.VITE_MIDDLELAYER_API_PATH).replace(/\/+$/, ''),
    '/proxy/'
  ].join('')

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      // VueDevTools(),
      VueI18nPlugin({
        compositionOnly: false,
        strictMessage: false,
        escapeHtml: false
      })
    ],
    css: {
      postcss: {
        plugins: [autoprefixer()]
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
          changeOrigin: true
        },
        // this is from IIIF stored in the database, thsy usually contain /api/proxy
        [ApiIiifProxyPath]: {
          target: env.VITE_MIDDLELAYER_API,
          ws: false,
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: id => {
            if (id.includes('openseadragon')) return 'openseadragon'
            if (id.includes('d3')) return 'd3'
            if (id.includes('protobuf')) return 'protobuf'
            if (id.includes('buffer')) return 'buffer'
          }
        },
        input: entryPoints('index.html', 'widget/index.html')
      }
    }
  })
}

function entryPoints(...paths: string[]) {
  const entries = paths.map(parse).map(entry => {
    const { dir, base, name } = entry
    const key = join(dir, name)
    const path = resolve(__dirname, dir, base)
    return [key, path]
  })

  const config = Object.fromEntries(entries)
  return config
}
