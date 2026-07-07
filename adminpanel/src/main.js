import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '../../front/src/assets/styles.css'; // Share the same beautiful Apple styles
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

// If JWT token exists, append to Authorization header automatically
const token = localStorage.getItem('mobimax_admin_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
