const express = require('express');
const router = express.Router();
const adminGuard = require('../middleware/admin');

router.use(adminGuard);

router.get('/dashboard-stats', async (req, res) => {
 try {
  const totalUsers = await req.db.collection('users').countDocuments();
  const totalProducts = await req.db.collection('products').countDocuments();
  res.status(200).json({ success: true, metrics: { registeredCustomers: totalUsers, catalogSKUs: totalProducts } });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

router.post('/add-product', async (req, res) => {
 try {
  const { name, price, category, description, stock } = req.body;
  const newProduct = { name: name.trim(), price: parseFloat(price), category: category.toLowerCase(), description: description.trim(), stock: parseInt(stock), updatedAt: new Date() };
  await req.db.collection('products').insertOne(newProduct);
  res.status(201).json({ success: true, message: 'Product added!' });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

module.exports = router;
