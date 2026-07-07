<template>
  <div class="product-detail-page" v-if="product">
    <div class="product-layout">
      <!-- Media Gallery -->
      <div class="media-gallery">
        <div class="main-image-container" @mousemove="zoomImage" @mouseleave="resetZoom">
          <img 
            :src="activeImage ? activeImage : '/uploads/walkie_talkie_luxury.png'" 
            alt="MobiMax Mahsulot" 
            class="main-preview-img"
            :style="zoomStyle"
          />
        </div>
        <div class="thumbnail-row" v-if="product.images && product.images.length > 1">
          <div 
            v-for="(img, idx) in product.images" 
            :key="idx" 
            class="thumbnail-wrapper"
            :class="{ active: activeImage === img }"
            @click="activeImage = img"
          >
            <img :src="img" class="thumb-img" alt="" />
          </div>
        </div>
      </div>

      <!-- Purchase Sidebar -->
      <div class="purchase-sidebar">
        <div class="sticky-box card">
          <span class="product-brand">{{ product.brand?.name }}</span>
          <h1 class="product-title">{{ product.name }}</h1>
          <span class="sku-tag">SKU: {{ product.sku }}</span>
          
          <div class="pricing-row">
            <span class="price-val">${{ product.price.toFixed(2) }}</span>
            <span class="old-price" v-if="product.oldPrice > 0">${{ product.oldPrice.toFixed(2) }}</span>
          </div>

          <p class="stock-info" :class="{ 'out-of-stock': product.stock === 0 }">
            <span class="stock-badge" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg v-if="product.stock > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="color: #34c759;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="color: #ff3b30;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ product.stock > 0 ? `${product.stock} dona omborda bor` : 'Omborda yo\'q' }}
            </span>
          </p>

          <div class="action-block" v-if="product.stock > 0">
            <!-- Quantity selection -->
            <div class="qty-selector">
              <span class="selector-label">Miqdor:</span>
              <div class="cart-qty-control">
                <button class="qty-btn" @click="quantity = Math.max(1, quantity - 1)">-</button>
                <span class="qty-val">{{ quantity }}</span>
                <button class="qty-btn" @click="quantity = quantity + 1">+</button>
              </div>
            </div>

            <!-- Standard cart action -->
            <button class="btn btn-primary add-to-cart-btn" @click="addToCart">
              Savatga qo'shish
            </button>
          </div>

          <!-- CTA to open zero friction lead form directly for B2B procurement -->
          <button class="btn btn-accent quote-btn" @click="openLeadModal">
            B2B shartnoma / Hisob-faktura so'rash
          </button>

          <button class="btn btn-secondary wishlist-toggle-btn" @click="toggleWishlist">
            <span style="display: inline-flex; align-items: center; gap: 8px; justify-content: center; width: 100%;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" :fill="wishlistStore.isFavorite(product._id) ? '#ff3b30' : 'none'" :stroke="wishlistStore.isFavorite(product._id) ? '#ff3b30' : 'currentColor'" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: middle;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ wishlistStore.isFavorite(product._id) ? 'Tanlanganlarda' : 'Tanlanganlarga qo\'shish' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Details Tabs -->
    <div class="product-details-tabs">
      <div class="tab-headers">
        <button class="tab-hdr" :class="{ active: tab === 'desc' }" @click="tab = 'desc'">Tavsif</button>
        <button class="tab-hdr" :class="{ active: tab === 'specs' }" @click="tab = 'specs'">Xususiyatlari</button>
        <button class="tab-hdr" :class="{ active: tab === 'downloads' }" @click="tab = 'downloads'">Qo'llanmalar</button>
      </div>

      <div class="tab-body card">
        <!-- TinyMCE HTML output injection -->
        <div v-if="tab === 'desc'" class="html-content" v-html="product.description"></div>

        <div v-if="tab === 'specs'" class="specs-table">
          <div v-for="spec in product.specifications" :key="spec.key" class="specs-row">
            <span class="spec-key">{{ spec.key }}</span>
            <span class="spec-val">{{ spec.value }}</span>
          </div>
        </div>

        <div v-if="tab === 'downloads'" class="downloads-list">
          <div class="download-item">
            <span>📄 {{ product.name }} Texnik foydalanish qo'llanmasi (PDF)</span>
            <a href="#" @click.prevent="downloadPlaceholder" class="download-link">Yuklab olish</a>
          </div>
          <div class="download-item">
            <span>📄 Ratsiyani dasturlash chastotasi qo'llanmasi (PDF)</span>
            <a href="#" @click.prevent="downloadPlaceholder" class="download-link">Yuklab olish</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section class="related-section" v-if="relatedProducts.length > 0">
      <h2 class="section-title">O'xshash uskunalar</h2>
      <div class="related-grid">
        <div v-for="rp in relatedProducts" :key="rp._id" class="related-card card" @click="goToProduct(rp.slug)">
          <img :src="rp.mainImage ? rp.mainImage : '/uploads/walkie_talkie_luxury.png'" class="related-img" alt="" />
          <h4>{{ rp.name }}</h4>
          <span class="related-price">${{ rp.price.toFixed(2) }}</span>
        </div>
      </div>
    </section>

    <!-- Zero friction quote request dialog -->
    <div v-if="showLeadModal" class="drawer-backdrop" @click="closeLeadModal"></div>
    <div class="lead-modal card" v-if="showLeadModal">
      <div class="modal-header">
        <h3>Kotirovka so'rovini yuborish</h3>
        <button class="drawer-close" @click="closeLeadModal">&times;</button>
      </div>
      <p class="modal-intro">Ma'lumotlaringizni qoldiring va menejerimiz SKU <strong>{{ product.sku }}</strong> bo'lgan mahsulot bo'yicha shartnoma va to'lov tafsilotlari bilan Telegram yoki Telefon orqali sizga bog'lanadi.</p>
      
      <form @submit.prevent="submitDirectLead">
        <div class="form-group">
          <label class="form-label">To'liq ism-sharifingiz</label>
          <input type="text" v-model="leadForm.name" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Telefon raqamingiz</label>
          <input type="tel" v-model="leadForm.phone" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Kompaniya nomi</label>
          <input type="text" v-model="leadForm.company" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Viloyat / Shahar</label>
          <input type="text" v-model="leadForm.region" class="form-input" required />
        </div>
        <button type="submit" class="btn btn-accent submit-btn">So'rov yuborish</button>
      </form>
    </div>
    <!-- Mobile Sticky Bottom Bar -->
    <div class="mobile-sticky-bottom-bar">
      <button 
        class="sticky-fav-btn" 
        :class="{ active: wishlistStore.isFavorite(product._id) }" 
        @click="toggleWishlist"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" :fill="wishlistStore.isFavorite(product._id) ? '#ff3b30' : 'none'" :stroke="wishlistStore.isFavorite(product._id) ? '#ff3b30' : 'currentColor'" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <button class="sticky-cart-btn" @click="cartStore.toggleCart">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span class="badge" v-if="cartStore.totalItems > 0">{{ cartStore.totalItems }}</span>
      </button>

      <a :href="'tel:' + settingsStore.settings.phone" class="sticky-call-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </a>

      <a :href="settingsStore.settings.telegramLink" target="_blank" class="sticky-tg-btn">
        Telegram
      </a>

      <button class="btn btn-primary sticky-order-btn" @click="addToCart">
        Savatga
      </button>
    </div>
  </div>
  <div v-else class="loading-detail">
    <p>Ratsiya sozlamalari yuklanmoqda...</p>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import { useSettingsStore } from '../stores/settings';

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      activeImage: '',
      quantity: 1,
      tab: 'desc',
      relatedProducts: [],
      showLeadModal: false,
      zoomStyle: {
        transform: 'scale(1)',
        transformOrigin: 'center center'
      },
      leadForm: {
        name: '',
        phone: '',
        company: '',
        region: ''
      }
    };
  },
  computed: {
    cartStore() {
      return useCartStore();
    },
    wishlistStore() {
      return useWishlistStore();
    },
    settingsStore() {
      return useSettingsStore();
    }
  },
  watch: {
    '$route.params.slug': {
      handler(newSlug) {
        if (newSlug) {
          this.fetchProductDetails(newSlug);
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchProductDetails(slug) {
      try {
        const res = await axios.get(`/api/products/${slug}`);
        this.product = res.data;
        this.activeImage = this.product.mainImage || (this.product.images && this.product.images[0]) || '';
        
        // Fetch related products (same category)
        const relRes = await axios.get(`/api/products?category=${this.product.category?.slug}&limit=4`);
        this.relatedProducts = relRes.data.products.filter(p => p._id !== this.product._id);
      } catch (err) {
        console.error('Error fetching product specs:', err);
      }
    },
    addToCart() {
      this.cartStore.addToCart(this.product, this.quantity);
    },
    toggleWishlist() {
      this.wishlistStore.toggleFavorite(this.product._id);
    },
    zoomImage(e) {
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.pageX - left - window.scrollX) / width) * 100;
      const y = ((e.pageY - top - window.scrollY) / height) * 100;
      this.zoomStyle = {
        transform: 'scale(1.5)',
        transformOrigin: `${x}% ${y}%`
      };
    },
    resetZoom() {
      this.zoomStyle = {
        transform: 'scale(1)',
        transformOrigin: 'center center'
      };
    },
    openLeadModal() {
      this.showLeadModal = true;
    },
    closeLeadModal() {
      this.showLeadModal = false;
    },
    async submitDirectLead() {
      try {
        const payload = {
          customer: {
            name: this.leadForm.name,
            phone: this.leadForm.phone,
            company: this.leadForm.company,
            region: this.leadForm.region,
            comment: `Mahsulot sahifasidan to'g'ridan-to'g'ri kotirovka so'rovi: ${this.product.name} (SKU: ${this.product.sku})`
          },
          items: [
            {
              product: this.product._id,
              quantity: this.quantity,
              price: this.product.price
            }
          ]
        };

        const res = await axios.post('/api/order', payload);
        alert(`So'rovingiz muvaffaqiyatli yuborildi! So'rov ID: ${res.data.leadId}`);
        this.closeLeadModal();
      } catch (err) {
        alert('So\'rov yuborishda xatolik yuz berdi. Iltimos, tarmoq ulanishini tekshiring.');
      }
    },
    goToProduct(slug) {
      this.$router.push(`/products/${slug}`);
    },
    downloadPlaceholder() {
      alert('PDF qo\'llanmani yuklab olish yaqin soniyalarda boshlanadi.');
    },
    getSpecIconSvg(key) {
      const k = String(key || '').toLowerCase();
      if (k.includes('chastota') || k.includes('frequency') || k.includes('diapazon') || k.includes('band')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L9 21zm0 0h4.906M12 3v13m0-13L9 6m3-3l3 3m-3 7L9 11m3 2l3-2" /></svg>`;
      }
      if (k.includes('quvvat') || k.includes('power') || k.includes('watt') || k.includes('volt')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`;
      }
      if (k.includes('masofa') || k.includes('range') || k.includes('km') || k.includes('radius')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
      }
      if (k.includes('batareya') || k.includes('battery') || k.includes('mah') || k.includes('akkumulyator')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12H3m12-9H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>`;
      }
      if (k.includes('himoya') || k.includes('waterproof') || k.includes('ip') || k.includes('resistent')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`;
      }
      if (k.includes('og\'irlik') || k.includes('weight') || k.includes('gramm') || k.includes('gr')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>`;
    }
  }
};
</script>

<style scoped>
.product-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  margin-top: 40px;
}

@media (max-width: 992px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* Media gallery */
.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image-container {
  background: var(--color-bg);
  border-radius: var(--border-radius-card);
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
}

.main-preview-img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
}

.thumbnail-row {
  display: flex;
  gap: 16px;
}

.thumbnail-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail-wrapper.active {
  border-color: var(--color-primary);
}

.thumb-img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

/* Sidebar purchase */
.sticky-box {
  position: sticky;
  top: 100px;
}

.product-brand {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.product-title {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 8px;
}

.sku-tag {
  font-size: 12px;
  background: var(--color-bg);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--color-text-secondary);
  display: inline-block;
  margin-bottom: 24px;
}

.pricing-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.price-val {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-primary);
}

.old-price {
  font-size: 18px;
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.stock-info {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 32px;
}

.stock-info.out-of-stock {
  color: var(--color-accent);
}

.action-block {
  margin-bottom: 20px;
}

.qty-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.selector-label {
  font-size: 14px;
  font-weight: 600;
}

.cart-qty-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 16px;
  cursor: pointer;
}

.qty-val {
  padding: 0 16px;
  font-size: 14px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
}

.quote-btn {
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
}

.wishlist-toggle-btn {
  width: 100%;
  padding: 16px;
}

/* Tabs */
.product-details-tabs {
  margin-top: 60px;
}

.tab-headers {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.tab-headers::-webkit-scrollbar {
  display: none;
}

.tab-hdr {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 0;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: var(--transition-smooth);
}

.tab-hdr.active {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.html-content {
  line-height: 1.8;
  font-size: 15px;
  color: #2c2c2e;
}

.html-content p {
  margin-bottom: 16px;
}

.html-content strong {
  color: var(--color-primary);
  font-weight: 700;
}

.html-content h3, .html-content h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 24px;
  margin-bottom: 12px;
}

.html-content ul, .html-content ol {
  padding-left: 20px;
  margin-bottom: 16px;
}

.html-content li {
  margin-bottom: 8px;
}

.specs-table {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.specs-row {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: var(--transition-smooth);
}

.specs-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
  background: var(--color-white);
  border-color: rgba(7, 27, 134, 0.1);
}

.spec-key {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.spec-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.downloads-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg);
  border-radius: 8px;
}

.download-link {
  color: var(--color-primary);
  font-weight: 700;
}

/* Related section */
.related-section {
  margin-top: 60px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.related-card {
  text-align: center;
  cursor: pointer;
}

.related-img {
  max-width: 60%;
  max-height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
}

/* Lead Gen Modal dialog */
.lead-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 90%;
  z-index: 2002;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-intro {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  margin-top: 12px;
}

.loading-detail {
  text-align: center;
  padding: 100px 0;
  color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .product-layout {
    gap: 20px;
  }
  .main-image-container {
    height: 280px;
  }
  .product-title {
    font-size: 22px;
  }
  .price-val {
    font-size: 28px;
  }
  .action-block {
    margin-bottom: 12px;
  }
  .add-to-cart-btn, .quote-btn, .wishlist-toggle-btn {
    padding: 12px;
    font-size: 14px;
  }
  .tab-headers {
    gap: 16px;
  }
  .tab-hdr {
    font-size: 14px;
    padding: 8px 0;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .related-card {
    border-radius: 12px;
    padding: 12px;
  }
  .related-img {
    max-height: 80px;
  }
  .related-card h4 {
    font-size: 13px;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .related-price {
    font-size: 13px;
    font-weight: 700;
  }
}
</style>
