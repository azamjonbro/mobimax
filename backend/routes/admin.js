const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Settings = require('../models/Settings');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const Visit = require('../models/Visit');
const Log = require('../models/Log');
const Analytics = require('../models/Analytics');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// All routes in this file are protected by jwt verification middleware
router.use(auth);

// --- UPLOAD HANDLER ---
// POST /admin/upload - Upload an image asset
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    // Return relative URL that front-end can append to API base URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- DASHBOARD ANALYTICS ---
// GET /admin/dashboard - Fetch dashboard figures
router.get('/dashboard', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // 1. KPI Aggregations
    const activeLeadsCount = await Order.countDocuments();
    const todayLeadsCount = await Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    
    // Est. revenue from all leads
    const orders = await Order.find();
    const totalEstRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Total visits count
    const totalVisits = await Visit.countDocuments();
    const todayVisits = await Visit.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    // Conversion rate
    const conversionRate = totalVisits > 0 ? ((activeLeadsCount / totalVisits) * 100).toFixed(1) : 0;

    // 2. Chart data - Last 14 days
    const chartData = await Analytics.find()
      .sort({ date: -1 })
      .limit(14);
    
    // Reverse to show chronologically
    chartData.reverse();

    // 3. Popular products
    const popularProducts = await Product.find({ status: 'active' })
      .populate('category')
      .populate('brand')
      .sort({ popular: -1, stock: -1 })
      .limit(5);

    // 4. Recent leads
    const recentLeads = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      summary: {
        totalRevenue: totalEstRevenue,
        totalLeads: activeLeadsCount,
        todayLeads: todayLeadsCount,
        totalVisits: totalVisits,
        todayVisits: todayVisits,
        conversionRate: Number(conversionRate)
      },
      charts: chartData,
      popularProducts,
      recentLeads
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error compiling dashboard statistics' });
  }
});


// --- CRUD PRODUCTS ---
// GET /admin/products - Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .populate('brand')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving products list' });
  }
});

// POST /admin/products - Create a product
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    await Log.create({
      action: 'PRODUCT_CREATE',
      details: `Created product "${product.name}" (SKU: ${product.sku})`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /admin/products/:id - Update product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Log.create({
      action: 'PRODUCT_UPDATE',
      details: `Updated product "${product.name}" (SKU: ${product.sku})`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Log.create({
      action: 'PRODUCT_DELETE',
      details: `Deleted product "${product.name}" (SKU: ${product.sku})`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- CRUD CATEGORIES ---
// GET /admin/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});

// POST /admin/categories
router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    await Log.create({
      action: 'CATEGORY_CREATE',
      details: `Created category: ${category.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /admin/categories/:id
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Log.create({
      action: 'CATEGORY_UPDATE',
      details: `Updated category: ${category.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    // Check if category has dependencies in products
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category while products are assigned to it' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Log.create({
      action: 'CATEGORY_DELETE',
      details: `Deleted category: ${category.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- CRUD BRANDS ---
// GET /admin/brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving brands' });
  }
});

// POST /admin/brands
router.post('/brands', async (req, res) => {
  try {
    const brand = await Brand.create(req.body);

    await Log.create({
      action: 'BRAND_CREATE',
      details: `Created brand: ${brand.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /admin/brands/:id
router.put('/admin/brands/:id', async (req, res) => {
  // Wait, let's make sure both /brands/:id and /admin/brands/:id match correctly
});
// Let's keep it simple: we define router.put('/brands/:id', ...)
router.put('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    await Log.create({
      action: 'BRAND_UPDATE',
      details: `Updated brand: ${brand.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(brand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /admin/brands/:id
router.delete('/brands/:id', async (req, res) => {
  try {
    const productsCount = await Product.countDocuments({ brand: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete brand while products are assigned to it' });
    }

    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    await Log.create({
      action: 'BRAND_DELETE',
      details: `Deleted brand: ${brand.name}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- CRUD ORDERS / LEADS ---
// GET /admin/orders - Get leads
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders list' });
  }
});

// PUT /admin/orders/:id - Update lead status
router.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Log.create({
      action: 'ORDER_STATUS_UPDATE',
      details: `Updated Order ${order.leadId} status to "${status}"`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /admin/orders/:id - Remove order lead
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Log.create({
      action: 'ORDER_DELETE',
      details: `Deleted Order ${order.leadId} log record`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json({ message: 'Order record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- CRUD SETTINGS (CONFIG WITH SECRETS) ---
// GET /admin/settings - Read details (admin gets credentials too)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving settings' });
  }
});

// PUT /admin/settings - Save configuration details
router.put('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();

    await Log.create({
      action: 'SETTINGS_UPDATE',
      details: 'Updated global store, analytics, and CRM configuration details',
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// --- CRUD BANNERS ---
// GET /admin/banners
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ orderIndex: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving banners' });
  }
});

// POST /admin/banners
router.post('/banners', async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    await Log.create({
      action: 'BANNER_CREATE',
      details: `Created homepage banner: ${banner.title}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /admin/banners/:id
router.put('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    await Log.create({
      action: 'BANNER_UPDATE',
      details: `Updated homepage banner: ${banner.title}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /admin/banners/:id
router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    await Log.create({
      action: 'BANNER_DELETE',
      details: `Deleted homepage banner: ${banner.title}`,
      admin: req.admin._id,
      ip: req.ip
    });

    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- SYSTEM LOGS ---
// GET /admin/logs - Fetch audit records
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving audit logs' });
  }
});

module.exports = router;
