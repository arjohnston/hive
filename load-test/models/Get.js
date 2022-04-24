const options = require('../options.js')

module.exports = {
  dependencies: ['Post'],
  apiUrl: '/',
  apiType: 'GET',
  rateLimit: 10000,
  template: {
    id: {
      seed: options.idSeed,
      unique: true
    },
  }
}
