import { fileURLToPath, URL } from 'node:url'
import { join, parse, resolve } from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import VueDevTools from 'vite-plugin-vue-devtools'
import autoprefixer from 'autoprefixer'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

function isLocalhost(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd())
  if (mode === 'development') {
    console.log(env)
  }
  const SocketIoProxyPath = `^${env.VITE_MIDDLELAYER_API_SOCKET_PATH}`
  const DatalabContentProxyPath = `^${env.VITE_DATALAB_CONTENT_API_PATH}`
  const AssetsProxyPath = `^${env.VITE_ASSETS_PATH}`
  const ApiIiifProxyPath = [
    '^',
    String(env.VITE_MIDDLELAYER_API_PATH).replace(/\/+$/, ''),
    '/proxy/'
  ].join('')
  if (mode === 'development') {
    console.log('SocketIoProxyPath', SocketIoProxyPath)
    console.log('ApiIiifProxyPath', ApiIiifProxyPath)
  }
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
          // not changing origin on localhost to allow iiif proxy get the address of the web app instead of the downstream service
          changeOrigin: !isLocalhost(env.VITE_MIDDLELAYER_API)
        },
        [DatalabContentProxyPath]: {
          target: env.VITE_DATALAB_CONTENT_API_HOST,
          ws: false,
          changeOrigin: true
        },
        [AssetsProxyPath]: {
          target: env.VITE_ASSETS_HOST,
          ws: false,
          changeOrigin: true
        },
        // this is from IIIF stored in the database, thsy usually contain /api/proxy
        [ApiIiifProxyPath]: {
          target: env.VITE_MIDDLELAYER_API,
          ws: false,
          // not changing origin on localhost to allow iiif proxy get the address of the web app instead of the downstream service
          changeOrigin: !isLocalhost(env.VITE_MIDDLELAYER_API)
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
