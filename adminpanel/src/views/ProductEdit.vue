<template>
  <div class="product-edit-container">
    <div class="edit-header">
      <h1>{{ isEditMode ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot yaratish' }}</h1>
      <p class="section-subtitle">SKU konfiguratsiyasi va uskunaning texnik xususiyatlari varaqasi</p>
    </div>

    <form @submit.prevent="saveProduct" class="edit-form">
      <div class="form-layout-split">
        <!-- Main Form Left -->
        <div class="form-main-left flex-column">
          <!-- Basic details -->
          <div class="card form-card">
            <h3>Asosiy ma'lumotlar</h3>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Mahsulot nomi *</label>
                <input type="text" v-model="product.name" @input="generateSlug" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">URL doimiy manzili (Slug) *</label>
                <input type="text" v-model="product.slug" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">SKU *</label>
                <input type="text" v-model="product.sku" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Narxi ($) *</label>
                <input type="number" step="0.01" v-model="product.price" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Eski narxi ($) (Ixtiyoriy)</label>
                <input type="number" step="0.01" v-model="product.oldPrice" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Ombordagi soni *</label>
                <input type="number" v-model="product.stock" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Toifa *</label>
                <select v-model="product.category" class="form-input" required>
                  <option value="">Toifani tanlang</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Brend *</label>
                <select v-model="product.brand" class="form-input" required>
                  <option value="">Brendni tanlang</option>
                  <option v-for="brand in brands" :key="brand._id" :value="brand._id">{{ brand.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Description (TinyMCE) -->
          <div class="card form-card">
            <h3>Mahsulot tavsifi</h3>
            <!-- Fallback text area if tinymce is blocked / fails to load -->
            <div class="editor-wrapper">
              <editor
                v-if="tinyMceLoaded"
                v-model="product.description"
                api-key="no-api-key"
                :init="{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
                }"
              />
              <textarea v-else v-model="product.description" rows="10" class="form-input text-rich-fallback" placeholder="HTML formatidagi tavsif ma'lumotlarini kiriting..."></textarea>
            </div>
          </div>

          <!-- Specifications Row editor -->
          <div class="card form-card">
            <div class="card-header-actions">
              <h3>Texnik xususiyatlari</h3>
              <button type="button" class="btn btn-secondary add-spec-row-btn" @click="addSpecRow">+ Qator qo'shish</button>
            </div>
            <div class="specs-grid-editor">
              <div v-for="(spec, idx) in product.specifications" :key="idx" class="spec-row-inputs">
                <input type="text" v-model="spec.key" class="form-input spec-key-input" placeholder="Xususiyat nomi (masalan, Masofa)" required />
                <input type="text" v-model="spec.value" class="form-input spec-val-input" placeholder="Qiymati (masalan, 15 km)" required />
                <button type="button" class="remove-spec-row" @click="removeSpecRow(idx)">&times;</button>
              </div>
              <div v-if="product.specifications.length === 0" class="empty-specs">
                Texnik xususiyatlar belgilanmagan. Masofa, chastota va vazn sozlamalarini kiritish uchun "+ Qator qo'shish" tugmasini bosing.
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Right -->
        <div class="form-main-right flex-column">
          <!-- Image Upload Drag Drop -->
          <div class="card form-card">
            <h3>Mahsulot rasmlari</h3>
            <!-- Drag and drop zone -->
            <div 
              class="drag-drop-zone"
              :class="{ dragging: isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input type="file" ref="fileInput" class="hidden-file-input" accept="image/*" multiple @change="handleFileSelect" />
              <div class="drag-drop-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color: var(--color-text-secondary); margin-bottom: 8px; display: inline-block;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p>Rasmlarni bu yerga sudrab olib keling yoki yuklash uchun bosing</p>
                <span class="file-limits">PNG, JPEG, WebP formatlari qo'llab-quvvatlanadi (Maks. 5MB)</span>
              </div>
            </div>

            <!-- Upload progress / thumbnails reorder -->
            <div class="uploaded-thumbnails-grid" v-if="product.images.length > 0">
              <div v-for="(img, idx) in product.images" :key="idx" class="uploaded-thumb">
                <img :src="img" class="thumb-preview" alt="" />
                <div class="thumb-actions">
                  <button type="button" class="thumb-btn main" :class="{ active: product.mainImage === img }" @click="product.mainImage = img">Asosiy</button>
                  <button type="button" class="thumb-btn remove" @click="removeImage(idx)">O'chirish</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Attributes and status -->
          <div class="card form-card">
            <h3>Nashr qilish va Yorliqlar</h3>
            <div class="form-group">
              <label class="form-label">Katalogdagi holati</label>
              <select v-model="product.status" class="form-input">
                <option value="active">Do'konda ko'rinadigan (Faol)</option>
                <option value="draft">Qoralama (Yashirin)</option>
              </select>
            </div>

            <div class="checkbox-group">
              <input type="checkbox" id="featured" v-model="product.featured" />
              <label for="featured">Tavsiya etilgan mahsulot</label>
            </div>
            
            <div class="checkbox-group">
              <input type="checkbox" id="popular" v-model="product.popular" />
              <label for="popular">Ommabop mahsulot</label>
            </div>

            <div class="checkbox-group">
              <input type="checkbox" id="new" v-model="product.new" />
              <label for="new">Yangi mahsulot yorlig'i</label>
            </div>
          </div>

          <!-- SEO -->
          <div class="card form-card">
            <h3>SEO parametrlari</h3>
            <div class="form-group">
              <label class="form-label">Sarlavha (Meta Title)</label>
              <input type="text" v-model="product.seo.title" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Tavsif (Meta Description)</label>
              <textarea v-model="product.seo.description" class="form-input" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Kalit so'zlar (Meta Keywords)</label>
              <input type="text" v-model="product.seo.keywords" class="form-input" placeholder="vergul bilan ajratilgan teglar..." />
            </div>
          </div>

          <!-- Action buttons -->
          <div class="actions-wrapper">
            <button type="submit" class="btn btn-primary save-btn">Mahsulot sozlamalarini saqlash</button>
            <button type="button" class="btn btn-secondary cancel-btn" @click="cancel">Bekor qilish</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import Editor from '@tinymce/tinymce-vue';

export default {
  name: 'ProductEdit',
  components: {
    editor: Editor
  },
  data() {
    return {
      isEditMode: false,
      categories: [],
      brands: [],
      tinyMceLoaded: false,
      isDragging: false,
      product: {
        name: '',
        slug: '',
        sku: '',
        description: '',
        price: 0,
        oldPrice: 0,
        stock: 10,
        category: '',
        brand: '',
        images: [],
        mainImage: '',
        specifications: [],
        featured: false,
        popular: false,
        new: false,
        status: 'active',
        seo: {
          title: '',
          description: '',
          keywords: ''
        }
      }
    };
  },
  mounted() {
    this.checkTinyMce();
    this.fetchFormOptions();
    const id = this.$route.params.id;
    if (id) {
      this.isEditMode = true;
      this.fetchProduct(id);
    }
  },
  methods: {
    checkTinyMce() {
      // Check if tinyMce CDN loaded on document head
      if (window.tinymce) {
        this.tinyMceLoaded = true;
      }
    },
    async fetchFormOptions() {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/admin/categories'),
          axios.get('/api/admin/brands')
        ]);
        this.categories = catRes.data;
        this.brands = brandRes.data;
      } catch (err) {
        console.error('Failed loading selector elements:', err);
      }
    },
    async fetchProduct(id) {
      try {
        const res = await axios.get('/api/admin/products');
        const prod = res.data.find(p => p._id === id);
        if (prod) {
          // Normalize specs and category / brand references back to objectids
          this.product = {
            ...prod,
            category: prod.category?._id || prod.category,
            brand: prod.brand?._id || prod.brand,
            seo: prod.seo || { title: '', description: '', keywords: '' }
          };
        }
      } catch (err) {
        console.error('Failed fetching product details:', err);
      }
    },
    generateSlug() {
      if (this.isEditMode) return;
      this.product.slug = this.product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    },
    addSpecRow() {
      this.product.specifications.push({ key: '', value: '' });
    },
    removeSpecRow(idx) {
      this.product.specifications.splice(idx, 1);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(e) {
      const files = e.target.files;
      if (files.length > 0) {
        this.uploadFiles(files);
      }
    },
    handleFileDrop(e) {
      this.isDragging = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.uploadFiles(files);
      }
    },
    async uploadFiles(files) {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await axios.post('/api/admin/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          this.product.images.push(res.data.fileUrl);
          
          // Set as main image if none exists
          if (!this.product.mainImage) {
            this.product.mainImage = res.data.fileUrl;
          }
        } catch (err) {
          alert(`${file.name} faylini yuklab bo'lmadi: ${err.response?.data?.message || err.message}`);
        }
      }
    },
    removeImage(idx) {
      const img = this.product.images[idx];
      this.product.images.splice(idx, 1);
      if (this.product.mainImage === img) {
        this.product.mainImage = this.product.images[0] || '';
      }
    },
    async saveProduct() {
      try {
        if (this.isEditMode) {
          await axios.put(`/api/admin/products/${this.product._id}`, this.product);
          alert('Mahsulot ma\'lumotlari muvaffaqiyatli yangilandi.');
        } else {
          await axios.post('/api/admin/products', this.product);
          alert('Mahsulot muvaffaqiyatli yaratildi.');
        }
        this.$router.push('/products');
      } catch (err) {
        alert(err.response?.data?.message || 'Mahsulot sozlamalarini saqlab bo\'lmadi.');
      }
    },
    cancel() {
      this.$router.push('/products');
    }
  }
};
</script>

<style scoped>
.edit-header {
  margin-bottom: 32px;
}

.form-layout-split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .form-layout-split {
    grid-template-columns: 1fr;
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card h3 {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 576px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}

.editor-wrapper {
  margin-top: 12px;
}

.text-rich-fallback {
  font-family: monospace;
}

/* Specs */
.card-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.card-header-actions h3 {
  border: none;
  padding: 0;
  margin: 0;
}

.add-spec-row-btn {
  padding: 8px 16px !important;
  font-size: 12px !important;
}

.spec-row-inputs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.spec-key-input {
  width: 40%;
}

.spec-val-input {
  width: 50%;
}

.remove-spec-row {
  font-size: 24px;
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
}

.empty-specs {
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}

/* Drag drop upload */
.drag-drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: var(--color-bg);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.drag-drop-zone:hover, .drag-drop-zone.dragging {
  border-color: var(--color-primary);
  background: var(--color-white);
}

.drag-drop-prompt span {
  font-size: 40px;
}

.drag-drop-prompt p {
  font-size: 14px;
  font-weight: 600;
  margin-top: 12px;
}

.file-limits {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.hidden-file-input {
  display: none;
}

.uploaded-thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.uploaded-thumb {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg);
}

.thumb-preview {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.thumb-actions {
  display: flex;
  justify-content: space-between;
  background: rgba(0,0,0,0.7);
  padding: 4px;
}

.thumb-btn {
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 10px;
  cursor: pointer;
}

.thumb-btn.main.active {
  color: #ffcc00;
  font-weight: 700;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.checkbox-group label {
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.actions-wrapper {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.save-btn {
  flex: 1.5;
  padding: 16px;
}

.cancel-btn {
  flex: 1;
  padding: 16px;
}
</style>
