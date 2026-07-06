const mongoose = require('mongoose');

const SpecificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  specifications: [SpecificationSchema],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  mainImage: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  new: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'active'
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
