const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  orderIndex: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', BannerSchema);
