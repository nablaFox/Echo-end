const { firestore } = require('../services/firebase')
const httpStatus = require('http-status')
const hall = require('../services/hall.service')

exports.enter = async (req, res) => {
    const { user } = res.locals

    if (user.roomInfoDoc.data()?.currentRoom) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in a room')
        // verificare se l'utente non ha già una currentRoom
    }
    if (user.roomInfoDoc.data()?.isWaiting) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in the hall')
        // verificare se l'utente non sta già aspettando
    }

    await hall.enter(user.doc.id, {
        addedAt: firestore.Timestamp.now(),
        languages: user.doc.data().languages,
        group: user.doc.data().group
    })

    res.status(httpStatus.OK).send('user entered in the hall')   
}

exports.leave = () => { }