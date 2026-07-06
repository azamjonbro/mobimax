const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class HubSpotAdapter extends BaseAdapter {
  async sendLead(order) {
    const { accessToken } = this.config;

    if (!accessToken) {
      console.log(`[HubSpot Mock] New lead simulated for order ${order.leadId}`);
      return { status: 'mocked', message: 'HubSpot access token missing. Simulated success.' };
    }

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      // 1. Create HubSpot Contact
      const contactResponse = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', {
        properties: {
          firstname: order.customer.name,
          phone: order.customer.phone,
          company: order.customer.company || '',
          message: order.customer.comment || '',
          region: order.customer.region
        }
      }, { headers });

      const contactId = contactResponse.data.id;

      // 2. Create HubSpot Deal
      const dealResponse = await axios.post('https://api.hubapi.com/crm/v3/objects/deals', {
        properties: {
          dealname: `MobiMax Order - ${order.leadId}`,
          amount: order.total,
          dealstage: 'appointmentscheduled', // standard starting stage in HubSpot
          pipeline: 'default'
        }
      }, { headers });

      const dealId = dealResponse.data.id;

      // 3. Associate Contact with Deal
      await axios.put(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/3`, {}, { headers });

      return { contactId, dealId, status: 'success' };
    } catch (error) {
      console.error('[HubSpot Error]', error.response ? error.response.data : error.message);
      throw new Error(`HubSpot push failed: ${error.message}`);
    }
  }
}

module.exports = HubSpotAdapter;
