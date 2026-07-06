const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Banner = require('../models/Banner');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const Visit = require('../models/Visit');
const Analytics = require('../models/Analytics');
const AdapterManager = require('../crm/AdapterManager');

// GET /settings - Public settings (safe config only, no credentials)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Return only non-sensitive settings fields
    const publicSettings = {
      phone: settings.phone,
      telegramLink: settings.telegramLink,
      instagramLink: settings.instagramLink,
      address: settings.address,
      workingHours: settings.workingHours,
      mapEmbedUrl: settings.mapEmbedUrl,
      seo: settings.seo,
      pixels: settings.pixels
    };
    
    res.json(publicSettings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving settings' });
  }
});

// GET /banners - Get active slides for home slider
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ orderIndex: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving banners' });
  }
});

// GET /categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id, status: 'active' });
      return {
        ...cat.toObject(),
        productCount: count
      };
    }));
    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});

// GET /brands - Get all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving brands' });
  }
});

// GET /products - List/Filter products
router.get('/products', async (req, res) => {
  const { category, brand, search, sort, page = 1, limit = 12, minPrice, maxPrice, frequency, power, range, inStock, featured, popular, new: queryNew, useCase } = req.query;

  try {
    const conditions = [{ status: 'active' }];

    // Filters
    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) conditions.push({ category: catDoc._id });
    }
    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) conditions.push({ brand: brandDoc._id });
    }
    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Specifications & Numeric Filters
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      conditions.push({ price: priceFilter });
    }
    if (inStock === 'true') {
      conditions.push({ stock: { $gt: 0 } });
    }

    // Featured, Popular, New flags
    if (featured === 'true') {
      conditions.push({ featured: true });
    }
    if (popular === 'true') {
      conditions.push({ popular: true });
    }
    if (queryNew === 'true') {
      conditions.push({ new: true });
    }

    // Use Case tags
    if (useCase) {
      if (useCase === 'security') {
        conditions.push({
          $or: [
            { name: { $regex: 'qo\'riqlash|security|охраna|patrul', $options: 'i' } },
            { description: { $regex: 'qo\'riqlash|security|охраna|patrul', $options: 'i' } }
          ]
        });
      } else if (useCase === 'construction') {
        conditions.push({
          $or: [
            { name: { $regex: 'qurilish|construction|стройка|kran', $options: 'i' } },
            { description: { $regex: 'qurilish|construction|стройка|kran', $options: 'i' } }
          ]
        });
      } else if (useCase === 'car') {
        conditions.push({
          $or: [
            { name: { $regex: 'avtomobil|car|авто|mashina|taxi', $options: 'i' } },
            { description: { $regex: 'avtomobil|car|авто|mashina|taxi', $options: 'i' } }
          ]
        });
      } else if (useCase === 'accessories') {
        const accCat = await Category.findOne({ slug: 'accessories' });
        if (accCat) {
          conditions.push({ category: accCat._id });
        }
      }
    }

    // Custom Spec parameters (Frequency, Power, Range) stored in specs array
    if (frequency) {
      conditions.push({ 'specifications.key': { $regex: 'frequency|диапазон', $options: 'i' }, 'specifications.value': { $regex: frequency, $options: 'i' } });
    }
    if (power) {
      conditions.push({ 'specifications.key': { $regex: 'power|мощность', $options: 'i' }, 'specifications.value': { $regex: power, $options: 'i' } });
    }
    if (range) {
      conditions.push({ 'specifications.key': { $regex: 'range|дальность', $options: 'i' }, 'specifications.value': { $regex: range, $options: 'i' } });
    }
    
    const query = { $and: conditions };

    // Sort options
    let sortOptions = { createdAt: -1 }; // newest by default
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'popular') sortOptions = { popular: -1, createdAt: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET /products/featured - Featured products
router.get('/products/featured', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', featured: true })
      .populate('category')
      .populate('brand')
      .limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

// GET /products/popular - Popular products
router.get('/products/popular', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', popular: true })
      .populate('category')
      .populate('brand')
      .limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular products' });
  }
});

// GET /products/new - New arrivals
router.get('/products/new', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', new: true })
      .populate('category')
      .populate('brand')
      .limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching new products' });
  }
});

// GET /products/:slug - Get single product
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category')
      .populate('brand');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving product' });
  }
});

// POST /order - Submit a lead/order
router.post('/order', async (req, res) => {
  const { customer, items } = req.body;

  try {
    if (!customer || !customer.name || !customer.phone || !customer.region) {
      return res.status(400).json({ message: 'Missing required customer contact fields (name, phone, region)' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required for checkout' });
    }

    // Verify products & calculate total price
    const orderItems = [];
    let orderTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ID ${item.product} not found` });
      }
      
      const price = product.price;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price
      });

      orderTotal += price * item.quantity;
    }

    // Create the order document in DB
    const order = await Order.create({
      customer,
      items: orderItems,
      total: orderTotal,
      status: 'new'
    });

    // Populate order with product references for CRM and Telegram formatting
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product');

    // Fetch system configurations for CRM routing
    const settings = await Settings.findOne() || await Settings.create({});

    // Process lead routing asynchronously to ensure speedy client checkout
    AdapterManager.processLead(populatedOrder, settings).catch(err => {
      console.error('[Background Lead Processing Error]', err);
    });

    // Update Daily Analytics Leads cache
    const todayStr = new Date().toISOString().slice(0, 10);
    await Analytics.findOneAndUpdate(
      { date: todayStr },
      { $inc: { leads: 1, revenueEstimate: orderTotal } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Lead registered successfully',
      leadId: order.leadId,
      total: orderTotal
    });

  } catch (err) {
    console.error('[Checkout Error]', err);
    res.status(500).json({ message: 'Server error during order submission' });
  }
});

// POST /visits - Logging hits
router.post('/visits', async (req, res) => {
  const { path, referrer, sessionId } = req.body;
  try {
    await Visit.create({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: path || '/',
      referrer: referrer || '',
      sessionId: sessionId || ''
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    await Analytics.findOneAndUpdate(
      { date: todayStr },
      { $inc: { visits: 1 } },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
