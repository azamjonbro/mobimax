const BaseAdapter = require('./BaseAdapter');

class GoogleSheetsAdapter extends BaseAdapter {
  async sendLead(order) {
    const { spreadsheetId, clientEmail, privateKey } = this.config;

    // Helper formatting
    const itemsText = order.items.map(i => `${i.product} (x${i.quantity})`).join(', ');
    const rowData = [
      order.leadId,
      new Date(order.createdAt || Date.now()).toLocaleString(),
      order.customer.name,
      order.customer.phone,
      order.customer.company || '',
      order.customer.telegram || '',
      order.customer.region,
      itemsText,
      order.total,
      order.customer.comment || ''
    ];

    if (!spreadsheetId || !clientEmail || !privateKey) {
      console.log(`[GoogleSheets Mock] Row appended for lead ${order.leadId}:`, rowData);
      return { status: 'mocked', message: 'Google Sheets credentials missing. Row logged to console.' };
    }

    try {
      // Lazy load googleapis library if credentials exist
      const { google } = require('googleapis');
      
      const auth = new google.auth.JWT(
        clientEmail,
        null,
        privateKey.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:J',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData]
        }
      });

      return { status: 'success', data: response.data };
    } catch (error) {
      console.error('[GoogleSheets Error]', error.message);
      throw new Error(`Google Sheets append failed: ${error.message}`);
    }
  }
}

module.exports = GoogleSheetsAdapter;
