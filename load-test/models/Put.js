const options = require('../options.js')

module.exports = {
  dependencies: ['Post'],
  apiUrl: '/user',
  rateLimit: 1150,
  template: {
    name: {
      seed: options.nameSeed,
      unique: false
    },
  }
}
