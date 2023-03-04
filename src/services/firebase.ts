import { firebaseCredentials } from "../config/vars"
import admin from 'firebase-admin'

admin.initializeApp({
    credential: admin.credential.cert(firebaseCredentials)
})

export const getAuth = admin.auth()
export const firestore = admin.firestore
export const db = firestore()