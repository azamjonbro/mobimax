import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '../../front/src/assets/styles.css'; // Share the same beautiful Apple styles
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

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
