const exec = require('child_process').execSync;
const readFile = require('fs').readFileSync;

const PackageJsonPath = `${__dirname}/package.json`;

const Commands = Object.freeze({
  GetGitBranch: 'git rev-parse --abbrev-ref HEAD',
  GetGitRevision: 'git rev-parse --short HEAD',
});

function getGitDetail(envVar, command) {
  if (process.env[envVar] != null) return process.env[envVar];
  try {
    return exec(command).toString().replace(/\n/g, '')
  } catch (e) {
    console.info('E', e)
    return 'N/A'
  }
}

function getGitBranch() {
  return getGitDetail('IMPRESSO_GIT_BRANCH', Commands.GetGitBranch);
}

function getGitRevision() {
  return getGitDetail('IMPRESSO_GIT_REVISION', Commands.GetGitRevision);
}

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

process.env.VUE_APP_GIT_BRANCH = getGitBranch()
process.env.VUE_APP_GIT_REVISION = getGitRevision()
process.env.VUE_APP_VERSION = getVersion()

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
