const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class Bitrix24Adapter extends BaseAdapter {
  async sendLead(order) {
    const { webhookUrl } = this.config;

    if (!webhookUrl) {
      console.log(`[Bitrix24 Mock] New lead simulated for order ${order.leadId}`);
      return { status: 'mocked', message: 'Bitrix24 webhook URL missing. Simulated success.' };
    }

    try {
      // Bitrix24 webhook format: https://domain.bitrix24.com/rest/1/webhookkey/crm.lead.add.json
      const itemsList = order.items.map(item => `- Product ID: ${item.product}, Qty: ${item.quantity}, Price: ${item.price}`).join('\n');
      
      const payload = {
        fields: {
          TITLE: `MobiMax Lead - ${order.leadId}`,
          NAME: order.customer.name,
          PHONE: [
            {
              VALUE: order.customer.phone,
              VALUE_TYPE: "WORK"
            }
          ],
          COMPANY_TITLE: order.customer.company || "Individual",
          OPPORTUNITY: order.total,
          CURRENCY_ID: "USD",
          ADDRESS_REGION: order.customer.region,
          COMMENTS: `
            Telegram: ${order.customer.telegram || 'Not provided'}
            Customer Comment: ${order.customer.comment || 'None'}
            Ordered Products:\n${itemsList}
          `
        }
      };

      const response = await axios.post(webhookUrl, payload);
      return response.data;
    } catch (error) {
      console.error('[Bitrix24 Error]', error.response ? error.response.data : error.message);
      throw new Error(`Bitrix24 lead push failed: ${error.message}`);
    }
  }
}

module.exports = Bitrix24Adapter;
