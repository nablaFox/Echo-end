const { getAuth } = require('../services/firebase')
const { getUser } = require('../services/user.service')
const httpStatus = require('http-status')

module.exports = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(httpStatus.UNAUTHORIZED).send('required authorization')
    
    try {
        const { uid } = await getAuth.verifyIdToken(token)
        const user = await getUser(uid)

        if (!user.doc.exists) {
            return res.status(httpStatus.NOT_FOUND).send('user not found')
        }

        res.locals.user = user
        next()
    } catch(err) {
        console.log(err)
        res.status(httpStatus.UNAUTHORIZED).send(err.code)
    }
}