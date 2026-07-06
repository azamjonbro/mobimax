<template>
  <div class="orders-admin-container">
    <div class="crud-header">
      <div>
        <h1>CRM Lidlar voronkasi</h1>
        <p class="section-subtitle">Kelib tushgan reklama kontaktlarini qayta ishlash va CRM sinxronizatsiya holatini kuzatish</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="orders-split-layout">
      <!-- Leads Table -->
      <div class="card table-card">
        <h3>Kelgan so'rovlar (Lidlar)</h3>
        
        <table class="admin-table">
          <thead>
            <tr>
              <th>Lid ID</th>
              <th>Mijoz profili</th>
              <th>Hudud</th>
              <th>Taxminiy qiymat</th>
              <th>CRM Holati</th>
              <th>Sana</th>
              <th>Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="order in orders" 
              :key="order._id" 
              :class="{ selected: selectedOrder && selectedOrder._id === order._id }"
              @click="selectOrder(order)"
            >
              <td><strong>{{ order.leadId }}</strong></td>
              <td>
                <div class="client-name-cell">
                  <span>{{ order.customer?.name }}</span>
                  <span class="sub-text">{{ order.customer?.phone }}</span>
                </div>
              </td>
              <td>{{ order.customer?.region }}</td>
              <td>${{ order.total?.toFixed(2) }}</td>
              <td>
                <span :class="['status-pill', order.status]">
                  {{ order.status === 'new' ? 'Yangi' : order.status === 'contacted' ? 'Bog\'lanilgan' : order.status === 'negotiating' ? 'Muzokara' : order.status === 'completed' ? 'Yakunlangan' : order.status === 'cancelled' ? 'Bekor qilingan' : order.status }}
                </span>
              </td>
              <td>{{ formatDateTime(order.createdAt) }}</td>
              <td>
                <button class="action-btn delete-btn" @click.stop="deleteOrder(order)">&times;</button>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="7" class="no-records">Tizimda hali buyurtmalar/lidlar ro'yxatdan o'tmagan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Lead Inspector Detail Sidebar -->
      <div class="inspector-sidebar card">
        <h3 class="inspector-title">Lid inspektori</h3>
        
        <div v-if="!selectedOrder" class="empty-inspector">
          Lid ma'lumotlarini tekshirish, holatni o'zgartirish va CRM loglarini ko'rish uchun chapdagi ro'yxatdan birini tanlang.
        </div>
        
        <div v-else class="inspector-content">
          <div class="inspector-section">
            <h4>Mijoz profili</h4>
            <div class="meta-list">
              <div class="meta-row"><span>Ismi:</span> <strong>{{ selectedOrder.customer?.name }}</strong></div>
              <div class="meta-row"><span>Telefon:</span> <strong>{{ selectedOrder.customer?.phone }}</strong></div>
              <div class="meta-row"><span>Kompaniya:</span> <strong>{{ selectedOrder.customer?.company || 'Mavjud emas / Jismoniy shaxs' }}</strong></div>
              <div class="meta-row"><span>Telegram:</span> <strong>{{ selectedOrder.customer?.telegram || 'Ko\'rsatilmagan' }}</strong></div>
              <div class="meta-row"><span>Hudud:</span> <strong>{{ selectedOrder.customer?.region }}</strong></div>
              <div class="meta-row block-meta">
                <span>Izoh:</span>
                <p class="comment-block">{{ selectedOrder.customer?.comment || 'Izohlar yo\'q' }}</p>
              </div>
            </div>
          </div>

          <div class="inspector-section">
            <h4>Buyurtma qilingan mahsulotlar</h4>
            <div class="order-items-strip">
              <div v-for="(item, idx) in selectedOrder.items" :key="idx" class="order-item-spec">
                <span class="item-name">{{ item.product?.name || 'O\'chirilgan mahsulot' }}</span>
                <span class="item-qty-price">${{ item.price.toFixed(2) }} x {{ item.quantity }}</span>
              </div>
              <div class="inspector-total">
                <span>Jami:</span>
                <strong>${{ selectedOrder.total.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <!-- Status Modification -->
          <div class="inspector-section">
            <h4>CRM holatini o'zgartirish</h4>
            <div class="status-modifier-row">
              <select v-model="selectedOrder.status" @change="updateOrderStatus" class="form-input">
                <option value="new">Yangi lid</option>
                <option value="contacted">Bog'lanilgan</option>
                <option value="negotiating">Muzokara olib borilmoqda</option>
                <option value="completed">Yakunlangan (Muvaffaqiyatli yopilgan)</option>
                <option value="cancelled">Bekor qilingan (Muvaffaqiyatsiz yopilgan)</option>
              </select>
            </div>
          </div>

          <!-- CRM Payload Logs -->
          <div class="inspector-section">
            <h4>CRM sinxronizatsiya javobi</h4>
            <pre class="json-block">{{ JSON.stringify(selectedOrder.crmPayloads, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrdersAdmin',
  data() {
    return {
      orders: [],
      selectedOrder: null
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const res = await axios.get('/api/admin/orders');
        this.orders = res.data;
        // Auto select first if exists and none selected
        if (this.orders.length > 0 && !this.selectedOrder) {
          this.selectedOrder = this.orders[0];
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    },
    selectOrder(order) {
      this.selectedOrder = order;
    },
    async updateOrderStatus() {
      try {
        const res = await axios.put(`/api/admin/orders/${this.selectedOrder._id}`, {
          status: this.selectedOrder.status
        });
        
        // Update list record status
        const idx = this.orders.findIndex(o => o._id === this.selectedOrder._id);
        if (idx !== -1) {
          this.orders[idx].status = res.data.status;
        }
        alert('Lid holati muvaffaqiyatli yangilandi.');
      } catch (err) {
        alert(err.response?.data?.message || 'Holatni yangilab bo\'lmadi.');
      }
    },
    async deleteOrder(order) {
      if (!confirm(`Haqiqatan ham ${order.leadId} raqamli lid yozuvini o'chirmoqchimisiz?`)) return;

      try {
        await axios.delete(`/api/admin/orders/${order._id}`);
        this.orders = this.orders.filter(o => o._id !== order._id);
        if (this.selectedOrder && this.selectedOrder._id === order._id) {
          this.selectedOrder = this.orders[0] || null;
        }
        alert('Lid o\'chirildi.');
      } catch (err) {
        alert(err.response?.data?.message || 'Lidni o\'chirib bo\'lmadi.');
      }
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString();
    }
  }
};
</script>

<style scoped>
.orders-split-layout {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .orders-split-layout {
    grid-template-columns: 1fr;
  }
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

.admin-table tr {
  cursor: pointer;
  transition: var(--transition-smooth);
}

.admin-table tr:hover {
  background: var(--color-bg);
}

.admin-table tr.selected {
  background: rgba(7, 27, 134, 0.04);
}

.admin-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text);
  vertical-align: middle;
}

.client-name-cell {
  display: flex;
  flex-direction: column;
}

.client-name-cell span {
  font-weight: 700;
}

.client-name-cell .sub-text {
  font-weight: 500;
  font-size: 12px;
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

.status-pill.new { background: rgba(240, 0, 0, 0.1); color: var(--color-accent); }
.status-pill.contacted { background: rgba(7, 27, 134, 0.1); color: var(--color-primary); }
.status-pill.negotiating { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
.status-pill.completed { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-pill.cancelled { background: rgba(142, 142, 147, 0.1); color: var(--color-text-secondary); }

.action-btn.delete-btn {
  border: none;
  background: none;
  font-size: 22px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.action-btn.delete-btn:hover {
  color: var(--color-accent);
}

/* Inspector Sidebar */
.inspector-sidebar {
  align-self: start;
}

.inspector-title {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.empty-inspector {
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 40px 0;
  line-height: 1.6;
}

.inspector-section {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.inspector-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.inspector-section h4 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 14px;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.meta-row span {
  color: var(--color-text-secondary);
}

.block-meta {
  flex-direction: column;
  gap: 6px;
}

.comment-block {
  background: var(--color-bg);
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: pre-line;
}

.order-items-strip {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item-spec {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.item-qty-price {
  color: var(--color-primary);
  font-weight: 700;
}

.inspector-total {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-weight: 800;
  font-size: 15px;
}

.json-block {
  background: #2c2c2e;
  color: #30d158;
  padding: 14px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 11px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.no-records {
  text-align: center;
  padding: 40px !important;
  color: var(--color-text-secondary);
}
</style>
