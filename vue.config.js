function getPublicPath() {
  if (process.env.PUBLIC_PATH) return process.env.PUBLIC_PATH
  return process.env.NODE_ENV === 'production' ? '/app' : '/'
}
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
        .loader('@kazupon/vue-i18n-loader')
        .end();
  },
  publicPath: getPublicPath()
}
