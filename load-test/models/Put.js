const options = require('../options.js')

module.exports = {
  dependencies: ['Post'],
  apiUrl: '/user',
  apiType: 'PUT',
  rateLimit: 1150,
  template: {
    name: {
      seed: options.nameSeed,
      unique: false
    },
  },
  postHook: '/clear'
}
