const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const routes = require('./routes')

const port = 3000
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/', routes)

app.listen(port, () => {
    console.log('Server started on port ' + port)
})
