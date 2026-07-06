import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

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
