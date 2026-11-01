const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const db = req.db;
    const identifier = username || email;
    if (!identifier || !password) return res.status(400).json({ error: 'Missing required fields.' });
    
    const userExists = await db.collection('users').findOne({ 
      $or: [{ username: identifier.trim() }, { email: identifier.trim() }] 
    });
    if (userExists) return res.status(400).json({ error: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username: identifier.trim(),
      email: email ? email.trim() : identifier.trim(),
      password: hashedPassword,
      role: role && ['Standard', 'Admin'].includes(role) ? role : 'Standard',
      createdAt: new Date()
    };
    await db.collection('users').insertOne(newUser);
    res.status(201).json({ success: true, message: 'User account created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (username || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Username/email and password required.' });
    }

    const user = await req.db.collection('users').findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    // Support both bcrypt hashes and plain text passwords (for seeded dev users)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    // Standardize role to 'Admin' or 'Standard'
    const formattedRole = (user.role && user.role.toLowerCase() === 'admin') ? 'Admin' : (user.role || 'Standard');

    const token = jwt.sign(
      { userId: user._id, role: formattedRole },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        username: user.username || user.email,
        email: user.email,
        role: formattedRole
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;