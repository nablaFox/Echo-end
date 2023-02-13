import express from 'express'
import checkAuth from '../middlewares/auth'
import * as controller from '../controllers/room.controller'

const router = express.Router()
router.param('id', controller.load)

router
    .route('/:id')
    .delete(checkAuth, controller.leave)

export default router