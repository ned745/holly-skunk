const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(express.json());

// Enable CORS for frontend integration
app.use(cors({ origin: '*', credentials: true }));

// --- MULTER STORAGE SETUP FOR DIRECT FILE UPLOADS ---
const uploadDir = path.join(__dirname, 'public', 'uploads');
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

// Serve uploaded images statically
app.use('/uploads', express.static(uploadDir));

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("🚨 CRITICAL FAULT: MONGO_URI variable is undefined inside process.env!");
  process.exit(1);
}

let db;
let client;

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('holly_skunk');
    console.log("🛡️ HOLLY SKUNK CLOUD VAULT: Successfully connected to MongoDB Atlas Layer!");
  } catch (err) {
    console.error("🚨 CLOUD CONFIGURATION HANDSHAKE FAILURE:", err);
    process.exit(1);
  }
}
connectToMongoDB();

app.use((req, res, next) => {
  req.db = db;
  next();
});

// System Status Endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: "online", project: "Holly Skunk API Gateway v1.0.0" });
});

// API Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));

// Direct Product Add Endpoint with File Upload Support
app.post('/api/products/add', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, category, description, stock, image } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Product name and price are required.' });
    }

    let imagePath = image || '';
    if (req.file) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      imagePath = `${protocol}://${host}/uploads/${req.file.filename}`;
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
      message: 'Product added to catalog successfully!',
      productId: result.insertedId 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Synchronization Seed Route
app.get('/api/seed', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ success: false, error: 'Database connection not initialized.' });
    }
    
    const usersCollection = req.db.collection('users');

    await usersCollection.updateOne(
      { $or: [{ email: 'admin@hollyskunk.com' }, { username: 'admin@hollyskunk.com' }] },
      { 
        $set: { 
          username: 'admin@hollyskunk.com',
          email: 'admin@hollyskunk.com',
          password: 'Benjaminned1', 
          role: 'Admin' 
        } 
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: '🛡️ Admin profile synchronized! Role: Admin, Password: Benjaminned1'
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clean 404 API Fallback
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found on Holly Skunk API engine.` 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal API Server Error Exception thrown.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HOLLY SKUNK ENGINE RUNNING: Secure server deployed on Port ${PORT}`);
});