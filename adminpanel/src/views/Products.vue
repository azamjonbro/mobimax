<template>
  <div class="products-crud-container">
    <div class="crud-header">
      <div>
        <h1>Mahsulotlar katalogi (CRUD)</h1>
        <p class="section-subtitle">Katalog mahsulotlarini, ombor zaxiralarini va SEO parametrlarini boshqarish</p>
      </div>
      <router-link to="/products/create" class="btn btn-primary">
        + Yangi mahsulot
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <p>Kataloglar yangilanmoqda...</p>
    </div>

    <!-- CRUD Table -->
    <div v-else class="card table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Asosiy rasm</th>
            <th>SKU</th>
            <th>Mahsulot nomi</th>
            <th>Toifa</th>
            <th>Brend</th>
            <th>Narx</th>
            <th>Omborda</th>
            <th>Yorliqlar</th>
            <th>Holat</th>
            <th>Harakatlar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in products" :key="prod._id">
            <td>
              <img :src="prod.mainImage || '/uploads/walkie_talkie_luxury.png'" class="prod-thumbnail" alt="" />
            </td>
            <td><strong>{{ prod.sku }}</strong></td>
            <td>
              {{ prod.name }}
            </td>
            <td>{{ prod.category?.name || 'Mavjud emas' }}</td>
            <td>{{ prod.brand?.name || 'Mavjud emas' }}</td>
            <td>${{ prod.price?.toFixed(2) }}</td>
            <td>
              <span :class="['stock-indicator', prod.stock > 0 ? 'in' : 'out']">
                {{ prod.stock }} dona
              </span>
            </td>
            <td>
              <div class="badge-flags">
                <span v-if="prod.featured" class="flag feat">Tavsiya</span>
                <span v-if="prod.popular" class="flag pop">Ommabop</span>
                <span v-if="prod.new" class="flag new">Yangi</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge', prod.status]">
                {{ prod.status === 'active' ? 'Faol' : prod.status === 'draft' ? 'Qoralama' : prod.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn edit" @click="editProduct(prod._id)">Tahrirlash</button>
                <button class="action-btn delete" @click="deleteProduct(prod)">O'chirish</button>
              </div>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="10" class="no-records">Mahsulotlar topilmadi. Qo'shish uchun "+ Yangi mahsulot" tugmasini bosing.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProductsAdmin',
  data() {
    return {
      products: [],
      loading: true
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get('/api/admin/products');
        this.products = res.data;
      } catch (err) {
        console.error('Failed querying admin products:', err);
      } finally {
        this.loading = false;
      }
    },
    editProduct(id) {
      this.$router.push(`/products/edit/${id}`);
    },
    async deleteProduct(product) {
      if (!confirm(`Haqiqatan ham ${product.name} mahsulotini o'chirmoqchimisiz?`)) return;

      try {
        await axios.delete(`/api/admin/products/${product._id}`);
        this.products = this.products.filter(p => p._id !== product._id);
        alert('Mahsulot muvaffaqiyatli o\'chirildi.');
      } catch (err) {
        alert(err.response?.data?.message || 'Mahsulotni o\'chirib bo\'lmadi.');
      }
    }
  }
};
</script>

<style scoped>
.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

@media (max-width: 576px) {
  .crud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.loading-state {
  text-align: center;
  padding: 100px 0;
  color: var(--color-text-secondary);
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
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 18px 24px;
  text-align: left;
}

.admin-table td {
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text);
  vertical-align: middle;
}

.prod-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--color-bg);
}

.stock-indicator {
  font-weight: 600;
  font-size: 13px;
}

.stock-indicator.in {
  color: #34c759;
}

.stock-indicator.out {
  color: var(--color-accent);
}

.badge-flags {
  display: flex;
  gap: 4px;
}

.flag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--color-white);
}

.flag.feat { background-color: var(--color-primary); }
.flag.pop { background-color: var(--color-accent); }
.flag.new { background-color: #5856d6; }

.status-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-badge.active {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-badge.draft {
  background: rgba(142, 142, 147, 0.1);
  color: var(--color-text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  border: none;
  background: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.action-btn.edit {
  color: var(--color-primary);
}

.action-btn.delete {
  color: var(--color-accent);
}

.no-records {
  text-align: center;
  padding: 40px !important;
  color: var(--color-text-secondary);
}
</style>
