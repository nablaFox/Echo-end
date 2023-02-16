import { firestore, db } from "./firebase"
import { createRoom } from "./room.service"
import { getUserRoomRef } from "./user.service"
import hall from './hall.service'

const query = hall.ref.orderBy('addedAt', 'desc')

export const startMatching = async () => {
    await hall.clearQueue()
    query.onSnapshot(async snapshot => {
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

                users.forEach(async doc => {
                    batch.set(room.members, { 
                        [doc.id]: true 
                    }, { merge: true }) // aggiungi gli utenti come membri della stanza
            
                    batch.delete(doc.ref)  // elimina gli utenti dalla hall

                    batch.update(getUserRoomRef(doc.id), { 
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