// TODO: This method can be refactored to be genericized.
// All throttle should need is a callback, total amount and limit amount

/**
 * A simple throttle method that takes a callback, amount and limit
 * and processes the callback based on the amount of requests divided
 * by the limit
 * @param   {Function}  callback          Callback function
 * @param   {Object}    model             Template to be passed to the callback
 * @param   {Integer}   amountOfRequests  Total amount
 * @param   {Integer}   rateLimit         Limit amount
 * @param   {String}    apiUrl            API to be passed to the callback
 * @param   {String}    modelName         Name of the model to be passed to the callback
 */
module.exports = async function throttle (callback, model, amountOfRequests, rateLimit, apiUrl, modelName) {
  // Get the number of batches
  // Round up to account for left over from full-batch sizes
  const numberOfChunks = rateLimit ? Math.ceil(amountOfRequests / rateLimit) : 1

  // For loop to pass through the batches
  for (let i = 0; i < numberOfChunks; i++) {
    // Initially set the batch size to the amount of requests,
    // accounting for a batch size of 1
    let chunkSize = amountOfRequests

    // If there is a rate limit passed in
    if (rateLimit !== null) {
      // Set the batch size to the max size allowed by the limit
      chunkSize = rateLimit

      // If the current iteration is the last batch
      // then set the chunkSize to the remainder (e.g. amountOfRequests % rateLimit)
      if ((i + 1) === numberOfChunks) chunkSize = amountOfRequests % rateLimit
    }

    // Pass the iteration to the callback to sequentally build the data
    const iteration = i * rateLimit

    // Asynchronously call the callback, and wait for the callback to
    // return it's promise before continuing
    await callback(model, chunkSize, iteration, apiUrl, modelName, i + 1)

    // Utilize the following function to send the batches on a time-basis, rather than
    // once one batch is complete before sending the next
    // callback(model, chunkSize, iteration, apiUrl, modelName, i + 1)
    // await timer(5000)
  }
}

// function timer (milliseconds) {
//   return new Promise((resolve, reject) => setTimeout(resolve, milliseconds))
// }
