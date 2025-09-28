const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyLogin, registerUser } = require('./userm');

const SECRET = 'supersecretkey';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await verifyLogin(username, password);

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

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const success = await registerUser(username, password, 'user');
  if (!success) {
    return res.status(500).json({ error: 'User already exists or failed to register' });
  }

  res.json({ message: 'Registration successful' });
});

router.post('/register-admin', async (req, res) => {
  const { username, password, adminKey } = req.body;
  if (!username || !password || !adminKey) {
    return res.status(400).json({ error: 'Username, password, and admin key are required' });
  }

  if (adminKey !== 'XUcAHT9CNx2073pLGmZ12OB9bHhrg5Uy') {
    return res.status(403).json({ error: 'Invalid admin registration key' });
  }

  const success = await registerUser(username, password, 'admin');
  if (!success) {
    return res.status(500).json({ error: 'User already exists or failed to register' });
  }

  res.json({ message: 'Admin registration successful' });
});

module.exports = router;
