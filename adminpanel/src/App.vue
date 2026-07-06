<template>
  <div class="admin-app-container">
    <!-- Sidebar - Show only if logged in and not on login page -->
    <aside v-if="isLoggedIn" class="admin-sidebar">
      <div class="sidebar-brand">
        MobiMax <span>Admin</span>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="sidebar-link" exact-active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Boshqaruv paneli
        </router-link>
        <router-link to="/products" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Mahsulotlar
        </router-link>
        <router-link to="/categories" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Kategoriyalar
        </router-link>
        <router-link to="/brands" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Brendlar
        </router-link>
        <router-link to="/orders" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Buyurtmalar (Lidlar)
        </router-link>
        <router-link to="/banners" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Bannerlar
        </router-link>
        <router-link to="/settings" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Sozlamalar va CRM
        </router-link>
        <router-link to="/logs" class="sidebar-link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Tizim jurnallari
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="btn btn-secondary logout-btn" @click="logout">Chiqish</button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="admin-main-content" :class="{ 'no-sidebar': !isLoggedIn }">
      <router-view />
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return this.$route.path !== '/login';
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('mobimax_admin_token');
      delete axios.defaults.headers.common['Authorization'];
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.admin-app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.admin-sidebar {
  width: 260px;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
}

.sidebar-brand {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 40px;
  text-align: center;
}

.sidebar-brand span {
  color: var(--color-accent);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.sidebar-link {
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition-smooth);
}

.sidebar-link:hover {
  color: var(--color-white);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-link.active {
  color: var(--color-white);
  background: var(--color-accent);
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.logout-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-white);
}

.logout-btn:hover {
  background: var(--color-accent);
}

.admin-main-content {
  flex: 1;
  margin-left: 260px;
  padding: 40px;
  max-width: calc(100% - 260px);
}

.admin-main-content.no-sidebar {
  margin-left: 0;
  max-width: 100%;
  padding: 0;
}
</style>
