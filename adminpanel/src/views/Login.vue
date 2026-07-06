<template>
  <div class="login-view-container">
    <div class="login-box card">
      <h2>MobiMax Tizimi</h2>
      <p class="login-subtitle">Tizimga kirish eshigi</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Elektron pochta manzili (Email)</label>
          <input 
            type="email" 
            v-model="email" 
            class="form-input" 
            placeholder="admin@mobimax.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Parol</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-input" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" class="btn btn-primary login-submit-btn" :disabled="loading">
          {{ loading ? 'Kirilmoqda...' : 'Kirish' }}
        </button>
      </form>

      <p v-if="error" class="login-error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      try {
        const res = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.password
        });
        
        // Save token to localStorage
        localStorage.setItem('mobimax_admin_token', res.data.token);
        
        // Attach token to axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Redirect to dashboard
        this.$router.push('/');
      } catch (err) {
        this.error = err.response && err.response.data && err.response.data.message 
          ? err.response.data.message 
          : 'Login yoki parol xato kiritildi';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-view-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.login-box {
  width: 400px;
  padding: 40px;
}

.login-box h2 {
  text-align: center;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.login-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  margin-bottom: 30px;
}

.login-submit-btn {
  width: 100%;
  padding: 16px;
  margin-top: 12px;
}

.login-error-msg {
  color: var(--color-accent);
  font-size: 13px;
  text-align: center;
  margin-top: 20px;
  font-weight: 600;
}
</style>
