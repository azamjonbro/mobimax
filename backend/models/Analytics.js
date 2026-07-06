const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
    unique: true
  },
  visits: {
    type: Number,
    default: 0
  },
  leads: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number, // percentage
    default: 0
  },
  revenueEstimate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
