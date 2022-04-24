const options = require('../options.js')

module.exports = {
  dependencies: [],
  apiUrl: '/',
  apiType: 'POST',
  rateLimit: 10000,
  template: {
    id: {
      seed: options.idSeed,
      unique: true
    },
  }
}
