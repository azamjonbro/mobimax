const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');

module.exports = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://mobimax.techinfo.uz',
        changeOrigin: true
      },
      '/uploads': {
        target: 'https://mobimax.techinfo.uz',
        changeOrigin: true
      }
    }
  }
});
