const express = require('express')
const cors = require('cors')
const { port } = require('./config/vars')
const bodyParser = require('body-parser')
const routes = require('./routes')
const { startMatching } = require('./services/match.service')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/', routes)

app.listen(port, () => {
    console.log('Server started on port ' + port)
    startMatching()
})
