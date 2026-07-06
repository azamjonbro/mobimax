const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  phone: { type: String, default: '+1 (555) 019-2834' },
  telegramLink: { type: String, default: 'https://t.me/mobimax_accessories' },
  instagramLink: { type: String, default: 'https://instagram.com/mobimax' },
  address: { type: String, default: '123 Apple Way, Cupertino, CA' },
  workingHours: { type: String, default: 'Mon - Fri: 9:00 AM - 6:00 PM' },
  mapEmbedUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.3325300302484!2d-122.03118!3d37.33182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb591273517df%3A0x1f81d11893c5d648!2sApple%20Park!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus' },
  seo: {
    title: { type: String, default: 'MobiMax | Long Range Radios & Professional Accessories' },
    description: { type: String, default: 'Premium B2B marketplace for professional long-range walkie talkies, antennas, chargers, earpieces, and military-grade communication accessories.' },
    keywords: { type: String, default: 'walkie talkies, ratsiya, Motorola, Baofeng, professional radio, radio chargers, walkie talkie batteries' }
  },
  pixels: {
    googleAnalyticsId: { type: String, default: '' },
    metaPixelId: { type: String, default: '' },
    tiktokPixelId: { type: String, default: '' },
    yandexMetricaId: { type: String, default: '' },
    googleTagManagerId: { type: String, default: '' }
  },
  crm: {
    activeProvider: {
      type: String,
      enum: ['amoCRM', 'Bitrix24', 'HubSpot', 'Webhook', 'GoogleSheets', 'CustomAPI', 'None'],
      default: 'None'
    },
    amoCRM: {
      domain: { type: String, default: '' },
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' },
      authCode: { type: String, default: '' },
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' }
    },
    bitrix24: {
      webhookUrl: { type: String, default: '' }
    },
    hubspot: {
      accessToken: { type: String, default: '' }
    },
    webhook: {
      url: { type: String, default: '' },
      secret: { type: String, default: '' }
    },
    googleSheets: {
      spreadsheetId: { type: String, default: '' },
      clientEmail: { type: String, default: '' },
      privateKey: { type: String, default: '' }
    },
    customApi: {
      url: { type: String, default: '' },
      apiKey: { type: String, default: '' }
    }
  },
  telegramNotification: {
    enabled: { type: Boolean, default: false },
    botToken: { type: String, default: '' },
    chatId: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);
