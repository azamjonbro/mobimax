<template>
  <div class="logs-admin-container">
    <div class="crud-header">
      <div>
        <h1>Xavfsizlik va Tizim faolligi jurnallari</h1>
        <p class="section-subtitle">Administrator harakatlari va tizim integratsiyalari auditi (faqat o'qish uchun)</p>
      </div>
      <button class="btn btn-secondary refresh-btn" @click="fetchLogs">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right: 6px; vertical-align: middle;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.27 15" />
        </svg>
        Yangilash
      </button>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sana va vaqt</th>
            <th>Operator</th>
            <th>Harakat kodi</th>
            <th>Batafsil ma'lumot</th>
            <th>IP manzil</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log._id">
            <td><code>{{ formatDateTime(log.createdAt) }}</code></td>
            <td>
              <strong v-if="log.admin">{{ log.admin.name }}</strong>
              <span v-else class="text-secondary">Tizim avtomatik</span><br>
              <span v-if="log.admin" class="sub-text">{{ log.admin.email }}</span>
            </td>
            <td>
              <span :class="['action-tag', getActionClass(log.action)]">
                {{ log.action }}
              </span>
            </td>
            <td>{{ log.details }}</td>
            <td><code>{{ log.ip || '127.0.0.1' }}</code></td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="no-records">Tizim faolligi jurnallari topilmadi.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LogsAdmin',
  data() {
    return {
      logs: []
    };
  },
  mounted() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        const res = await axios.get('/api/admin/logs');
        this.logs = res.data;
      } catch (err) {
        console.error('Failed querying activity logs:', err);
      }
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString();
    },
    getActionClass(action) {
      if (action.includes('DELETE')) return 'red';
      if (action.includes('CREATE')) return 'green';
      if (action.includes('UPDATE')) return 'blue';
      if (action.includes('LOGIN')) return 'purple';
      return '';
    }
  }
};
</script>

<style scoped>
.refresh-btn {
  padding: 8px 16px !important;
  font-size: 13px !important;
}

.table-card {
  padding: 0;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px;
  text-align: left;
}

.admin-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  vertical-align: middle;
}

.sub-text {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.action-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-text);
  display: inline-block;
}

.action-tag.red { background: rgba(240,0,0,0.1); color: var(--color-accent); }
.action-tag.green { background: rgba(52,199,89,0.1); color: #34c759; }
.action-tag.blue { background: rgba(7,27,134,0.1); color: var(--color-primary); }
.action-tag.purple { background: rgba(88,86,214,0.1); color: #5856d6; }

.no-records {
  text-align: center;
  padding: 40px !important;
  color: var(--color-text-secondary);
}
</style>
