const express = require('express')
const app = express()
const port = 3000
const newError = require('http-errors')
const bodyParser = require('body-parser')
const Cake = require('./models/cake')

var cakes = {}

//Port & App Setup
app.listen(port, () => {
    console.log('\x1b[36mListening at http://localhost:' + `${port}`)
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Register new cake
app.post('/cakes', (req, res) => {

    if (cakes[req.body.name]) {
        throw newError(409, `Cake name should be unique, '${req.body.name}' already exists.`)
    } else {

        let someCake = Object.create(Cake)
        someCake.name = req.body.name
        someCake.price = req.body.price
        someCake.flavors = req.body.flavors

        cakes[req.body.name] = someCake

        res.json({ success: true, cake: someCake })
    }
})

// Get the list of cakes and info on a particular one
app.get('/cakes', (req, res) => {

    if (req.query.name) {
        if (cakes[req.query.name]) {
            res.json({ success: true, cake: cakes[req.query.name] })
        } else {
            throw newError(404, `A cake named '${req.query.name}' doesn't exist.`)
        }
    } else {
        res.json({ success: true, cakes: cakes })
    }
})

// Update a cake
app.patch('/cakes/:name', (req, res) => {
    let cakeToUpdate = cakes[req.params.name]

    if (cakeToUpdate) {
        delete cakes[req.params.name]
        if (cakes[req.body.name]) {
            cakes[req.params.name] = cakeToUpdate
            throw newError(409, `A cake named '${req.body.name}' already exists, rename and try again.`)
        } else {

            cakeToUpdate.name = req.body.name ?? cakeToUpdate.name
            cakeToUpdate.price = req.body.price ?? cakeToUpdate.price
            cakeToUpdate.flavors = req.body.flavors ?? cakeToUpdate.flavors

            cakes[req.body.name] = cakeToUpdate

            console.log(cakeToUpdate);
            res.json({ success: true, cake: cakeToUpdate })
        }
    } else {
        throw newError(404, `No cakes named '${req.params.name}' found.`)
    }
})

// Delete a cake
app.delete('/cakes/:name', (req, res) => {

    if (req.params.name && cakes[req.params.name]) {
        delete cakes[req.params.name]
        res.json({ success: true })
    } else {
        throw newError(404, `A cake named '${req.params.name}' doesn't exist.`)
    }

})

//Error Handling
app.use((error, req, res, next) => {
    error.status = error.status || 500;
    error.message = error.message || 'Unknown Error';

    res.status(error.status)
    res.json({
        success: false,
        message: error.message,

    });


});
