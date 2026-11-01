const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const usersCollection = db.collection('users');

    // Check if admin exists, update password if needed
    const existingAdmin = await usersCollection.findOne({ email: 'admin@hollyskunk.com' });
    if (existingAdmin) {
      await usersCollection.updateOne(
        { email: 'admin@hollyskunk.com' },
        { $set: { password: 'Benjaminned1', role: 'admin' } }
      );
      return res.status(200).json({
        success: true,
        message: 'Admin account synchronized with password: Benjaminned1'
      });
    }

    // Insert default admin user
    const defaultAdmin = {
      name: 'Benjamin Ned',
      email: 'admin@hollyskunk.com',
      password: 'Benjaminned1',
      role: 'admin',
      createdAt: new Date()
    };

    await usersCollection.insertOne(defaultAdmin);

    res.status(201).json({
      success: true,
      message: '🛡️ Admin account created successfully!',
      credentials: {
        email: defaultAdmin.email,
        password: defaultAdmin.password
      }
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;