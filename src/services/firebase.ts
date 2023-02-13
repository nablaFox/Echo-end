import { firebaseKey } from "../config/vars"
import admin from 'firebase-admin'

const serviceAccount = JSON.parse(firebaseKey!)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

export const getAuth = admin.auth()
export const firestore = admin.firestore
export const db = firestore()