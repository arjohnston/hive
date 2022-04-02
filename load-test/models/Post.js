const options = require('../options.js')

module.exports = {
  dependencies: [],
  apiUrl: '/',
  rateLimit: 1150,
  template: {
    name: {
      seed: options.nameSeed,
      unique: false
    },
  }
}
