import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Prepend baseURL to relative upload paths in responses
function prependUploadsUrl(data, baseUrl) {
  if (!data || !baseUrl) return data;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const process = (val) => {
    if (typeof val === 'string' && val.startsWith('/uploads/')) {
      return `${cleanBaseUrl}${val}`;
    }
    if (Array.isArray(val)) {
      return val.map(process);
    }
    if (val !== null && typeof val === 'object') {
      if (val instanceof File || val instanceof Blob || val instanceof FormData) {
        return val;
      }
      const newVal = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          newVal[key] = process(val[key]);
        }
      }
      return newVal;
    }
    return val;
  };
  return process(data);
}

// Strip baseURL from absolute upload paths in request payloads before sending to server
function stripUploadsUrl(data, baseUrl) {
  if (!data || !baseUrl) return data;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const process = (val) => {
    if (typeof val === 'string' && val.startsWith(`${cleanBaseUrl}/uploads/`)) {
      return val.slice(cleanBaseUrl.length);
    }
    if (Array.isArray(val)) {
      return val.map(process);
    }
    if (val !== null && typeof val === 'object') {
      if (val instanceof File || val instanceof Blob || val instanceof FormData) {
        return val;
      }
      const newVal = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          newVal[key] = process(val[key]);
        }
      }
      return newVal;
    }
    return val;
  };
  return process(data);
}

// Add Axios interceptors to transparently map upload paths
axios.interceptors.request.use((config) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (config.data && baseUrl) {
    config.data = stripUploadsUrl(config.data, baseUrl);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (response.data && baseUrl) {
    response.data = prependUploadsUrl(response.data, baseUrl);
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Fetch global settings to initialize pixels
import { useSettingsStore } from './stores/settings';

const settingsStore = useSettingsStore();
settingsStore.fetchSettings().then(() => {
  settingsStore.initializePixels();
});

// Global analytics route tracker
router.afterEach((to) => {
  // Track page visit
  axios.post('/api/visits', {
    path: to.fullPath,
    referrer: document.referrer,
    sessionId: getSessionId()
  }).catch(err => console.warn('Failed tracking pageview:', err.message));
});

// Helper for temporary anonymous session tracking
function getSessionId() {
  let sid = sessionStorage.getItem('mobimax_sid');
  if (!sid) {
    sid = 'sid_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('mobimax_sid', sid);
  }
  return sid;
}

app.mount('#app');
