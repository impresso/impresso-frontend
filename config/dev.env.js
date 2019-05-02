
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  TYPEKIT_ID: '"egx1cmg"',
  MIDDLELAYER_API: '"https://impresso-project.ch"',
  MIDDLELAYER_MEDIA_PATH: '"/alpha/media"',
  MIDDLELAYER_API_PATH: '"/api"',
  MIDDLELAYER_API_SOCKET_PATH: '"/api/socket.io/"',
  // MIDDLELAYER_API: '"http://localhost:3030"',
  // MIDDLELAYER_API_SOCKET_PATH: '"/socket.io/"',
  TAWK_TO_SITE_ID: false, // if false then wont show
  GITHUB_WIKI_HOME: '"https://raw.githubusercontent.com/wiki/impresso/impresso-frontend/Home.md"',
});
