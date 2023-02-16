import { Request, Response } from "express"
import httpStatus from "http-status"
import { getRoom } from "../services/room.service"
import { getUser } from "../services/user.service"
import { db, firestore } from "../services/firebase"

export const load = async (req: Request, res: Response, next: any, id: string) => {
    const room = await getRoom(id)
    if (!room.doc.exists) { 
        return res.status(httpStatus.NOT_FOUND).send('room not found') 
    }
    res.locals.room = room
    next()
}

export const leave = async (req: Request, res: Response) => {
    const { room } = res.locals
    const batch = db.batch()
    
    // time spent in the room
    const {since: { seconds: since }} = room.infoDoc.data()
    const now = firestore.Timestamp.now().seconds
    const totalTime = (now - since) * 1000
    
    // update members
    const members = room.membersDoc.data()
    
    try {
        for (const member in members) {
            const { roomInfo, exRooms } = await getUser(member)
    
            batch.set(roomInfo, {
                currentRoom: null,
                totalTime: firestore.FieldValue.increment(totalTime)
            }, { merge: true })
    
            batch.set(exRooms.doc(room.ref.id), { 
                ref: room.ref,
                addedAt: firestore.Timestamp.now() 
            })
        }

        batch.update(room.info, {
            open: false,
            totalTime: totalTime
        })
    
        await batch.commit()
        res.status(httpStatus.OK).send('User exited and room closed')
    } catch(err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err)
    }
}