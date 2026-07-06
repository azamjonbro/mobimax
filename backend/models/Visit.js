const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  path: { type: String, default: '/' },
  referrer: { type: String, default: '' },
  sessionId: { type: String, default: '' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Visit', VisitSchema);
