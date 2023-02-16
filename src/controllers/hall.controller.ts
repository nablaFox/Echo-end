import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import { firestore } from '../services/firebase'
import hall from '../services/hall.service'

export const enter = async (req: Request, res: Response) => {
    const { user } = res.locals

    if (user.roomInfoDoc.data()?.currentRoom) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in a room')
        // verificare se l'utente non ha già una currentRoom
    }
    if (user.roomInfoDoc.data()?.isWaiting) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in the hall')
        // verificare se l'utente non sta già aspettando
    }
    
    try {
        await hall.enter(user.doc.id, {
            addedAt: firestore.Timestamp.now(),
            languages: user.doc.data().languages,
            group: user.doc.data().group
        })

        res.status(httpStatus.OK).send('user entered in the hall')
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err)
    }
}

export const leave = () => {}