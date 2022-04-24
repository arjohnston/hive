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
    const fs = require('fs');
    // Return if healthy
    app.get('/health', (req, res) => {
        res.sendStatus(200)
    })

    // Get the specific record
    app.get('/', (req, res) => {
        let rawData = fs.readFileSync('db.json')
        let db = JSON.parse(rawData)

        // Get a record based on the URI passed && return it

        res.sendStatus(200)
    })
    
    // Create the specific record
    app.post('/', (req, res) => {
        let rawData = fs.readFileSync('db.json')
        let db = JSON.parse(rawData)
        db.push(req.body)

        const newData = JSON.stringify(db);

        try {
            fs.writeFile('db.json', newData, (err) => {
                if (err) throw err
            })
        } catch {
            res.sendStatus(500) // Internal Server Error
        }
        
        res.sendStatus(200) // OK
    })
    
    // Update the specific record
    app.put('/user', (req, res) => {
        // res.send('Got a PUT request at /user')
    })
    
    // Remove the specified record
    app.delete('/user', (req, res) => {
        // res.send('Got a DELETE request at /user')
    })

    // Remove the entire database
    app.delete('/clear', (req, res) => {
        // res.send('Got a clear request')
    })
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on port: ${port}`)

      console.log('\nTo connect to this server from another computer, get the local IP address of this computer')
      console.log('And query against the routes (postman, browser, load-test) with the IP-address:3000')
    })
}

