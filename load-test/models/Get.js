const options = require('../options.js')

module.exports = {
  dependencies: ['Post'],
  apiUrl: '/',
  apiType: 'GET',
  rateLimit: 1150,
  template: {},
  postHook: '/clear'
}
