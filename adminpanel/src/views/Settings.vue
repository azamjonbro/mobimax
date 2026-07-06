<template>
  <div class="settings-admin-container">
    <div class="crud-header">
      <div>
        <h1>Tizim sozlamalari va CRM boshqaruvi</h1>
        <p class="section-subtitle">Kontakt ma'lumotlari, ijtimoiy tarmoq havolalari, piksellar va faol B2B CRM tizimlarini sozlash</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Tizim konfiguratsiya profili yuklanmoqda...</p>
    </div>

    <form v-else @submit.prevent="saveSettings">
      <div class="form-layout-split">
        <!-- Main Panel Left -->
        <div class="form-main-left flex-column">
          <!-- Store Contact Channels -->
          <div class="card form-card">
            <h3>Do'kon ma'lumotlari va Kontaktlar</h3>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Ishonch telefoni</label>
                <input type="text" v-model="settings.phone" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Manzil (Joylashuv)</label>
                <input type="text" v-model="settings.address" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Ish vaqti</label>
                <input type="text" v-model="settings.workingHours" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Telegram kontakt havolasi</label>
                <input type="text" v-model="settings.telegramLink" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Instagram profil havolasi</label>
                <input type="text" v-model="settings.instagramLink" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Google xaritasi havolasi (Iframe URL)</label>
                <input type="text" v-model="settings.mapEmbedUrl" class="form-input" />
              </div>
            </div>
          </div>

          <!-- B2B CRM Adapters Routing Setup -->
          <div class="card form-card">
            <h3>CRM integratsiya adapteri</h3>
            
            <div class="form-group">
              <label class="form-label">Faol CRM provayderi</label>
              <select v-model="settings.crm.activeProvider" class="form-input active-crm-select">
                <option value="None">Hech qanday (faqat lokal ma'lumotlar bazasi)</option>
                <option value="amoCRM">amoCRM</option>
                <option value="Bitrix24">Bitrix24 Webhook</option>
                <option value="HubSpot">HubSpot API</option>
                <option value="Webhook">Generic Webhook Target</option>
                <option value="GoogleSheets">Google Sheets Appender</option>
                <option value="CustomAPI">Custom Remote API Endpoint</option>
              </select>
            </div>

            <!-- amoCRM Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'amoCRM'" class="crm-sub-panel bg-panel">
              <h4>amoCRM sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">amoCRM akkaunti subdomeni</label>
                <input type="text" v-model="settings.crm.amoCRM.domain" class="form-input" placeholder="masalan, mobimax" />
              </div>
              <div class="form-group">
                <label class="form-label">Integratsiya Client ID</label>
                <input type="text" v-model="settings.crm.amoCRM.clientId" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Integratsiya Client Secret</label>
                <input type="password" v-model="settings.crm.amoCRM.clientSecret" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Access Token</label>
                <input type="text" v-model="settings.crm.amoCRM.accessToken" class="form-input" />
              </div>
            </div>

            <!-- Bitrix24 Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'Bitrix24'" class="crm-sub-panel bg-panel">
              <h4>Bitrix24 sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">Kiruvchi Webhook URL manzili</label>
                <input type="text" v-model="settings.crm.bitrix24.webhookUrl" class="form-input" placeholder="https://domain.bitrix24.com/rest/1/key/crm.lead.add.json" />
              </div>
            </div>

            <!-- HubSpot Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'HubSpot'" class="crm-sub-panel bg-panel">
              <h4>HubSpot sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">Xususiy ilova Access Token (Private App Access Token)</label>
                <input type="password" v-model="settings.crm.hubspot.accessToken" class="form-input" />
              </div>
            </div>

            <!-- Webhook Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'Webhook'" class="crm-sub-panel bg-panel">
              <h4>Webhook qabul qiluvchi sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">Qabul qiluvchi URL manzili</label>
                <input type="text" v-model="settings.crm.webhook.url" class="form-input" placeholder="https://api.thirdparty.com/webhook" />
              </div>
              <div class="form-group">
                <label class="form-label">HMAC kaliti (Secret Key)</label>
                <input type="password" v-model="settings.crm.webhook.secret" class="form-input" />
              </div>
            </div>

            <!-- Google Sheets Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'GoogleSheets'" class="crm-sub-panel bg-panel">
              <h4>Google Sheets sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">Jadval ID (Spreadsheet ID)</label>
                <input type="text" v-model="settings.crm.googleSheets.spreadsheetId" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Google Service Client Email</label>
                <input type="text" v-model="settings.crm.googleSheets.clientEmail" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Google Service Account Private Key</label>
                <textarea v-model="settings.crm.googleSheets.privateKey" class="form-input" rows="3" placeholder="-----BEGIN PRIVATE KEY----- ..."></textarea>
              </div>
            </div>

            <!-- Custom API Sub-panel -->
            <div v-if="settings.crm.activeProvider === 'CustomAPI'" class="crm-sub-panel bg-panel">
              <h4>Maxsus API sozlamalari</h4>
              <div class="form-group">
                <label class="form-label">Maxsus API URL manzili</label>
                <input type="text" v-model="settings.crm.customApi.url" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Bearer API kaliti</label>
                <input type="password" v-model="settings.crm.customApi.apiKey" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Right -->
        <div class="form-main-right flex-column">
          <!-- Telegram notifications -->
          <div class="card form-card">
            <h3>Telegram orqali xabarnoma</h3>
            <div class="checkbox-group">
              <input type="checkbox" id="tg-enabled" v-model="settings.telegramNotification.enabled" />
              <label for="tg-enabled">Tezkor xabarnomalarni yoqish</label>
            </div>
            
            <div class="form-group">
              <label class="form-label">Telegram Bot API tokeni</label>
              <input type="text" v-model="settings.telegramNotification.botToken" class="form-input" placeholder="123456789:AA..."/>
            </div>

            <div class="form-group">
              <label class="form-label">Telegram Chat ID / Kanal ID</label>
              <input type="text" v-model="settings.telegramNotification.chatId" class="form-input" placeholder="-100..."/>
            </div>
          </div>

          <!-- SEO -->
          <div class="card form-card">
            <h3>Global SEO sozlamalari</h3>
            <div class="form-group">
              <label class="form-label">Standart sarlavha (Default Title)</label>
              <input type="text" v-model="settings.seo.title" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Standart tavsif (Default Description)</label>
              <textarea v-model="settings.seo.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Standart kalit so'zlar (Default Keywords)</label>
              <input type="text" v-model="settings.seo.keywords" class="form-input" />
            </div>
          </div>

          <!-- Tracking Pixels -->
          <div class="card form-card">
            <h3>Tahliliy kuzatuv piksellari</h3>
            <div class="form-group">
              <label class="form-label">Google Analytics (G-XXXXX)</label>
              <input type="text" v-model="settings.pixels.googleAnalyticsId" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Meta Pixel ID</label>
              <input type="text" v-model="settings.pixels.metaPixelId" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">TikTok Pixel ID</label>
              <input type="text" v-model="settings.pixels.tiktokPixelId" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Yandex Metrica ID</label>
              <input type="text" v-model="settings.pixels.yandexMetricaId" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Google Tag Manager (GTM-XXXX)</label>
              <input type="text" v-model="settings.pixels.googleTagManagerId" class="form-input" />
            </div>
          </div>

          <!-- Save Button -->
          <button type="submit" class="btn btn-primary save-btn">Sozlamalarni saqlash</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SettingsAdmin',
  data() {
    return {
      loading: true,
      settings: {
        phone: '',
        telegramLink: '',
        instagramLink: '',
        address: '',
        workingHours: '',
        mapEmbedUrl: '',
        seo: { title: '', description: '', keywords: '' },
        pixels: {
          googleAnalyticsId: '',
          metaPixelId: '',
          tiktokPixelId: '',
          yandexMetricaId: '',
          googleTagManagerId: ''
        },
        crm: {
          activeProvider: 'None',
          amoCRM: { domain: '', clientId: '', clientSecret: '', accessToken: '' },
          bitrix24: { webhookUrl: '' },
          hubspot: { accessToken: '' },
          webhook: { url: '', secret: '' },
          googleSheets: { spreadsheetId: '', clientEmail: '', privateKey: '' },
          customApi: { url: '', apiKey: '' }
        },
        telegramNotification: {
          enabled: false,
          botToken: '',
          chatId: ''
        }
      }
    };
  },
  mounted() {
    this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      this.loading = true;
      try {
        const res = await axios.get('/api/admin/settings');
        // Ensure sub-nodes exist to avoid bind exceptions
        this.settings = {
          ...res.data,
          seo: res.data.seo || { title: '', description: '', keywords: '' },
          pixels: res.data.pixels || { googleAnalyticsId: '', metaPixelId: '', tiktokPixelId: '', yandexMetricaId: '', googleTagManagerId: '' },
          crm: res.data.crm || {
            activeProvider: 'None',
            amoCRM: { domain: '', clientId: '', clientSecret: '', accessToken: '' },
            bitrix24: { webhookUrl: '' },
            hubspot: { accessToken: '' },
            webhook: { url: '', secret: '' },
            googleSheets: { spreadsheetId: '', clientEmail: '', privateKey: '' },
            customApi: { url: '', apiKey: '' }
          },
          telegramNotification: res.data.telegramNotification || { enabled: false, botToken: '', chatId: '' }
        };
      } catch (err) {
        console.error('Failed querying database configurations:', err);
      } finally {
        this.loading = false;
      }
    },
    async saveSettings() {
      try {
        await axios.put('/api/admin/settings', this.settings);
        alert('Tizim sozlamalari muvaffaqiyatli saqlandi.');
      } catch (err) {
        alert(err.response?.data?.message || 'Sozlamalarni saqlashda xatolik yuz berdi.');
      }
    }
  }
};
</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 100px 0;
  color: var(--color-text-secondary);
}

.form-layout-split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .form-layout-split {
    grid-template-columns: 1fr;
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card h3 {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 576px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.checkbox-group label {
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* CRM Adapters sub panels */
.active-crm-select {
  border-color: var(--color-primary);
  font-weight: 700;
}

.crm-sub-panel {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.crm-sub-panel h4 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.save-btn {
  width: 100%;
  padding: 16px;
  margin-top: 12px;
}
</style>
