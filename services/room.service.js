const { db, firestore } = require('./firebase.js')

const getRoom = async id => {
    const ref = db.collection('rooms').doc(id)
    const info = ref.collection('locked').doc('info')
    const members = ref.collection('locked').doc('members')

    const doc = await ref.get()
    const infoDoc = await info.get()
    const membersDoc = await members.get()

    return {
        ref,
        info,
        members,
        doc,
        infoDoc,
        membersDoc
    }
}

const createRoom = async group => {
    const ref = db.collection('rooms').doc()
    const info = ref.collection('locked').doc('info')

    await ref.set({
        name: 'New Room',
        info: info
    })

    await info.set({
        open: true,
        group: group,
        since: firestore.Timestamp.now()
    })

    return await getRoom(ref.id)
}

module.exports = {
    getRoom,
    createRoom
}