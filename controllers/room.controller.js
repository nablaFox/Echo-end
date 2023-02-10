const admin = require('../config/firebase')
const httpStatus = require('http-status')

const db = admin.firestore()

const waitingRoom = db.collection('waitingRoom')
    .orderBy('addedAt', 'desc')

function roomRef(uid = null) {
    const room = uid ? 
        db.collection('rooms').doc(uid) : 
        db.collection('rooms').doc()

    const locked = room.collection('locked')
    const info = locked.doc('info')
    const members = locked.doc('members')

    return {
        room,
        info,
        members
    }
}

waitingRoom.onSnapshot(async snapshot => {
    snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
            const last = snapshot.docs[0].data()
            if (last.group > snapshot.size) return
            
            const batch = db.batch()
            const { room: newRoomRef, info, members } = roomRef()

            batch.set(newRoomRef, { 
                name: 'New Room',
                info: info
            })
            batch.set(info, {
                open: true,
                since: admin.firestore.Timestamp.now(),
                group: last.group
            })
            
            const users = await snapshot.query
                .where('group', '==', last.group) // prendi tutti gli utenti che vogliono fare la stessa modalità
                .where('languages', 'array-contains-any', last.languages) // che hanno la stessa lingua
                .limit(last.group) // nel numero specificato dalla modalità
                .get()

            if (users.size < last.group) return // se non ci sono abbastanza utenti termina

            users.forEach(doc => {
                batch.set(members, { 
                    [doc.id]: true 
                }, { merge: true }) // aggiungi gli utenti come membri della stanza
                batch.delete(doc.ref) // elimina gli utenti dalla waiting Room
                const user = db.collection('users')
                    .doc(doc.id)
                    .collection('locked')
                    .doc('roomInfo')
                    
                batch.update(user, { 
                    currentRoom: newRoomRef,
                    isWaiting: false,
                    totalPeoples: admin.firestore.FieldValue.increment(last.group - 1),
                    totalRooms:  admin.firestore.FieldValue.increment(1)
                }) // aggiorna il campo currentRoom degli utenti
            })

            await batch.commit()
        }
    })
})

exports.match = async (req, res) => {
    const { userRoomInfoDoc, userRoomInfoRef, userDoc } = req.locals

    if (userRoomInfoDoc.data() && userRoomInfoDoc.data().currentRoom) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in a room') // verificare se l'utente aggiunto alla coda non ha già una currentRoom
    }
    if (userRoomInfoDoc.data() && userRoomInfoDoc.data().isWaiting) {
        return res.status(httpStatus.BAD_REQUEST).send('user already in the waiting room')
    }

    userRoomInfoRef.set({ 
        isWaiting: true
    }, { merge: true })

    const waitingRoom = db.collection('waitingRoom')
    await waitingRoom.doc(userDoc.id).set({
        addedAt: admin.firestore.Timestamp.now(),
        languages: userDoc.data().languages,
        group: userDoc.data().group
    })
    console.log('flag')
    res.status(httpStatus.OK).send('user entered in the waiting room')
}

exports.leave = async (req, res) => {
    const { room, info, members: membersRef } = roomRef(req.params.id)
    const batch = db.batch()
    
    // time spent in the room
    const {since: { seconds: since }} = (await info.get()).data()
    const now = admin.firestore.Timestamp.now().seconds
    const totalTime = (now - since) * 1000
    
    // update members
    const members = (await membersRef.get()).data()
    
    for (const member in members) {
        const userRef = db.collection('users').doc(member)
        const userRoomInfo = userRef.collection('locked').doc('roomInfo')
        const exRooms = userRef.collection('exRooms')
        batch.set(userRoomInfo, {
            currentRoom: null,
            totalTime: admin.firestore.FieldValue.increment(totalTime)
        }, { merge: true })

        batch.set(exRooms.doc(room.id), { 
            ref: room,
            addedAt: admin.firestore.Timestamp.now() 
        })
    }   

    batch.update(info, {
        open: false,
        totalTime: totalTime
    })

    await batch.commit()
    res.status(httpStatus.OK).send('User exited and room closed')
}