const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class CustomAPIAdapter extends BaseAdapter {
  async sendLead(order) {
    const { url, apiKey } = this.config;

    if (!url) {
      console.log(`[CustomAPI Mock] New lead simulated for order ${order.leadId}`);
      return { status: 'mocked', message: 'Custom API endpoint URL missing. Simulated success.' };
    }

    try {
      const response = await axios.post(url, {
        leadId: order.leadId,
        customer: order.customer,
        items: order.items,
        total: order.total,
        status: order.status,
        timestamp: order.createdAt
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        }
      });

      return { status: 'success', data: response.data };
    } catch (error) {
      console.error('[CustomAPI Error]', error.message);
      throw new Error(`Custom API dispatch failed: ${error.message}`);
    }
  }
}

module.exports = CustomAPIAdapter;
