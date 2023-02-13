import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT
export const firebaseKey = process.env.SERVICE_ACCOUNT_KEY