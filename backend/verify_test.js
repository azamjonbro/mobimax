require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Settings = require('./models/Settings');
const AdapterManager = require('./crm/AdapterManager');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ratsiya';

async function runVerification() {
  console.log('--- STARTING MOBIMAX INTEGRATION VERIFICATION ---');
  
  try {
    // 1. Connect to DB
    await mongoose.connect(MONGO_URI);
    console.log('✓ MongoDB Connected.');

    // 2. Fetch a sample product
    const product = await Product.findOne();
    if (!product) {
      console.error('✗ No products found. Please run "npm run seed" first.');
      process.exit(1);
    }
    console.log(`✓ Retrieved Sample Product: ${product.name} (Price: $${product.price})`);

    // 3. Create a mock order (Lead)
    const mockOrderPayload = {
      customer: {
        name: 'Verification Bot',
        phone: '+998 90 999 9999',
        company: 'Verification Labs',
        telegram: '@verify_bot',
        region: 'Test Lab Cluster 1',
        comment: 'Auto integration test run.'
      },
      items: [
        {
          product: product._id,
          quantity: 2,
          price: product.price
        }
      ],
      total: product.price * 2,
      status: 'new'
    };

    const order = await Order.create(mockOrderPayload);
    console.log(`✓ Lead created in MongoDB with ID: ${order.leadId}`);

    // 4. Populate product references
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    // 5. Query system settings
    const settings = await Settings.findOne() || await Settings.create({});
    console.log(`✓ Loaded settings. Active CRM Provider: ${settings.crm?.activeProvider || 'None'}`);

    // 6. Test CRM processing
    console.log('Sending lead to CRM and Telegram modules...');
    const crmResult = await AdapterManager.processLead(populatedOrder, settings);
    console.log('✓ CRM Dispatch result:', JSON.stringify(crmResult, null, 2));

    // Verify order was updated with logs
    const finalOrderState = await Order.findById(order._id);
    if (finalOrderState.crmPayloads) {
      console.log('✓ Order record updated with CRM payload logs.');
    } else {
      console.warn('⚠ Order record is missing CRM payload logs.');
    }

    // Clean up test order
    await Order.findByIdAndDelete(order._id);
    console.log('✓ Cleaned up verification lead record.');

    console.log('--- MOBIMAX INTEGRATION TEST COMPLETED SUCCESSFULLY ---');
    process.exit(0);

  } catch (err) {
    console.error('✗ Verification failed with error:', err.message);
    process.exit(1);
  }
}

runVerification();
