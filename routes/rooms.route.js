const express = require('express')
const controller = require('../controllers/room.controller')
const checkAuth = require('../middlewares/auth')

// list rooms, ecc.

const router = express.Router()

router
    .route('/:id')
    .delete(checkAuth, controller.leave)

router
    .route('/waitingRoom')
    .post(checkAuth, controller.match)




module.exports = router