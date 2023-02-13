const { db, firestore } = require('./firebase')
const { createRoom } = require('./room.service')

const waitingRoom = db
    .collection('waitingRoom')
    .orderBy('addedAt', 'desc')

exports.startMatching = () => {
    console.log('watching waiting to match users....')
    waitingRoom.onSnapshot(async snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
                const last = snapshot.docs[0].data()
                if (last.group > snapshot.size) return // se il gruppo è maggiore degli utenti in attesa termina
    
                const users = await snapshot.query
                    .where('group', '==', last.group) // prendi tutti gli utenti che vogliono fare la stessa modalità
                    .where('languages', 'array-contains-any', last.languages) // che hanno la stessa lingua
                    .limit(last.group) // nel numero specificato dalla modalità
                    .get()
    
                if (users.size < last.group) return // se non ci sono abbastanza utenti termina
                const room = await createRoom(last.group)
                const batch = db.batch()

                users.forEach(doc => {
                    batch.set(room.members, { 
                        [doc.id]: true 
                    }, { merge: true }) // aggiungi gli utenti come membri della stanza
            
                    batch.delete(doc.ref)  // elimina gli utenti dalla waiting Room
            
                    const user = db
                        .collection('users')
                        .doc(doc.id)
                        .collection('locked')
                        .doc('roomInfo')
            
                    batch.update(user, { 
                        currentRoom: room.ref,
                        isWaiting: false,
                        totalPeoples: firestore.FieldValue.increment(last.group - 1),
                        totalRooms:  firestore.FieldValue.increment(1)
                    }) // aggiorna gli utenti
                })

                await batch.commit()
            }
        })
    })
}