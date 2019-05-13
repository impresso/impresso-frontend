'use strict'
const merge = require('webpack-merge')
const defaultEnv = require('./default.env')

'use strict'
module.exports = {
  NODE_ENV: '"production"',
  TYPEKIT_ID: '"..."',
  MIDDLELAYER_API: "https://"',
  MIDDLELAYER_MEDIA_PATH: '"/media"',
  MIDDLELAYER_API_PATH: '"/api"',
  MIDDLELAYER_API_SOCKET_PATH: '"/api/socket.io/"',
  TAWK_TO_SITE_ID: '"..."',
  GITHUB_WIKI_HOME: '"https://raw.githubusercontent.com/wiki/path/to/wiki.md"',
};
