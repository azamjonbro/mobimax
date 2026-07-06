const axios = require('axios');

class TelegramNotifier {
  /**
   * Send notification to Telegram bot
   * @param {Object} order - The Order document populated with product details
   * @param {Object} config - { enabled, botToken, chatId }
   */
  static async sendNotification(order, config) {
    if (!config || !config.enabled || !config.botToken || !config.chatId) {
      console.log(`[Telegram Notifier Mock] Telegram config missing or disabled. Notification content:\n`, 
        `New Lead ${order.leadId} for ${order.customer.name}`
      );
      return { status: 'mocked', message: 'Telegram config disabled/missing' };
    }

    try {
      const itemsList = order.items.map(item => {
        const productName = item.product && item.product.name ? item.product.name : 'Unknown Product';
        return `• ${productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
      }).join('\n');

      const messageText = `🔔 *New B2B Lead Received!*\n\n` +
        `*ID:* ${order.leadId}\n` +
        `*Name:* ${order.customer.name}\n` +
        `*Phone:* ${order.customer.phone}\n` +
        `*Company:* ${order.customer.company || 'Not provided'}\n` +
        `*Telegram:* ${order.customer.telegram || 'Not provided'}\n` +
        `*Region:* ${order.customer.region}\n` +
        `*Comment:* ${order.customer.comment || 'No comment'}\n\n` +
        `*Items Ordered:*\n${itemsList}\n\n` +
        `*Total Estimate:* $${order.total.toFixed(2)}\n\n` +
        `*Time:* ${new Date(order.createdAt || Date.now()).toLocaleString()}`;

      const response = await axios.post(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        chat_id: config.chatId,
        text: messageText,
        parse_mode: 'Markdown'
      });

      return response.data;
    } catch (error) {
      console.error('[Telegram Notification Error]', error.response ? error.response.data : error.message);
      // We do not throw this error to prevent failing the customer-facing order process, just log it.
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = TelegramNotifier;
