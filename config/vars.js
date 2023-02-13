require('dotenv').config()

module.exports = {
    port: process.env.PORT,
    firebaseKey: process.env.SERVICE_ACCOUNT_KEY
}