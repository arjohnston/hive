const express = require('express')
const app = express()
const port = 3000

/*
    In order to use this, you run a node.js to start a server, then run the load + stress test tool against it.

    For example:
    ipconfig -> note down IP address, then:
    node server.js 192.168.1.1
*/

startServer()

function startServer() {
    app.get('/', (req, res) => {
        res.status(200).send('Hello World!')
    })
    
    app.post('/', (req, res) => {
        res.status(200).send('Got a POST request')
    })
    
    app.put('/user', (req, res) => {
        res.send('Got a PUT request at /user')
    })
    
    app.delete('/user', (req, res) => {
        res.send('Got a DELETE request at /user')
    })
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on port: ${port}`)

      console.log('\nTo connect to this server from another computer, get the local IP address of this computer')
      console.log('And query against the routes (postman, browser, load-test) with the IP address:3000')
    })
}

