const express = require('express')
const roomsRoutes = require('./rooms.route')
const router = express.Router()

router.use('/rooms', roomsRoutes)

module.exports = router