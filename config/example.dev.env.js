
const merge = require('webpack-merge');
const defaultEnv = require('./default.env');

module.exports = merge(defaultEnv, {
  TYPEKIT_ID: '""', // should be specified
  TAWK_TO_SITE_ID: false, // if false then wont show
  BASE_URL: '"/app/"',
  GITHUB_WIKI_HOME: '"https://raw.githubusercontent.com/wiki/path/to/wiki.md"',
});
