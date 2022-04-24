const options = require('../options.js')

module.exports = {
  dependencies: [],
  apiUrl: '/user/',
  apiType: 'DELETE',
  rateLimit: 10000,
  template: {
    id: {
      seed: options.idSeed,
      unique: true
    },
  }
}
