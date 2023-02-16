import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routes from './routes'

import { port } from './config/vars'
import { startMatching } from './services/match.service'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/', routes)

const server = app.listen(port, () => {
    console.log(`Server started on port ${ port }`)
    try { startMatching() } 
    catch(err) { 
        console.error(`Matching failed: ${ err }`)
        server.close()
    }
})
