const { db } = require('./firebase')

exports.getUser = async id => {
    const ref = db.collection('users').doc(id)
    const roomInfo = ref.collection('locked').doc('roomInfo')
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