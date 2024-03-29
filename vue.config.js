const readFile = require('fs').readFileSync

const PackageJsonPath = `${__dirname}/package.json`
const SocketIoProxyPath = `^${process.env.VUE_APP_MIDDLELAYER_API_SOCKET_PATH}`

function getVersion() {
  try {
    return JSON.parse(readFile(PackageJsonPath)).version
  } catch (e) {
    return 'N/A'
  }
}

function getPublicPath() {
  if (process.env.PUBLIC_PATH) return process.env.PUBLIC_PATH
  return process.env.NODE_ENV === 'production' ? '/app' : '/'
}

process.env.VUE_APP_GIT_TAG = process.env.GIT_TAG || 'latest'
process.env.VUE_APP_GIT_BRANCH = process.env.GIT_BRANCH || ''
process.env.VUE_APP_GIT_REVISION = process.env.GIT_REVISION || ''
process.env.VUE_APP_VERSION = getVersion()

console.log('[vue.config] SocketIoProxyPath', SocketIoProxyPath)
console.log('[vue.config] process.env.VUE_APP_MIDDLELAYER_API', process.env.VUE_APP_MIDDLELAYER_API)
console.log('[vue.config] process.env.VUE_APP_MIDDLELAYER_API_SOCKET_PATH', process.env.VUE_APP_MIDDLELAYER_API_SOCKET_PATH)
console.log('[vue.config] process.env.VUE_APP_GIT_TAG', process.env.VUE_APP_GIT_TAG)
console.log('[vue.config] process.env.VUE_APP_GIT_BRANCH', process.env.VUE_APP_GIT_BRANCH)
console.log('[vue.config] process.env.VUE_APP_GIT_REVISION', process.env.VUE_APP_GIT_REVISION)


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
        target: process.env.VUE_APP_MIDDLELAYER_API,
        ws: true,
        changeOrigin: true,
      },
      '^/api/proxy': {
        target: process.env.VUE_APP_MIDDLELAYER_API,
        ws: false,
        changeOrigin: true,
      },
    },
  },
  publicPath: getPublicPath(),
}
