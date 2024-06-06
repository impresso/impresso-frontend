// NOTE
// TODO: migrate to vite.config.js and remove
//
//

const readFile = require('fs').readFileSync

const PackageJsonPath = `${__dirname}/package.json`
const SocketIoProxyPath = `^${import.meta.env.VITE_MIDDLELAYER_API_SOCKET_PATH}`
const ApiIiifProxyPath = [
  '^',
  String(import.meta.env.VITE_MIDDLELAYER_API_PATH).replace(/\/+$/, ''),
  '/proxy/',
].join('')

function getVersion() {
  try {
    return JSON.parse(readFile(PackageJsonPath)).version
  } catch (e) {
    return 'N/A'
  }
}

function getPublicPath() {
  if (import.meta.env.PUBLIC_PATH) return import.meta.env.PUBLIC_PATH
  return import.meta.env.NODE_ENV === 'production' ? '/app' : '/'
}

import.meta.env.VITE_GIT_TAG = import.meta.env.GIT_TAG || 'latest'
import.meta.env.VITE_GIT_BRANCH = import.meta.env.GIT_BRANCH || ''
import.meta.env.VITE_GIT_REVISION = import.meta.env.GIT_REVISION || ''
import.meta.env.VITE_VERSION = getVersion()

console.log('[vue.config] SocketIoProxyPath', SocketIoProxyPath)
console.log('[vue.config] ApiIiifProxyPath', ApiIiifProxyPath)
console.log('[vue.config] import.meta.env.NODE_ENV', import.meta.env.NODE_ENV)
console.log(
  '[vue.config] import.meta.env.VITE_USE_PROXY_MIDDLEWARE (check src/services/index.js)',
  import.meta.env.VITE_USE_PROXY_MIDDLEWARE,
)
console.log('[vue.config] import.meta.env.VITE_MIDDLELAYER_API', import.meta.env.VITE_MIDDLELAYER_API)
console.log(
  '[vue.config] import.meta.env.VITE_MIDDLELAYER_API_SOCKET_PATH',
  import.meta.env.VITE_MIDDLELAYER_API_SOCKET_PATH,
)
console.log('[vue.config] import.meta.env.VITE_GIT_TAG', import.meta.env.VITE_GIT_TAG)
console.log('[vue.config] import.meta.env.VITE_GIT_BRANCH', import.meta.env.VITE_GIT_BRANCH)
console.log('[vue.config] import.meta.env.VITE_GIT_REVISION', import.meta.env.VITE_GIT_REVISION)

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@intlify/vue-i18n-loader')
      .end()
    // config.module.rule('ts').use('babel-loader').end();
  },
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html',
    },
    widget: {
      // entry for the page
      entry: 'src/widget/main.js',
      // the source template
      template: 'public/widget.html',
      // output as dist/index.html
      filename: 'widget/index.html',
    },
  },
  devServer: {
    public: 'http://localhost:8080',
    proxy: {
      [SocketIoProxyPath]: {
        target: import.meta.env.VITE_MIDDLELAYER_API,
        ws: true,
        changeOrigin: true,
      },
      // this is from IIIF stored in the datagase, thsy usually contain /api/proxy
      [ApiIiifProxyPath]: {
        target: import.meta.env.VITE_MIDDLELAYER_API,
        ws: false,
        changeOrigin: true,
      },
    },
  },
  publicPath: getPublicPath(),
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        }
      ]
    }
  }
}
