const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer storage for direct device image uploads
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// GET /api/products - Fetch all products
router.get('/', async (req, res) => {
  try {
    const items = await req.db.collection('products').find({}).toArray();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/fashion - Fetch fashion category
router.get('/fashion', async (req, res) => {
  try {
    const items = await req.db.collection('products').find({ category: 'fashion' }).toArray();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/premium - Fetch premium category
router.get('/premium', async (req, res) => {
  try {
    const items = await req.db.collection('products').find({ category: 'premium' }).toArray();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/search - Search products by query string
router.get('/search', async (req, res) => {
  try {
    const { q, mode } = req.query;
    let filter = { 
      $or: [
        { name: { $regex: q || '', $options: 'i' } }, 
        { description: { $regex: q || '', $options: 'i' } }
      ] 
    };
    if (mode) filter.category = mode;
    const results = await req.db.collection('products').find(filter).toArray();
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/add - Add a new product with optional image file upload
router.post('/add', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Product name and price are required.' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const newProduct = {
      name: name.trim(),
      price: parseFloat(price),
      category: category ? category.toLowerCase() : 'fashion',
      description: description || '',
      stock: parseInt(stock, 10) || 0,
      image: imagePath,
      createdAt: new Date()
    };

    const result = await req.db.collection('products').insertOne(newProduct);
    res.status(201).json({ 
      success: true, 
      message: 'Product and image added to catalog successfully!',
      productId: result.insertedId 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update an existing product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, stock } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (price !== undefined) updates.price = parseFloat(price);
    if (category !== undefined) updates.category = category.toLowerCase();
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = parseInt(stock, 10);
    updates.updatedAt = new Date();

    const result = await req.db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id - Remove a product from inventory
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await req.db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
// POST /api/products/add - Add a new product with optional image file upload
router.post('/add', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, category, description, stock, image } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Product name and price are required.' });
    }

    let imagePath = image || '';
    if (req.file) {
      imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const newProduct = {
      name: name.trim(),
      price: parseFloat(price),
      category: category ? category.toLowerCase() : 'fashion',
      description: description || '',
      stock: parseInt(stock, 10) || 0,
      image: imagePath,
      createdAt: new Date()
    };

    const result = await req.db.collection('products').insertOne(newProduct);
    res.status(201).json({ 
      success: true, 
      message: 'Product and image added to catalog successfully!',
      productId: result.insertedId 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// backend/routes/products.js
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

if (req.file) {
  imagePath = `${baseUrl}/uploads/${req.file.filename}`;
}