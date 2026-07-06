class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Send order details (lead) to the CRM provider.
   * @param {Object} order - The full Order document containing items and customer info.
   * @returns {Promise<Object>} - The payload response/metadata returned by the CRM.
   */
  async sendLead(order) {
    throw new Error('sendLead(order) must be implemented by the CRM adapter subclass');
  }
}

module.exports = BaseAdapter;
