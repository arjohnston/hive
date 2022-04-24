const options = require('../options.js')

module.exports = {
  dependencies: [],
  apiUrl: '/',
  apiType: 'POST',
  rateLimit: 1150,
  template: {
    name: {
      seed: options.nameSeed,
      unique: false
    },
  },
  postHook: '/clear'
}
