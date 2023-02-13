const express = require('express')
const controller = require('../controllers/hall.controller')
const checkAuth = require('../middlewares/auth')

const router = express.Router()

router
    .route('/')
    .post(checkAuth, controller.enter)
    .delete(checkAuth, controller.leave)

module.exports = router