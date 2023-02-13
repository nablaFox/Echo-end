import express from 'express'
import * as controller from '../controllers/hall.controller'
import checkAuth from '../middlewares/auth'

const router = express.Router()

router
    .route('/')
    .post(checkAuth, controller.enter)
    .delete(checkAuth, controller.leave)

export default router