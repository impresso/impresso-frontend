'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  TYPEKIT_ID: '"egx1cmg"',
  MIDDLELAYER_API: '"https://impresso-project.ch"',
  MIDDLELAYER_API_SOCKET_PATH: '"/alpha/api/socket.io/"',
  TAWK_TO_SITE_ID: false, // if false then wont show
});
