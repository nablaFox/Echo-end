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

exports.waitingRoom = async (req, res) => {
    const { user } = res.locals

    if (user.roomInfoDoc.data()?.currentRoom) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in a room')
        // verificare se l'utente non ha già una currentRoom
    }
    if (user.roomInfoDoc.data()?.isWaiting) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in the waiting room')
        // verificare se l'utente non sta già aspettando
    }

    user.roomInfo.set({ 
        isWaiting: true
    }, { merge: true })

    const waitingRoom = db.collection('waitingRoom')
    await waitingRoom.doc(user.doc.id).set({
        addedAt: firestore.Timestamp.now(),
        languages: user.doc.data().languages,
        group: user.doc.data().group
    })

    res.status(httpStatus.OK).send('user entered in the waiting room')
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