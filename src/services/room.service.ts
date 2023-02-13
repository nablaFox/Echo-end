import { db, firestore } from './firebase'

export const getRoom = async (id: string) => {
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

export const createRoom = async (group: number) => {
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