const { db } = require('./firebase')

exports.getUserRef = id => db.collection('users').doc(id)
exports.getUserRoomRef = id => this.getUserRef(id)
    .collection('locked')
    .doc('roomInfo')

exports.getUser = async id => {
    const ref = this.getUserRef(id)
    const roomInfo = this.getUserRoomRef(id)
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
