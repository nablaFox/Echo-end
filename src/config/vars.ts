import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT

export const firebaseCredentials = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\@/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
}