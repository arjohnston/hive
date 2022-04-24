const options = require('../options.js')

module.exports = {
  dependencies: ['Post'],
  apiUrl: '/user/',
  apiType: 'PUT',
  rateLimit: 10,
  template: {
    id: {
      seed: options.idSeed,
      unique: true
    },
  }
}
