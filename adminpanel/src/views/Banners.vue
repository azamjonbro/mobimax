<template>
  <div class="banners-admin-container">
    <div class="crud-header">
      <div>
        <h1>Bosh sahifa bannerlari</h1>
        <p class="section-subtitle">Bosh sahifadagi slayd-bannerlarni va ularning tartib raqamlarini boshqarish</p>
      </div>
    </div>

    <div class="crud-split-layout">
      <!-- Form Card -->
      <div class="form-container card">
        <h3>{{ isEditMode ? 'Bannerni tahrirlash' : 'Banner yaratish' }}</h3>
        
        <form @submit.prevent="saveBanner">
          <div class="form-group">
            <label class="form-label">Banner sarlavhasi *</label>
            <input type="text" v-model="form.title" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Kichik sarlavha / Qisqa tavsif</label>
            <input type="text" v-model="form.subtitle" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">O'tish havolasi (masalan, /products?category=portable-radios)</label>
            <input type="text" v-model="form.link" class="form-input" />
          </div>

          <!-- Image Select -->
          <div class="form-group">
            <label class="form-label">Banner rasmi URL manzili / fayl *</label>
            <input type="text" v-model="form.image" class="form-input" required />
            <input type="file" ref="bannerFileInput" @change="uploadBannerImage" class="hidden-input" />
            <button type="button" class="btn btn-secondary upload-btn" @click="triggerUpload">Banner rasmini yuklash</button>
          </div>

          <div class="form-group">
            <label class="form-label">Tartib raqami indeksi</label>
            <input type="number" v-model="form.orderIndex" class="form-input" />
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="active" v-model="form.active" />
            <label for="active">Faol (ko'rinadigan)</label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary submit-btn">
              {{ isEditMode ? 'Slaydni yangilash' : 'Slayd yaratish' }}
            </button>
            <button v-if="isEditMode" type="button" class="btn btn-secondary cancel-btn" @click="resetForm">
              Bekor qilish
            </button>
          </div>
        </form>
      </div>

      <!-- Banners List -->
      <div class="table-container card">
        <h3>Mavjud bannerlar</h3>
        
        <table class="admin-table">
          <thead>
            <tr>
              <th>Rasm</th>
              <th>Tafsilotlar</th>
              <th>Tartib</th>
              <th>Holat</th>
              <th>Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="banner in banners" :key="banner._id">
              <td>
                <img :src="banner.image" class="banner-preview" alt="" />
              </td>
              <td>
                <strong>{{ banner.title }}</strong><br>
                <span class="sub-text">{{ banner.subtitle }}</span><br>
                <code class="sub-text">{{ banner.link }}</code>
              </td>
              <td>{{ banner.orderIndex }}</td>
              <td>
                <span :class="['status-pill', banner.active ? 'active' : 'inactive']">
                  {{ banner.active ? 'Faol' : 'Yashirin' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn edit" @click="editBanner(banner)">Tahrirlash</button>
                  <button class="action-btn delete" @click="deleteBanner(banner)">O'chirish</button>
                </div>
              </td>
            </tr>
            <tr v-if="banners.length === 0">
              <td colspan="5" class="no-records">Bannerlar yaratilmagan. Yangi banner qo'shing.</td>
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
  name: 'BannersAdmin',
  data() {
    return {
      banners: [],
      isEditMode: false,
      form: {
        _id: null,
        title: '',
        subtitle: '',
        link: '',
        image: '/uploads/banner_hero_1.webp',
        orderIndex: 0,
        active: true
      }
    };
  },
  mounted() {
    this.fetchBanners();
  },
  methods: {
    async fetchBanners() {
      try {
        const res = await axios.get('/api/admin/banners');
        this.banners = res.data;
      } catch (err) {
        console.error('Failed loading banners:', err);
      }
    },
    triggerUpload() {
      this.$refs.bannerFileInput.click();
    },
    async uploadBannerImage(e) {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post('/api/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.form.image = res.data.fileUrl;
        alert('Banner rasmi muvaffaqiyatli yuklandi.');
      } catch (err) {
        alert(err.response?.data?.message || 'Rasm yuklashda xatolik.');
      }
    },
    editBanner(banner) {
      this.isEditMode = true;
      this.form = { ...banner };
    },
    async saveBanner() {
      try {
        if (this.isEditMode) {
          await axios.put(`/api/admin/banners/${this.form._id}`, this.form);
          alert('Banner slaydi muvaffaqiyatli yangilandi.');
        } else {
          await axios.post('/api/admin/banners', this.form);
          alert('Banner slaydi muvaffaqiyatli yaratildi.');
        }
        this.resetForm();
        this.fetchBanners();
      } catch (err) {
        alert(err.response?.data?.message || 'Bannerni saqlashda xatolik.');
      }
    },
    async deleteBanner(banner) {
      if (!confirm(`Haqiqatan ham "${banner.title}" banner slaydini o'chirmoqchimisiz?`)) return;

      try {
        await axios.delete(`/api/admin/banners/${banner._id}`);
        alert('Banner slaydi o\'chirildi.');
        this.fetchBanners();
      } catch (err) {
        alert(err.response?.data?.message || 'Bannerni o\'chirishda xatolik.');
      }
    },
    resetForm() {
      this.isEditMode = false;
      this.form = {
        _id: null,
        title: '',
        subtitle: '',
        link: '',
        image: '/uploads/banner_hero_1.webp',
        orderIndex: 0,
        active: true
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

.hidden-input {
  display: none;
}

.upload-btn {
  width: 100%;
  margin-top: 8px;
  padding: 10px !important;
  font-size: 13px !important;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.checkbox-group label {
  font-size: 14px;
  font-weight: 600;
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

/* Banner specific table preview */
.banner-preview {
  width: 120px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--color-bg);
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
  padding: 14px 16px;
  text-align: left;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
}

.sub-text {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.status-pill {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.status-pill.active {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-pill.inactive {
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
  padding: 20px !important;
  color: var(--color-text-secondary);
}
</style>
