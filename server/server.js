const express = require('express')
const app = express()
const port = 3000
const DB_PATH = 'db.json'

/*
    In order to use this, you run a node.js to start a server, then run the load + stress test tool against it.

    For example:
    ipconfig -> note down IP address, then:
    node server.js 192.168.1.1
*/

startServer()

function startServer() {
    const fs = require('fs');
    app.use(express.json())
    app.use(                
        express.urlencoded({
            extended: true,
        })
    )

    // Return if healthy
    app.get('/health', (req, res) => {
        console.log('/GET /health')
        res.sendStatus(200) // OK
    })

    // Get the specific record
    app.get('/:id', (req, res) => {
        console.log(`/GET /${req.params.id}`)

        if (!req.params.id) return res.sendStatus(400) // Bad Request

        let db = []

        fs.readFile(DB_PATH, (err, data) => {
            if (!err) {
                // File exists, let get the contents
                db = JSON.parse(data)
            }

            const record = db.find((x => x.id == req.params.id))

            if (record) {
                res.status(200).send(JSON.stringify(record))
            } else {
                res.sendStatus(404)
            }
        })
    })
    
    // Create the specific record
    app.post('/', (req, res) => {
        console.log('/POST /')

        let db = []
        let file

        try {
            file = fs.readFileSync(DB_PATH)
            db = JSON.parse(data)
        } catch {
            // noop
        }

        db.push(req.body)

        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(db), { flag: 'w' })
            res.sendStatus(200) // OK
        } catch {
            res.sendStatus(500) // Internal Server Error
        }
    })
    
    // Update the specific record
    app.put('/user/:id', (req, res) => {
        console.log('/PUT /user')

        if (!req.body.id || !req.params.id) return res.sendStatus(400) // Bad request

        let db = []

        fs.readFile(DB_PATH, (err, data) => {
            if (!err) {
                // File exists, let get the contents
                db = JSON.parse(data)
            }

            const record = db.findIndex((x => x.id == req.params.id))

            if (record > -1) {
                db[record] = req.body
            } else {
                return res.sendStatus(404) // Not Found
            }

            let file

            try {
                fs.writeFileSync(DB_PATH, JSON.stringify(db), { flag: 'w' })
                res.sendStatus(200) // OK
            } catch {
                res.sendStatus(500) // Internal Server Error
            }
        })
    })
    
    // Remove the specified record
    app.delete('/user/:id', (req, res) => {
        console.log('/DELETE /user')
        
        if (!req.params.id) return res.sendStatus(400) // Bad request

        let db = []

        fs.readFile(DB_PATH, (err, data) => {
            if (!err) {
                // File exists, let get the contents
                db = JSON.parse(data)
            }

            const record = db.findIndex((x => x.id == req.params.id))

            if (record > -1) {
                db.splice(record, 1)
            } else {
                return res.sendStatus(404) // Not Found
            }

            let file

            try {
                fs.writeFileSync(DB_PATH, JSON.stringify(db), { flag: 'w' })
                res.sendStatus(200) // OK
            } catch {
                res.sendStatus(500) // Internal Server Error
            }
        })
    })

    // Remove the entire database
    app.delete('/clear', (req, res) => {
        console.log('/DELETE /clear')
        
        try {
            fs.unlinkSync(DB_PATH)
            res.sendStatus(200) // OK
        } catch {
            res.sendStatus(500) // Internal Server Error
        }
    })

    app.get('*', function(req, res){
        res.sendStatus(404) // Route not found
    })
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on port: ${port}`)

      console.log('\nTo connect to this server from another computer, get the local IP address of this computer')
      console.log('And query against the routes (postman, browser, load-test) with the IP-address:3000')
    })
}

