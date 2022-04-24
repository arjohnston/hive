// Import required modules
const ProgressBar = require('./utils/ProgressBar.js')
const Logger = require('./utils/Logger.js')
const throttle = require('./utils/throttle.js')
const options = require('./options.js')

// Nodes child process for handling terminal commands
// https://nodejs.org/api/child_process.html
const cp = require('child_process')

// Models for API testing. These should replicate the header
// that's required for the API
const postModel = require('./models/Post.js')
const getModel = require('./models/Get.js')
const getModel = require('./models/Put.js')
const getModel = require('./models/Delete.js')
const getModel = require('./models/Health.js')

// Get the arguments passed into this file
// For example: node run.js --post
const args = process.argv

class Run {
  constructor () {
    // Set initial variables
    this.testStartTime = Date.now()
    this.testStartDate = new Date().toISOString()
    this.currentRequestCount = 0
    this.resultCount = 0
    this.averageTestTime = 0
    this.processedRequests = 0

    // Assume there are dependencies that should be processed
    // prior to running the specified test
    this.isProcessingDependencies = true

    // Function definitions with binding this to associate
    // calls to the function with this instantiated class
    this.checkArgs = this.checkArgs.bind(this)
    this.runCmd = this.runCmd.bind(this)
    this.run = this.run.bind(this)
    this.fetchModel = this.fetchModel.bind(this)
    this.generateHeader = this.generateHeader.bind(this)
    this.spawnTests = this.spawnTests.bind(this)

    // Instantiate required modules
    this.progressBar = new ProgressBar()
    this.logger = new Logger()

    // Instantiate the variables for the API to be ran
    this.template = null
    this.ipAddress = null
    this.apiUrl = null
    this.apiType = null
    this.rateLimit = null
    this.dependencies = []
    this.templateLoaded = null

    // To enable console logging as the test is running, set verbose to true
    this.verbose = options.verbose
  }

  /**
   * Fetch a model and return it's associated data.
   * @param   {String}  model   Name of the model
   * @return  {Object}          An object of the associated model
   */
  fetchModel (model) {
    const fetchedModel = {}

    // Get the data from the model passed in
    switch (model) {
      case 'Get':
        fetchedModel.apiUrl = getModel.apiUrl
        fetchedModel.apiType = getModel.apiType
        fetchedModel.rateLimit = getModel.rateLimit
        fetchedModel.dependencies = getModel.dependencies
        fetchedModel.templateLoaded = 'Get'
        fetchedModel.template = getModel.template
        break
      
      case 'Post':
        fetchedModel.apiUrl = postModel.apiUrl
        fetchedModel.apiType = postModel.apiType
        fetchedModel.rateLimit = postModel.rateLimit
        fetchedModel.dependencies = postModel.dependencies
        fetchedModel.templateLoaded = 'Post'
        fetchedModel.template = postModel.template
        break

      case 'Put':
        fetchedModel.apiUrl = putModel.apiUrl
        fetchedModel.apiType = putModel.apiType
        fetchedModel.rateLimit = putModel.rateLimit
        fetchedModel.dependencies = putModel.dependencies
        fetchedModel.templateLoaded = 'Put'
        fetchedModel.template = putModel.template
        break

      case 'Delete':
        fetchedModel.apiUrl = deleteModel.apiUrl
        fetchedModel.apiType = deleteModel.apiType
        fetchedModel.rateLimit = deleteModel.rateLimit
        fetchedModel.dependencies = deleteModel.dependencies
        fetchedModel.templateLoaded = 'Delete'
        fetchedModel.template = deleteModel.template
        break

      case 'Health':
        fetchedModel.apiUrl = healthModel.apiUrl
        fetchedModel.apiType = healthModel.apiType
        fetchedModel.rateLimit = healthModel.rateLimit
        fetchedModel.dependencies = healthModel.dependencies
        fetchedModel.templateLoaded = 'Health'
        fetchedModel.template = healthModel.template
        break

      default:
        fetchedModel.model = null
    }

    // Return the model's information
    return fetchedModel
  }

  /**
   * Checks the arguments passed into the node command.
   * Pass in an argument of the name of the API to be ran,
   * for example: `node run.js --post`.
   *
   * Load the associated model if applicable.
   */
  checkArgs () {
    // If the platform is Windows, return immediately as the commands
    // are written for a Unix system.
    // The program is written on top of NodeJS and may work with Windows,
    // however it has not been tested and remains unsupported.
    if (process.platform === 'win32') {
      console.log('Can\'t run on Windows\n')

      // Exit the program
      return
    }

    // If the verbose argument is passed in, then set the options
    // so the commands ran will print as verbose, otherwise
    // minimal output will be printed during the setup process
    if (args.toString().toLowerCase().includes('verbose')) {
      // If verbose logging is requested, enable verbose logging
      this.verbose = true
    }

    let model = {}

    // Set the model for the Register API
    if (args.toString().toLowerCase().includes('get')) {
      model = this.fetchModel('Get')
    }

    if (args.toString().toLowerCase().includes('post')) {
      model = this.fetchModel('Post')
    }

    if (args.toString().toLowerCase().includes('put')) {
      model = this.fetchModel('Put')
    }

    if (args.toString().toLowerCase().includes('delete')) {
      model = this.fetchModel('Delete')
    }

    if (args.toString().toLowerCase().includes('health')) {
      model = this.fetchModel('Health')
    }

    this.ipAddress = args.splice(2)[1];

    // Set the variables with the model information
    this.apiUrl = model.apiUrl
    this.rateLimit = model.rateLimit // If a limit is known (e.g. register = 775), then it will batch requests
    this.dependencies = model.dependencies // Any dependencies (e.g. Ping requires an assocated registered user)
    this.templateLoaded = model.templateLoaded // Name of the template loaded
    this.model = model.template // Model for the header

    // If no API url exists, print an error message and exit the program
    if (this.apiUrl === '') {
      console.log('You must enter the type of POST to run:')
      console.log()
      console.log('--get')
      console.log('Creates the amount of get requests specified in the file.')
      console.log()
      console.log('--post')
      console.log('Creates the amount of post requests specified in the file.')
      console.log()
      console.log('--put')
      console.log('Creates the amount of put requests specified in the file.')
      console.log()
      console.log('--delete')
      console.log('Creates the amount of delete requests specified in the file.')
      console.log()
      console.log('--health')
      console.log('Creates the amount of health check requests specified in the file.')

      // Exit the program
      return
    }

    // Otherwise, if it wasn't exited, utilize the run command
    this.run()
  }

  /**
   * Run a curl command with the given header data against the specified API.
   * @param   {Object}  header    An object with the header information for the
   *                              curl command
   * @param   {String}  apiUrl    The URL for the API
   * @param   {String}  modelName The name of the model
   * @return  {Promise}           A promise once the curl command has completed
   */
  runCmd (header, apiUrl, apiType, modelName) {
    if (!header) return

    const startTime = Date.now()
    // Return a promise once the execute command succeeds or throws
    // an error
    return new Promise((resolve, reject) => {
      /**
       * Execute the command utilizing child processes exec
       * @param   curl                                bash curl command
       * @param   -s -o /dev/null/ -w "%{http_code}"  silently output the http_code from the API
       * @param   -H "Content-Type: application/json" set the header to JSON
       * @param   -d '${JSON.stringify(header)}'      pass the header information as a JSON object
       * @param   ${this.apiUrl}                      API url
       */
      const cmd = cp.exec(
        `curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X ${apiType} -d '${JSON.stringify(header)}' ${apiUrl}`
        , function (error, stdout, stderr) {
          // Log the error and resolve to ensure tests continue
          if (error) {
            this.logger.log(error)
            clearTimeout(timeoutTimer)
            resolve()
          } else {
            // If the API outputs text to the terminal (e.g. http_code)
            if (stdout) {
              // Get the time to process the command in milliseconds
              const completedIn = Date.now() - startTime

              // Add the completed time to average. The average time will
              // be divided by the result count when logging the final output
              // Utilized for non-dependency tests
              if (!this.isProcessingDependencies) this.averageTestTime += completedIn

              // Log a successful test if the response code is 200
              // Otherwise, log an error
              const msg = stdout.indexOf('200') > -1 ? `[ ${modelName.toLowerCase()} ] Successfully received response in ${completedIn}ms` : `[ ${modelName.toLowerCase()} ] There was an issue, response in ${completedIn}ms`

              // Ensure the message is populated and log the commands response
              if (msg !== '') this.logger.log(msg)
            }

            if (!this.isProcessingDependencies) this.resultCount += 1

            // Return the promise
            clearTimeout(timeoutTimer)
            resolve()
          }
        // Bind this to access the classes local variables
        }.bind(this))

      // Set a timeout timer to account if the server crashes.
      const timeoutTimer = setTimeout(() => {
        this.logger.log(`[ ${modelName.toLowerCase()} ] Timeout occurred in 120 seconds`)

        // Kill the command
        cmd.kill()

        // resolve the promise
        resolve()
      }, options.timeoutDuration * 1000)
    })
  }

  /**
   * Generate header data based on a template from a model.
   * @param   {Object}  template   Template object from the model
   * @param   {Integer} iterator   Integer of current position for the
   *                               loop of spawning post commands
   * @return  {Promise, Object}    A promise with an object of the
   *                               header data
   */
  generateHeader (template, iterator) {
    function createUniqueIdentifier (seed) {
      const id = seed + iterator

      // Return the new unique string
      return id
    }

    // Instantiated header to be populated with the info specified in
    // the model
    const header = {}

    // Loop through the keys in the template passed in
    Object.keys(template).forEach((key) => {
      // If the template key includes a keyword unique, then
      // generate a unique ID for that key (e.g. devToken)
      if (Object.keys(template[key]).includes('unique')) {
        header[key] = createUniqueIdentifier(template[key].seed)
      } else {
        // Otherwise, use the seeded information since it does not need
        // to be unique and add it to the header
        header[key] = template[key].seed
      }
    })

    // Return the promise with the newly created header
    return new Promise((resolve, reject) => {
      resolve(header)
    })
  }

  /**
   * Spawn a batch of tests, utilizing the runCmd and generateHeader methods.
   * @param   {Object}    template    An object of the models template
   * @param   {Integer}   chunkSize   Batch size
   * @param   {Integer}   iteration   Current position in the loop
   * @param   {String}    apiUrl      the URL for the API
   * @param   {String}    modelName   Name of the model
   * @return  {Object}                Promise once all tests are completed
   */
  spawnTests (
    template,
    chunkSize = options.howManyRequestsToSpawn,
    iteration = 0,
    apiUrl = this.apiUrl,
    apiType = this.apiType,
    modelName = this.templateLoaded,
    batch
  ) {
    // Require a template to be passed in
    if (!template) return console.log('Spawning tests requires a valid model template')

    const numberOfChunks = this.rateLimit ? Math.ceil(options.howManyRequestsToSpawn / this.rateLimit) : 1
    // Check if we're batching requests, then log each section
    if (numberOfChunks > 1) {
      // const howManyBatches = Math.ceil(options.howManyRequestsToSpawn / chunkSize)
      this.logger.log(`\nProcessing batch ${batch} of ${numberOfChunks}`)
    }

    // An array to store all promises of the for loop. The function will only
    // be returned once all promises have been resolved
    const promises = []

    // Utilize a for loop to generate the tests
    // @param iteration Position of the tests being spawned.
    //                  Utilized in the case of batch processing to hold
    //                  the position of spawning the tests.
    // @param chunkSize Amount of tests to spawn in this batch
    for (let i = iteration; i < chunkSize + iteration; i++) {
      // If we are not processing dependencies, then iterate the amount
      // of POST requests
      if (!this.isProcessingDependencies) this.currentRequestCount += 1

      // Store a promise of the test in the promises array
      promises.push(new Promise((resolve, reject) => {
        // Generate the header information
        this.generateHeader(template, i)
          .then((header) => {
            // Once the header has been generated, run the curl command
            return this.runCmd(header, apiUrl, apiType, modelName)
          })
          .then(() => {
            if (!this.isProcessingDependencies) {
              // Iterate the responses count
              this.processedRequests += 1

              // Update the terminal progress bar
              this.progressBar.update(this.processedRequests)
            }

            // Resolve this iteration
            resolve()
          })
          .catch((error) => {
            // Log the error if one was thrown thrown, that way
            // we continue our tests even if an error was detected
            this.logger.log(error)
            resolve()
          })
      }))
    }

    // Return once all promises are resolved. In the case of batch processing,
    // this return will trigger the next batch to be processed
    return Promise.all(promises)
  }

  /**
   * Asynchronously run the tests, first with the dependencies
   * and then all of the tests.
   */
  async run () {
    // Set the logger with the test information
    this.logger.testStartTime = this.testStartTime
    this.logger.testStartDate = this.testStartDate
    this.logger.verbose = this.verbose

    // Initiate a progress bar in the terminal
    const barLength = options.howManyRequestsToSpawn
    this.progressBar.init(barLength)

    // Process the dependencies before testing the API
    // Could be refactored recursively to include nested dependencies
    if (this.dependencies && this.dependencies.length > 0) {
      // Array to hold all promises
      const promises = []

      // For each dependency listed in the model
      // process them (e.g. Ping requires Register)
      this.dependencies.forEach((modelName) => {
        // Push a new promise in the promises array
        promises.push(new Promise((resolve, reject) => {
          // Get the dependency model
          const model = this.fetchModel(modelName)

          this.logger.log(`Processing the dependency ${modelName} for ${this.templateLoaded}`)

          // Spawn the test for the associated dependency model
          // Throttle is wrapped around spawn tests to batch process the tests
          // in the case there is a rate limit
          throttle(this.spawnTests, model.template, options.howManyRequestsToSpawn, model.rateLimit, `${this.ipAddress}${this.apiUrl}`, modelName)
            .then(() => {
              // Once successful, resolve
              resolve()
            })
            .catch((error) => {
              this.logger.createLogFile()
              throw new Error(error)
            })
        }))
      })

      // Pause here until all promises are resolved
      await Promise.all(promises)
    }

    // Log a blank line to separate depedencies and the test
    // if (this.isProcessingDependencies) this.logger.log('\n')
    this.logger.log(`\nProcessing tests for ${this.templateLoaded}`)

    // Once all depedencies have been ran, set the flag
    // for processing
    this.isProcessingDependencies = false

    // Spawn the test for the associated model
    // Throttle is wrapped to batch process the tests if there is a rate limit
    throttle(this.spawnTests, this.model, options.howManyRequestsToSpawn, this.rateLimit, `${this.ipAddress}${this.apiUrl}`)
      .then(() => {
        // Once the test has been compeleted, log the associated information
        this.logger.currentRequestCount = this.currentRequestCount
        this.logger.resultCount = this.resultCount
        this.logger.averageTestTime = this.averageTestTime / this.resultCount
        this.logger.testRan = this.templateLoaded
        this.logger.batchSize = this.rateLimit

        // Create a logfile
        this.logger.createLogFile()

        // In case there are some rejected promises, enforce an exit
        return process.exit(22)
      })
      .catch((error) => {
        this.logger.createLogFile()
        throw new Error(error)
      })
      .finally(() => {
        if (this.model.postHook) {
          cp.exec(`curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -X ${apiType} ${apiUrl}`)
        }
      })
  }
}

// Instantiate the Run class and initiate the tests with checkArgs
const r = new Run()
r.checkArgs()
