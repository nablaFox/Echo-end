const { getRoom } = require('../services/room.service')
const { getUser } = require('../services/user.service')
const { db, firestore } = require('../services/firebase')
const httpStatus = require('http-status')

exports.load = async (req, res, next, id) => {
    const room = await getRoom(id)
    if (!room.doc.exists) { 
        return res.status(httpStatus.NOT_FOUND).send('room not found') 
    }
    res.locals.room = room
    next()
}

exports.leave = async (req, res) => {
    const { room } = res.locals
    const batch = db.batch()
    
    // time spent in the room
    const {since: { seconds: since }} = room.infoDoc.data()
    const now = firestore.Timestamp.now().seconds
    const totalTime = (now - since) * 1000
    
    // update members
    const members = room.membersDoc.data()
    
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
}