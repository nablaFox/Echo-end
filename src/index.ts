import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routes from './routes'

import { port } from './config/vars'

const { startMatching } = require('./services/match.service')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/', routes)

app.listen(port, () => {
    console.log('Server started on port ' + port)
    startMatching()
})
