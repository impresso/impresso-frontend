'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  TYPEKIT_ID: '"egx1cmg"',
  MIDDLELAYER_API: '"https://api-impresso.uni.lu"'
})
