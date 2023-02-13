import { db } from './firebase'

export const getUserRef = (id: string) => db.collection('users').doc(id)

export const getUserRoomRef = (id: string) => getUserRef(id)
    .collection('locked')
    .doc('roomInfo')

export const getUser = async (id: string) => {
    const ref = getUserRef(id)
    const roomInfo = getUserRoomRef(id)
    const exRooms = ref.collection('exRooms')

    const doc = await ref.get()
    const roomInfoDoc = await roomInfo.get()
    const exRoomsDoc = await exRooms.get()

    return { 
        ref,
        doc,
        roomInfo,
        roomInfoDoc,
        exRooms,
        exRoomsDoc
    }
}