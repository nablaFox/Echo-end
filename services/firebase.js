const { firebaseKey } = require('../config/vars')

const admin = require('firebase-admin')
const serviceAccount = JSON.parse(firebaseKey)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

module.exports = {
    getAuth: admin.auth(),
    firestore: admin.firestore,
    db
}