const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyLogin, registerUser } = require('./userm');

const SECRET = 'supersecretkey';

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = verifyLogin(username, password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
        id: user.id,
        username: user.username,
        role: user.role
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

    res.json({ token });
});

router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required (username, password, role)' });
    }

    const success = registerUser(username, password, role);
    if (!success) {
        return res.status(500).json({ error: 'Failed to register user' });
    }

    res.json({ message: 'Registration successful' });
});

module.exports = router;
