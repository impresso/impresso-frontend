const readFile = require('fs').readFileSync;

const PackageJsonPath = `${__dirname}/package.json`;

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

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@intlify/vue-i18n-loader')
      .end();
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
    }
  },
  devServer: {
    public: 'http://localhost:8080',
  },
  publicPath: getPublicPath()
}
