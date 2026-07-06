const AmoCRMAdapter = require('./AmoCRMAdapter');
const Bitrix24Adapter = require('./Bitrix24Adapter');
const HubSpotAdapter = require('./HubSpotAdapter');
const WebhookAdapter = require('./WebhookAdapter');
const GoogleSheetsAdapter = require('./GoogleSheetsAdapter');
const CustomAPIAdapter = require('./CustomAPIAdapter');
const TelegramNotifier = require('./TelegramNotifier');

class AdapterManager {
  /**
   * Resolve and get the active CRM adapter instance
   * @param {String} provider - Provider name
   * @param {Object} config - Settings CRM configurations
   * @returns {BaseAdapter|null}
   */
  static getAdapter(provider, config) {
    switch (provider) {
      case 'amoCRM':
        return new AmoCRMAdapter(config.amoCRM);
      case 'Bitrix24':
        return new Bitrix24Adapter(config.bitrix24);
      case 'HubSpot':
        return new HubSpotAdapter(config.hubspot);
      case 'Webhook':
        return new WebhookAdapter(config.webhook);
      case 'GoogleSheets':
        return new GoogleSheetsAdapter(config.googleSheets);
      case 'CustomAPI':
        return new CustomAPIAdapter(config.customApi);
      default:
        return null;
    }
  }

  /**
   * Process the order/lead: push to CRM and send Telegram notification
   * @param {Object} order - Order model document (populated with items)
   * @param {Object} settings - System settings document
   */
  static async processLead(order, settings) {
    const results = {
      crm: null,
      telegram: null
    };

    // 1. CRM Integration
    const activeProvider = settings.crm && settings.crm.activeProvider;
    if (activeProvider && activeProvider !== 'None') {
      try {
        const adapter = this.getAdapter(activeProvider, settings.crm);
        if (adapter) {
          console.log(`[AdapterManager] Dispatching lead to ${activeProvider}...`);
          results.crm = await adapter.sendLead(order);
        }
      } catch (err) {
        console.error(`[AdapterManager] CRM dispatch to ${activeProvider} failed:`, err.message);
        results.crm = { status: 'failed', error: err.message };
      }
    } else {
      results.crm = { status: 'skipped', message: 'No CRM provider selected' };
    }

    // 2. Telegram Integration
    if (settings.telegramNotification && settings.telegramNotification.enabled) {
      try {
        console.log('[AdapterManager] Dispatching Telegram notification...');
        results.telegram = await TelegramNotifier.sendNotification(order, settings.telegramNotification);
      } catch (err) {
        console.error('[AdapterManager] Telegram notification failed:', err.message);
        results.telegram = { status: 'failed', error: err.message };
      }
    }

    // 3. Save payloads back to the order for admin viewing
    order.crmPayloads = results;
    await order.save();

    return results;
  }
}

module.exports = AdapterManager;
