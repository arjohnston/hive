// Assuming the tests are more than 1000, ENFILE errors will be encountered.
// To avoid increase the amount of commands that can be ran, increase the amount of
// commands that can be executed (note: 65536 is the max amount allowed by the kernal):
// $ echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
// $ echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
// $ sudo sysctl -w kern.maxfiles=65536
// $ sudo sysctl -w kern.maxfilesperproc=65536
// $ ulimit -n 65536

module.exports = {
  verbose: false,

  // Seeds for consistency when testing
  nameSeed: 'Test User',

  // Set the below integer to how many times the POST request should for
  howManyRequestsToSpawn: 10000,

  // How long to wait for the API to respond before timing out
  timeoutDuration: 120 // seconds
}
