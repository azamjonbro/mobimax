<template>
  <div class="products-page">
    <div class="page-header-row">
      <div>
        <h1 class="section-title">Mahsulotlar katalogi</h1>
        <p class="section-subtitle">Professional darajadagi uskunalar</p>
      </div>
      <!-- Search Input -->
      <div class="search-bar-wrapper">
        <input 
          type="text" 
          v-model="filters.search" 
          @input="debounceSearch" 
          class="form-input search-input" 
          placeholder="Mahsulotlar, SKU yoki chastotalarni qidirish..." 
        />
      </div>
    </div>

    <div class="catalog-layout">
      <!-- Sidebar Filters -->
      <aside class="sidebar-filters card" :class="{ 'show-mobile': showFiltersMobile }">
        <div class="filter-header">
          <h3>Filtrlar</h3>
          <button class="clear-filters-btn" @click="resetFilters">Tozalash</button>
        </div>

        <!-- Category selector -->
        <div class="filter-group">
          <label class="form-label">Toifa</label>
          <select v-model="filters.category" @change="applyFilters" class="form-input">
            <option value="">Barcha toifalar</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat.slug">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Brand selector -->
        <div class="filter-group">
          <label class="form-label">Brend</label>
          <select v-model="filters.brand" @change="applyFilters" class="form-input">
            <option value="">Barcha brendlar</option>
            <option v-for="brand in brands" :key="brand._id" :value="brand.slug">{{ brand.name }}</option>
          </select>
        </div>

        <!-- Price limits -->
        <div class="filter-group">
          <label class="form-label">Narx oralig'i</label>
          <div class="price-inputs">
            <input type="number" v-model="filters.minPrice" @change="applyFilters" class="form-input price-limit" placeholder="Min" />
            <span>-</span>
            <input type="number" v-model="filters.maxPrice" @change="applyFilters" class="form-input price-limit" placeholder="Max" />
          </div>
        </div>

        <!-- Spec Filters: Frequency -->
        <div class="filter-group">
          <label class="form-label">Chastota diapazoni</label>
          <select v-model="filters.frequency" @change="applyFilters" class="form-input">
            <option value="">Istalgan chastota</option>
            <option value="UHF">Faqat UHF</option>
            <option value="VHF">Faqat VHF</option>
            <option value="Dual Band">Dual Band</option>
          </select>
        </div>

        <!-- Spec Filters: Power -->
        <div class="filter-group">
          <label class="form-label">Quvvat darajasi</label>
          <select v-model="filters.power" @change="applyFilters" class="form-input">
            <option value="">Istalgan quvvat</option>
            <option value="5 Watts">5 Watt</option>
            <option value="8 Watts">8 Watt</option>
            <option value="10 Watts">10 Watt</option>
            <option value="50 Watts">50 Watt</option>
          </select>
        </div>

        <!-- Stock availability -->
        <div class="filter-group checkbox-group">
          <input type="checkbox" id="stock" v-model="filters.inStock" @change="applyFilters" />
          <label for="stock">Faqat omborda borlari</label>
        </div>
      </aside>

      <!-- Grid Content -->
      <section class="products-grid-section">
        <!-- Grid Controls -->
        <div class="grid-controls">
          <span class="results-count">{{ totalResults }} mahsulot topildi</span>
          
          <div class="control-actions">
            <!-- Sort dropdown -->
            <select v-model="filters.sort" @change="applyFilters" class="form-input sort-select">
              <option value="">Yangi kelganlar</option>
              <option value="price_asc">Narx: arzonidan qimmatiga</option>
              <option value="price_desc">Narx: qimmatidan arzoniga</option>
              <option value="popular">Ommabopligi</option>
            </select>

            <!-- Layout toggle -->
            <div class="layout-toggles">
              <button class="toggle-btn" :class="{ active: layout === 'grid' }" @click="layout = 'grid'">
                Setka
              </button>
              <button class="toggle-btn" :class="{ active: layout === 'list' }" @click="layout = 'list'">
                Ro'yxat
              </button>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading" class="loading-box">
          <p>Chastotalar skanerlanmoqda...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="empty-results card">
          <h3>Filtrlarga mos keladigan mahsulot topilmadi.</h3>
          <p>Qidiruv so'zlarini o'zgartirib yoki filtrlarni tozalab ko'ring.</p>
          <button class="btn btn-primary" @click="resetFilters">Filtrlarni tozalash</button>
        </div>

        <!-- Products Container -->
        <div v-else :class="['products-container', layout]">
          <div v-for="prod in products" :key="prod._id" class="product-card card">
            <div class="card-image-wrapper" @click="viewProduct(prod.slug)">
              <img :src="prod.mainImage ? prod.mainImage : '/uploads/walkie_talkie_luxury.png'" alt="" class="product-img" />
              <span class="discount-badge" v-if="prod.discount > 0">-{{ prod.discount }}%</span>
              <span class="stock-badge" v-if="prod.stock === 0">Omborda yo'q</span>
            </div>

            <div class="card-details">
              <div class="card-brand-sku">
                <span class="product-brand">{{ prod.brand?.name }}</span>
                <span class="product-sku">SKU: {{ prod.sku }}</span>
              </div>
              <h3 class="product-name" @click="viewProduct(prod.slug)">{{ prod.name }}</h3>
              <p class="product-desc-snippet" v-html="stripHtml(prod.description)"></p>

              <!-- Specs strip -->
              <div class="product-specs-strip">
                <span v-for="spec in prod.specifications.slice(0, 3)" :key="spec.key" class="spec-tag">
                  <span class="spec-dot"></span>
                  {{ spec.value }}
                </span>
              </div>

              <div class="card-footer-row">
                <div class="price-box">
                  <span class="current-price">${{ prod.price.toFixed(2) }}</span>
                  <span class="old-price" v-if="prod.oldPrice > 0">${{ prod.oldPrice.toFixed(2) }}</span>
                </div>
                <div class="action-btns">
                  <button 
                    class="fav-btn" 
                    :class="{ active: wishlistStore.isFavorite(prod._id) }" 
                    @click="wishlistStore.toggleFavorite(prod._id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    class="btn btn-primary quick-add-btn" 
                    :disabled="prod.stock === 0" 
                    @click="cartStore.addToCart(prod, 1)"
                  >
                    Savatga
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper" v-if="pagination.totalPages > 1">
          <button class="pag-btn" :disabled="filters.page === 1" @click="changePage(filters.page - 1)">Oldingi</button>
          <span class="pag-info">Sahifa: {{ filters.page }} / {{ pagination.totalPages }}</span>
          <button class="pag-btn" :disabled="filters.page === pagination.totalPages" @click="changePage(filters.page + 1)">Keyingi</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';

export default {
  name: 'Products',
  data() {
    return {
      products: [],
      categories: [],
      brands: [],
      loading: false,
      layout: 'grid', // grid or list
      showFiltersMobile: false,
      totalResults: 0,
      pagination: {
        totalPages: 1
      },
      searchTimeout: null,
      filters: {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        frequency: '',
        power: '',
        inStock: false,
        sort: '',
        page: 1
      }
    };
  },
  computed: {
    cartStore() {
      return useCartStore();
    },
    wishlistStore() {
      return useWishlistStore();
    }
  },
  watch: {
    // If URL queries change (e.g. clicking a link in footer), synchronize and refetch
    '$route.query': {
      handler(newQuery) {
        this.syncFiltersFromUrl();
        this.fetchProducts();
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchFilterOptions();
  },
  methods: {
    syncFiltersFromUrl() {
      const q = this.$route.query;
      this.filters.category = q.category || '';
      this.filters.brand = q.brand || '';
      this.filters.search = q.search || '';
      this.filters.minPrice = q.minPrice || '';
      this.filters.maxPrice = q.maxPrice || '';
      this.filters.frequency = q.frequency || '';
      this.filters.power = q.power || '';
      this.filters.inStock = q.inStock === 'true';
      this.filters.sort = q.sort || '';
      this.filters.page = Number(q.page) || 1;
    },
    async fetchFilterOptions() {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/brands')
        ]);
        this.categories = catRes.data;
        this.brands = brandRes.data;
      } catch (err) {
        console.error('Error fetching filter values:', err);
      }
    },
    async fetchProducts() {
      this.loading = true;
      try {
        const params = { ...this.filters };
        const res = await axios.get('/api/products', { params });
        this.products = res.data.products;
        this.totalResults = res.data.pagination.total;
        this.pagination = res.data.pagination;
      } catch (err) {
        console.error('Error querying catalog:', err);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.filters.page = 1;
      this.pushRouteQuery();
    },
    changePage(newPage) {
      this.filters.page = newPage;
      this.pushRouteQuery();
    },
    debounceSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    },
    pushRouteQuery() {
      const query = {};
      if (this.filters.category) query.category = this.filters.category;
      if (this.filters.brand) query.brand = this.filters.brand;
      if (this.filters.search) query.search = this.filters.search;
      if (this.filters.minPrice) query.minPrice = this.filters.minPrice;
      if (this.filters.maxPrice) query.maxPrice = this.filters.maxPrice;
      if (this.filters.frequency) query.frequency = this.filters.frequency;
      if (this.filters.power) query.power = this.filters.power;
      if (this.filters.inStock) query.inStock = String(this.filters.inStock);
      if (this.filters.sort) query.sort = this.filters.sort;
      if (this.filters.page > 1) query.page = this.filters.page;
      
      this.$router.push({ path: '/products', query }).catch(() => {});
    },
    resetFilters() {
      this.filters = {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        frequency: '',
        power: '',
        inStock: false,
        sort: '',
        page: 1
      };
      this.$router.push({ path: '/products' });
    },
    viewProduct(slug) {
      this.$router.push(`/products/${slug}`);
    },
    stripHtml(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
  }
};
</script>

<style scoped>
.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .page-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
}

.search-bar-wrapper {
  width: 400px;
  max-width: 100%;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }
}

/* Sidebar Filters */
.sidebar-filters {
  position: sticky;
  top: 90px;
  align-self: start;
  z-index: 10;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.filter-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.clear-filters-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--color-accent);
  cursor: pointer;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 24px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-limit {
  padding: 10px 12px;
  font-size: 13px;
  text-align: center;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-group label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Grid Section */
.grid-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.results-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.control-actions {
  display: flex;
  gap: 16px;
}

.sort-select {
  padding: 10px 16px;
  font-size: 13px;
  min-width: 180px;
}

.layout-toggles {
  display: flex;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.toggle-btn.active {
  background: var(--color-primary);
  color: var(--color-white);
}

.loading-box {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}

.empty-results {
  text-align: center;
  padding: 60px;
}

.empty-results h3 {
  margin-bottom: 12px;
}

.empty-results p {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

/* Grid & List Styles */
.products-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.products-container.list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.products-container.list .product-card {
  display: flex;
  flex-direction: row;
  height: max-content;
  padding: 0;
}

.products-container.list .card-image-wrapper {
  width: 260px;
  height: 220px;
  flex-shrink: 0;
}

.products-container.list .card-details {
  padding: 24px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-brand-sku {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-bottom: 6px;
}

.product-desc-snippet {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}

.product-specs-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.spec-tag {
  font-size: 11px;
  background: rgba(7, 27, 134, 0.04);
  color: var(--color-primary);
  border: 1px solid rgba(7, 27, 134, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.spec-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-accent);
  flex-shrink: 0;
}

/* Card internals matching home featured list */
.card-image-wrapper {
  background: var(--color-bg);
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.product-img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  transition: var(--transition-smooth);
}

.product-card:hover .product-img {
  transform: scale(1.08);
}

.discount-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--color-accent);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.stock-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #3a3a3c;
  color: var(--color-white);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-white);
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: var(--transition-smooth);
  overflow: hidden;
}

.product-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.card-details {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  cursor: pointer;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px;
}

.product-name:hover {
  color: var(--color-primary);
}

.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.current-price {
  font-weight: 800;
  font-size: 18px;
  color: var(--color-primary);
}

.old-price {
  font-size: 13px;
  text-decoration: line-through;
  color: var(--color-text-secondary);
  margin-left: 8px;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.fav-btn {
  background: var(--color-bg);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.fav-btn.active {
  background: rgba(240, 0, 0, 0.1);
  color: var(--color-accent);
}

.quick-add-btn {
  padding: 8px 12px !important;
  font-size: 12px !important;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pag-btn {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.pag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pag-info {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Mobile-filter-toggle styling */
.mobile-filter-toggle {
  display: none;
}

@media (max-width: 992px) {
  .catalog-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .sidebar-filters {
    display: none;
  }
  .sidebar-filters.show-mobile {
    display: block;
    margin-bottom: 20px;
  }
  .mobile-filter-toggle {
    display: inline-flex;
    align-items: center;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    background: var(--color-white);
    border: 1px solid var(--color-border);
    cursor: pointer;
  }
}

@media (max-width: 600px) {
  .layout-toggles {
    display: none; /* Force grid layout on mobile to display more products */
  }
  .grid-controls {
    flex-wrap: wrap;
    gap: 12px;
  }
  .control-actions {
    display: flex;
    width: 100%;
    gap: 12px;
  }
  .sort-select {
    flex: 1;
    min-width: 0;
  }
  .mobile-filter-toggle {
    flex: 1;
    justify-content: center;
  }
  .products-container.grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .products-container.grid .product-card {
    border-radius: 12px;
  }
  .products-container.grid .card-image-wrapper {
    height: 140px;
  }
  .products-container.grid .card-details {
    padding: 12px;
  }
  .products-container.grid .card-brand-sku {
    font-size: 10px;
    margin-bottom: 4px;
  }
  .products-container.grid .product-name {
    font-size: 13px;
    margin-bottom: 8px;
    height: 34px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .products-container.grid .product-specs-strip {
    display: none; /* Hide specifications strip on mobile for cleaner card UI */
  }
  .products-container.grid .current-price {
    font-size: 15px;
  }
  .products-container.grid .old-price {
    font-size: 11px;
    margin-left: 4px;
  }
  .products-container.grid .quick-add-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
  .products-container.grid .fav-btn {
    width: 32px;
    height: 32px;
  }
  .products-container.grid .fav-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>
