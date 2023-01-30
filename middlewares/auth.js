const admin = require('../config/firebase')
const httpStatus = require('http-status')

const db = admin.firestore()
const getAuth = admin.auth()

module.exports = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(httpStatus.UNAUTHORIZED).send('required authorization')
    
    try {
        const { uid } = await getAuth.verifyIdToken(token) // verificare se gli utenti sono autenticati
        const userRef = db.collection('users').doc(uid)
        const userDoc = await userRef.get()

        if (!userDoc.exists) {
            return res.status(httpStatus.NOT_FOUND).send('user not found')
        }

        req.locals = { userRef, userDoc }
        next()
    } catch(err) {
        console.log(err)
        res.status(httpStatus.UNAUTHORIZED).send(err.code)
    }
}