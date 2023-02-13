import type { Request, Response } from 'express'
import { getAuth } from "../services/firebase"
import { getUser } from "../services/user.service"
import httpStatus from "http-status"

export default async (req: Request, res: Response, next: any) => {
    const token = req.headers.authorization;
    if (!token) return res.status(httpStatus.UNAUTHORIZED).send('required authorization')
    
    try {
        const { uid } = await getAuth.verifyIdToken(token)
        const user = await getUser(uid)

        if (!user.doc.exists) {
            return res.status(httpStatus.NOT_FOUND).send('user not found')
        }

        res.locals.user = user
        next()
    } catch(err: any) {
        console.log(err)
        res.status(httpStatus.UNAUTHORIZED).send(err.code)
    }
}