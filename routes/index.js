const express = require('express')
const roomsRoutes = require('./rooms.route')
const hallRoutes = require('./hall.route')
const router = express.Router()

router.use('/rooms', roomsRoutes)
router.use('/hall', hallRoutes)

module.exports = router