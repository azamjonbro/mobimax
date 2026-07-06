const axios = require('axios');
const crypto = require('crypto');
const BaseAdapter = require('./BaseAdapter');

class WebhookAdapter extends BaseAdapter {
  async sendLead(order) {
    const { url, secret } = this.config;

    if (!url) {
      console.log(`[Webhook Mock] Simulated webhook dispatch for ${order.leadId}`);
      return { status: 'mocked', message: 'Webhook URL missing. Simulated success.' };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      
      // Calculate HMAC signature if secret is provided
      if (secret) {
        const hmac = crypto.createHmac('sha256', secret);
        const signature = hmac.update(JSON.stringify(order)).digest('hex');
        headers['X-MobiMax-Signature'] = signature;
      }

      const response = await axios.post(url, order, { headers });
      return { status: 'success', statusCode: response.status, data: response.data };
    } catch (error) {
      console.error('[Webhook Error]', error.message);
      throw new Error(`Webhook dispatch failed: ${error.message}`);
    }
  }
}

module.exports = WebhookAdapter;
