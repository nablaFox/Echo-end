const admin = require('../config/firebase')
const httpStatus = require('http-status')

const db = admin.firestore()

const waitingRoom = db.collection('waitingRoom')
    .orderBy('addedAt', 'desc')

waitingRoom.onSnapshot(async snapshot => {
    snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
            const last = snapshot.docs[0].data()
            if (last.group > snapshot.size) return
            
            const batch = db.batch()
            const newRoomRef = db.collection('rooms').doc()
            const members = newRoomRef.collection('members')

            batch.set(newRoomRef, { // crea una nuova stanza
                open: true,
                name: 'test name',
                since: admin.firestore.Timestamp.now()
            })
            
            const users = await snapshot.query
                .where('group', '==', last.group) // prendi tutti gli utenti che vogliono fare la stessa modalità
                .where('languages', 'array-contains-any', last.languages) // che hanno la stessa lingua
                .limit(last.group) // nel numero specificato dalla modalità
                .get()

            if (users.size < last.group) return // se non ci sono abbastanza utenti termina

            users.forEach(doc => {
                batch.set(members.doc(doc.id), { exists: true }) // aggiungi gli utenti come membri della stanza
                batch.delete(doc.ref) // elimina gli utenti dalla waiting Room
                const user = db.collection('users')
                    .doc(doc.id)
                    .collection('locked')
                    .doc('roomInfo')
                    
                batch.update(user, { 
                    currentRoom: newRoomRef,
                    isWaiting: false
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
    res.status(httpStatus.OK).send('user entered in the waiting room')
}

exports.leave = async (req, res) => {
    const roomRef = db.collection('rooms').doc(req.params.id)
    const members = await roomRef.collection('members').get()
    const batch = db.batch()
    members.forEach(doc => {
        const user = db.collection('users').doc(doc.id)
        const exRooms = user.collection('exRooms')
        batch.update(user, { currentRoom: null })
        batch.set(exRooms.doc(roomRef.id), { ref: roomRef })
    })

    batch.update(roomRef, { open: false })
    await batch.commit()
    res.send('User exited and room closed')
}