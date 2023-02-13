import express from 'express'
import roomRoutes from './rooms.route'
import hallRoutes from './hall.route'

const router = express.Router()

router.use('/rooms', roomRoutes)
router.use('/hall', hallRoutes)

export default router