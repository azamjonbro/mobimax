const axios = require('axios');
const BaseAdapter = require('./BaseAdapter');

class AmoCRMAdapter extends BaseAdapter {
  async sendLead(order) {
    const { domain, accessToken } = this.config;

    if (!domain || !accessToken) {
      console.log(`[amoCRM Mock] New lead simulated for order ${order.leadId}`);
      return { status: 'mocked', message: 'amoCRM config missing. Simulated success.' };
    }

    try {
      const baseUrl = `https://${domain}.amocrm.ru/api/v4`;
      
      // 1. Create a contact
      const contactResponse = await axios.post(`${baseUrl}/contacts`, [
        {
          name: order.customer.name,
          custom_fields_values: [
            {
              field_id: 123456, // Example standard field IDs
              field_name: "Phone",
              values: [{ value: order.customer.phone }]
            },
            {
              field_id: 123458,
              field_name: "Email",
              values: [{ value: order.customer.telegram || '' }]
            }
          ]
        }
      ], {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const contactId = contactResponse.data._embedded.contacts[0].id;

      // 2. Create the Lead
      const leadResponse = await axios.post(`${baseUrl}/leads`, [
        {
          name: `MobiMax Lead - ${order.leadId}`,
          price: order.total,
          _embedded: {
            contacts: [{ id: contactId }]
          },
          custom_fields_values: [
            {
              field_name: "Company",
              values: [{ value: order.customer.company || '' }]
            },
            {
              field_name: "Region",
              values: [{ value: order.customer.region }]
            },
            {
              field_name: "Comment",
              values: [{ value: order.customer.comment || '' }]
            }
          ]
        }
      ], {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return leadResponse.data;
    } catch (error) {
      console.error('[amoCRM Error]', error.response ? error.response.data : error.message);
      throw new Error(`amoCRM push failed: ${error.message}`);
    }
  }
}

module.exports = AmoCRMAdapter;
