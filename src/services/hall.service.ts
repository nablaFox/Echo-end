import { db } from './firebase'
import { getUserRoomRef } from './user.service'
import type { firestore } from 'firebase-admin'

const hall = db.collection('hall')

interface IUser {
    addedAt: firestore.Timestamp,
    languages: any,
    group: number
}

const enter = async (userId: string, data: IUser) => {
    const batch = db.batch()

    batch.set(getUserRoomRef(userId), {
        isWaiting: true
    }, { merge: true })
    batch.set(hall.doc(userId), data)

    await batch.commit()
}

const leave = async (userId: string) => {
    const batch = db.batch()
    batch.delete(hall.doc(userId))
    batch.update(getUserRoomRef(userId), { isWaiting: false })

    await batch.commit()
}

const clearQueue = async () => {
    const snapshot = await hall.get()
    const batch = db.batch()
    snapshot.forEach(doc => {
        batch.delete(doc.ref)
        batch.update(getUserRoomRef(doc.id), { isWaiting: false })
    })
    await batch.commit()
}

export default {
    ref: hall,
    clearQueue,
    enter,
    leave
}