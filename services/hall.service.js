const { db } = require('./firebase')
const { getUserRoomRef } = require('./user.service')

const hall = db.collection('hall')

const enter = async (userId, data) => {
    const batch = db.batch()

    batch.set(getUserRoomRef(userId), {
        isWaiting: true
    }, { merge: true })
    batch.set(hall.doc(userId), data)

    await batch.commit()
}

const leave = async userId => {
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

module.exports = {
    ref: hall,
    clearQueue,
    enter,
    leave,
    clearQueue
}