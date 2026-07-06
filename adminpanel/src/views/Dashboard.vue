<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Boshqaruv markazi</h1>
        <p class="section-subtitle">Real vaqtdagi lidlar va tarmoq telemetriyasi</p>
      </div>
      <div class="time-stamp">
        {{ currentDateTime }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <p>Tahlil tizimi sinxronizatsiya qilinmoqda...</p>
    </div>

    <!-- Stats Grid -->
    <div v-else class="stats-grid">
      <div class="stat-card card">
        <span class="stat-label">Taxminiy so'rovlar qiymati</span>
        <h2 class="stat-value">${{ summary.totalRevenue?.toFixed(2) }}</h2>
        <span class="stat-change text-green">Barcha davrlar bo'yicha</span>
      </div>
      
      <div class="stat-card card">
        <span class="stat-label">Jami so'rovlar (Lidlar)</span>
        <h2 class="stat-value">{{ summary.totalLeads }}</h2>
        <span class="stat-change text-blue">bugun {{ summary.todayLeads }} ta qabul qilindi</span>
      </div>

      <div class="stat-card card">
        <span class="stat-label">Saytga tashriflar</span>
        <h2 class="stat-value">{{ summary.totalVisits }}</h2>
        <span class="stat-change text-blue">bugun {{ summary.todayVisits }} ta kirish</span>
      </div>

      <div class="stat-card card">
        <span class="stat-label">Konversiya darajasi</span>
        <h2 class="stat-value">{{ summary.conversionRate }}%</h2>
        <span class="stat-change">Tashriflarning lidlarga nisbati</span>
      </div>
    </div>

    <!-- Charts Area -->
    <div v-if="!loading" class="dashboard-charts card">
      <h3>Lidlar faolligi (Oxirgi 14 kun)</h3>
      <div class="svg-chart-container">
        <!-- Light clean SVG chart representation of visits / leads -->
        <svg viewBox="0 0 800 200" class="svg-chart">
          <!-- Draw background guide grids -->
          <line x1="40" y1="20" x2="780" y2="20" stroke="#E8E8ED" stroke-dasharray="4" />
          <line x1="40" y1="80" x2="780" y2="80" stroke="#E8E8ED" stroke-dasharray="4" />
          <line x1="40" y1="140" x2="780" y2="140" stroke="#E8E8ED" stroke-dasharray="4" />
          <line x1="40" y1="180" x2="780" y2="180" stroke="#1D1D1F" stroke-width="1.5" />

          <!-- Plot leads or visits bar graph dynamically -->
          <g v-for="(day, idx) in charts" :key="day._id">
            <!-- Calculate X coordinates -->
            <rect 
              :x="50 + idx * 50" 
              :y="Math.max(20, 180 - (day.visits * 2))" 
              width="24" 
              :height="Math.min(160, day.visits * 2)" 
              fill="#071B86" 
              rx="4"
              opacity="0.8"
            />
            <rect 
              :x="54 + idx * 50" 
              :y="Math.max(20, 180 - (day.leads * 20))" 
              width="16" 
              :height="Math.min(160, day.leads * 20)" 
              fill="#F00000" 
              rx="3"
            />
            <text :x="62 + idx * 50" y="195" font-size="9" text-anchor="middle" fill="#86868B">
              {{ formatDayLabel(day.date) }}
            </text>
          </g>
        </svg>
      </div>
      <div class="chart-legends">
        <span class="legend"><span class="legend-color bg-blue"></span> Saytga tashriflar</span>
        <span class="legend"><span class="legend-color bg-red"></span> Yaratilgan lidlar</span>
      </div>
    </div>

    <!-- Split view for lists -->
    <div v-if="!loading" class="dashboard-split-lists">
      <!-- Recent Leads -->
      <div class="list-section card">
        <div class="list-header">
          <h3>Oxirgi CRM lidlari</h3>
          <router-link to="/orders" class="btn btn-secondary list-btn">Barchasini ko'rish</router-link>
        </div>
        
        <table class="admin-table">
          <thead>
            <tr>
              <th>Lid ID</th>
              <th>Mijoz</th>
              <th>Hudud</th>
              <th>Jami</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentLeads" :key="order._id">
              <td><strong>{{ order.leadId }}</strong></td>
              <td>{{ order.customer?.name }} <br><span class="table-subtext">{{ order.customer?.phone }}</span></td>
              <td>{{ order.customer?.region }}</td>
              <td>${{ order.total?.toFixed(2) }}</td>
              <td>
                <span :class="['status-pill', order.status]">
                  {{ order.status === 'new' ? 'Yangi' : order.status === 'contacted' ? 'Bog\'lanilgan' : order.status === 'completed' ? 'Yakunlangan' : order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Popular Gear -->
      <div class="list-section card">
        <h3>Ommabop mahsulotlar</h3>
        <div class="popular-prods-list">
          <div v-for="prod in popularProducts" :key="prod._id" class="popular-prod-item">
            <img :src="prod.mainImage || '/uploads/walkie_talkie_luxury.png'" class="prod-thumb" alt="" />
            <div class="prod-info">
              <h4>{{ prod.name }}</h4>
              <span class="prod-price">${{ prod.price.toFixed(2) }}</span>
            </div>
            <span class="prod-stock" :class="{ 'out': prod.stock === 0 }">
              {{ prod.stock }} dona qoldi
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      summary: {},
      charts: [],
      recentLeads: [],
      popularProducts: [],
      currentDateTime: new Date().toLocaleString()
    };
  },
  mounted() {
    this.fetchDashboardData();
    setInterval(() => {
      this.currentDateTime = new Date().toLocaleString();
    }, 1000);
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const res = await axios.get('/api/admin/dashboard');
        this.summary = res.data.summary;
        this.charts = res.data.charts;
        this.recentLeads = res.data.recentLeads;
        this.popularProducts = res.data.popularProducts;
      } catch (err) {
        console.error('Failed loading control dashboard:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDayLabel(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length < 3) return dateStr;
      return `${parts[1]}/${parts[2]}`; // MM/DD
    }
  }
};
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.time-stamp {
  font-size: 14px;
  background: var(--color-white);
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.loading-state {
  text-align: center;
  padding: 100px 0;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.stat-change {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.text-green {
  color: #34c759 !important;
}

.text-blue {
  color: var(--color-primary) !important;
}

/* Charts */
.dashboard-charts {
  margin-bottom: 40px;
}

.svg-chart-container {
  margin-top: 20px;
  width: 100%;
  overflow-x: auto;
}

.svg-chart {
  width: 100%;
  min-width: 600px;
  height: 200px;
}

.chart-legends {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 13px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

.bg-blue {
  background-color: var(--color-primary);
}

.bg-red {
  background-color: var(--color-accent);
}

/* Lists */
.dashboard-split-lists {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .dashboard-split-lists {
    grid-template-columns: 1fr;
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-btn {
  padding: 8px 16px !important;
  font-size: 12px !important;
}

/* Table */
.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 12px 8px;
}

.admin-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.table-subtext {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.status-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-pill.new {
  background: rgba(240, 0, 0, 0.1);
  color: var(--color-accent);
}

.status-pill.completed {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-pill.contacted {
  background: rgba(7, 27, 134, 0.1);
  color: var(--color-primary);
}

/* Popular list */
.popular-prods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.popular-prod-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.prod-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--color-bg);
}

.prod-info {
  flex: 1;
}

.prod-info h4 {
  font-size: 13px;
  font-weight: 700;
}

.prod-price {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
}

.prod-stock {
  font-size: 11px;
  font-weight: 700;
  background: var(--color-bg);
  padding: 4px 8px;
  border-radius: 6px;
}

.prod-stock.out {
  background: rgba(240, 0, 0, 0.1);
  color: var(--color-accent);
}
</style>
