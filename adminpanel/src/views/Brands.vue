<template>
  <div class="brands-crud-container">
    <div class="crud-header">
      <div>
        <h1>Brendlar boshqaruvi</h1>
        <p class="section-subtitle">Ishlab chiqaruvchilar va brend nomlarini boshqarish</p>
      </div>
    </div>

    <div class="crud-split-layout">
      <!-- Create / Edit Form -->
      <div class="form-container card">
        <h3>{{ isEditMode ? 'Brendni tahrirlash' : 'Brend yaratish' }}</h3>
        
        <form @submit.prevent="saveBrand">
          <div class="form-group">
            <label class="form-label">Brend nomi *</label>
            <input type="text" v-model="form.name" @input="generateSlug" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">URL Slug *</label>
            <input type="text" v-model="form.slug" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Tavsif</label>
            <textarea v-model="form.description" class="form-input" rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary submit-btn">
              {{ isEditMode ? 'Brendni yangilash' : 'Brend yaratish' }}
            </button>
            <button v-if="isEditMode" type="button" class="btn btn-secondary cancel-btn" @click="resetForm">
              Bekor qilish
            </button>
          </div>
        </form>
      </div>

      <!-- Brands List Table -->
      <div class="table-container card">
        <h3>Faol brendlar</h3>
        
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nomi</th>
              <th>Slug</th>
              <th>Tavsif</th>
              <th>Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in brands" :key="brand._id">
              <td><strong>{{ brand.name }}</strong></td>
              <td><code>{{ brand.slug }}</code></td>
              <td>{{ brand.description || 'Tavsif mavjud emas' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn edit" @click="editBrand(brand)">Tahrirlash</button>
                  <button class="action-btn delete" @click="deleteBrand(brand)">O'chirish</button>
                </div>
              </td>
            </tr>
            <tr v-if="brands.length === 0">
              <td colspan="4" class="no-records">Brendlar topilmadi. Brend yarating.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BrandsAdmin',
  data() {
    return {
      brands: [],
      isEditMode: false,
      form: {
        _id: null,
        name: '',
        slug: '',
        description: ''
      }
    };
  },
  mounted() {
    this.fetchBrands();
  },
  methods: {
    async fetchBrands() {
      try {
        const res = await axios.get('/api/admin/brands');
        this.brands = res.data;
      } catch (err) {
        console.error('Failed loading brands list:', err);
      }
    },
    generateSlug() {
      if (this.isEditMode) return;
      this.form.slug = this.form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    },
    editBrand(brand) {
      this.isEditMode = true;
      this.form = { ...brand };
    },
    async saveBrand() {
      try {
        if (this.isEditMode) {
          await axios.put(`/api/admin/brands/${this.form._id}`, this.form);
          alert('Brend muvaffaqiyatli yangilandi.');
        } else {
          await axios.post('/api/admin/brands', this.form);
          alert('Brend muvaffaqiyatli yaratildi.');
        }
        this.resetForm();
        this.fetchBrands();
      } catch (err) {
        alert(err.response?.data?.message || 'Brend sozlamalarini saqlab bo\'lmadi.');
      }
    },
    async deleteBrand(brand) {
      if (!confirm(`Haqiqatan ham "${brand.name}" brendini o'chirmoqchimisiz?`)) return;

      try {
        await axios.delete(`/api/admin/brands/${brand._id}`);
        alert('Brend muvaffaqiyatli o\'chirildi.');
        this.fetchBrands();
      } catch (err) {
        alert(err.response?.data?.message || 'Brendni o\'chirib bo\'lmadi (ehtimol, bunga tegishli faol mahsulotlar mavjud).');
      }
    },
    resetForm() {
      this.isEditMode = false;
      this.form = {
        _id: null,
        name: '',
        slug: '',
        description: ''
      };
    }
  }
};
</script>

<style scoped>
.crud-split-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .crud-split-layout {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.submit-btn {
  flex: 1;
}

.cancel-btn {
  padding: 14px 20px !important;
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
  padding: 14px 16px;
  text-align: left;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
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
  padding: 20px !important;
  color: var(--color-text-secondary);
}
</style>
