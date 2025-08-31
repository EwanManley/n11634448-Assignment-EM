const express = require('express')
const jwt = require('jsonwebtoken')
const { verifyUser } = require('./userm')

const router = express.Router()
const SECRET = 'supersecretkey'

router.post('/login', (req, res) => {
    const { username, password } = req.body
    const user = verifyUser(username, password)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '1h' })
    res.json({ token })
})

module.exports = router
