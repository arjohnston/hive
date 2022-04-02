const options = require('../options')
const fs = require('fs')

module.exports = class Logger {
  constructor () {
    this.logArray = []
    this.testStartTime = null
    this.testStartDate = null
    this.currentRequestCount = null
    this.resultCount = null
    this.averageTestTime = null
    this.verbose = false
    this.testRan = null
    this.batchSize = 0
  }

  log (msg) {
    this.logArray.push(msg)
  }

  setVerbose (bool) {
    this.verbose = bool
  }

  createLogFile () {
    process.stdout.clearLine()
    const totalTestRunTime = Date.now() - this.testStartTime

    this.logArray.unshift('***********************************\n')
    this.logArray.unshift(`Total time ran: ${totalTestRunTime / 1000} seconds`)
    this.logArray.unshift(`Average response time: ${this.averageTestTime}ms`)
    this.logArray.unshift(`Received ${this.resultCount}/${options.howManyRequestsToSpawn} responses`)
    this.logArray.unshift(`Spawned ${this.currentRequestCount}/${options.howManyRequestsToSpawn} requests`)
    this.logArray.unshift(`Batch size: ${this.batchSize}`)
    this.logArray.unshift(`${this.testRan} Test ran at ${this.testStartDate}`)
    this.logArray.unshift('***********************************')

    console.log('\n***********************************')
    console.log(`${this.testRan} Test ran at ${this.testStartDate}`)
    console.log(`Batch size: ${this.batchSize}`)
    console.log(`Spawned ${this.currentRequestCount}/${options.howManyRequestsToSpawn} requests`)
    console.log(`Received ${this.resultCount}/${options.howManyRequestsToSpawn} responses`)
    console.log(`Average response time: ${this.averageTestTime}ms`)
    console.log(`Total time ran: ${totalTestRunTime / 1000} seconds`)
    console.log('***********************************')

    let file

    try {
      file = fs.openSync(`./logs/${this.testRan}_test_${this.testStartDate.split(' ').join('_')}.txt`, 'a')

      this.logArray.forEach((element) => {
        fs.appendFileSync(file, element + '\n', 'utf8')

        if (this.verbose) {
          console.log(element)
        }
      })
    } catch (error) {
      throw new Error(error)
    } finally {
      if (file !== undefined) fs.closeSync(file)

      console.log(`\nCreated a logfile at ${process.env.PWD}/logs/${this.testRan}_test_${this.testStartDate.split(' ').join('_')}.txt`)
    }
  }
}
