const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true,
    sparse: true
  },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    telegram: { type: String, trim: true, default: '' },
    region: { type: String, required: true, trim: true },
    comment: { type: String, trim: true, default: '' }
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'negotiating', 'completed', 'cancelled'],
    default: 'new'
  },
  crmPayloads: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Auto-generate leadId before save if not present (simple readable format: MB-XXXX)
OrderSchema.pre('save', async function(next) {
  if (this.leadId) return next();
  
  const count = await mongoose.model('Order').countDocuments();
  const index = String(count + 1).padStart(4, '0');
  this.leadId = `MB-${index}`;
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
