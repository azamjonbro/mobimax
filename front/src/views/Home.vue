<template>
  <div class="home-page">
    <!-- Premium Hero Section (50-60vh) -->
    <header class="hero-section">
      <div class="hero-container">
        <!-- Hero Left: Content -->
        <div class="hero-left">
          <span class="hero-badge">Professional Uskunalar</span>
          <h1 class="hero-title">MobiMax.<br>Ishonchli aloqa va xavfsizlik standarti.</h1>
          <p class="hero-subtitle">
            B2B hamkorlar va yirik korxonalar uchun professional ratsiyalar hamda harbiy darajadagi aksessuarlar. Apple darajasidagi minimalizm va kafolatlangan uzoq masofali ulanish.
          </p>
          
          <div class="hero-ctas">
            <button class="btn btn-primary" @click="scrollToSearch">Katalogni ko'rish</button>
            <a :href="settingsStore.settings.telegramLink" target="_blank" class="btn btn-secondary">
              Telegram Konsultatsiya
            </a>
          </div>

          <div class="hero-trust-badges">
            <span class="trust-badge-item">✔ 10+ Professional Brendlar</span>
            <span class="trust-badge-item">✔ Rasmiy Kafolat</span>
            <span class="trust-badge-item">✔ Tezkor Yetkazish</span>
            <span class="trust-badge-item">✔ CRM Konsultatsiya</span>
          </div>
        </div>

        <!-- Hero Right: Floating Visualization -->
        <div class="hero-right">
          <!-- Abstract Background Circle -->
          <div class="hero-bg-circle"></div>
          
          <!-- Large Floating Walkie Talkie -->
          <img 
            :src="'/uploads/walkie_talkie_luxury_hero.png'" 
            alt="Premium MobiMax Walkie Talkie" 
            class="hero-floating-img"
          />

          <!-- Statistics Floating Cards -->
          <div class="stats-floating-card card stats-card-1">
            <span class="stats-icon">🔥</span>
            <div class="stats-info">
              <h4>10+ Brendlar</h4>
              <p>Motorola, Kenwood...</p>
            </div>
          </div>

          <div class="stats-floating-card card stats-card-2">
            <span class="stats-icon">📡</span>
            <div class="stats-info">
              <h4>IP67 Himoya</h4>
              <p>Suv va changga chidamli</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Centered Full-Width Search Section -->
    <div class="search-section-wrapper" id="search-section">
      <div class="search-container">
        <div class="search-bar-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="debounceSearch" 
            @focus="showSearchSuggestions = true"
            class="form-input search-input-luxury" 
            placeholder="Model, chastota yoki brend bo'yicha qidirish..." 
          />
          <button v-if="filters.search" class="clear-search-btn" @click="clearSearch">&times;</button>
        </div>

        <!-- Search Suggestions Dropdown -->
        <div v-if="showSearchSuggestions" class="search-suggestions-box card">
          <div class="suggestions-close-row">
            <button class="close-suggestions-btn" @click="showSearchSuggestions = false">Yopish</button>
          </div>

          <div v-if="recentSearches.length > 0" class="suggestions-section">
            <div class="section-hdr">
              <span>Oxirgi qidiruvlar</span>
              <button @click="clearSearchHistory" class="clear-history-btn">Tozalash</button>
            </div>
            <div class="history-chips">
              <span v-for="s in recentSearches" :key="s" class="history-chip" @click="applySearchTerm(s)">
                {{ s }}
              </span>
            </div>
          </div>

          <div class="suggestions-section">
            <div class="section-hdr">Ommabop so'rovlar</div>
            <div class="history-chips">
              <span v-for="s in popularSearches" :key="s" class="history-chip popular" @click="applySearchTerm(s)">
                {{ s }}
              </span>
            </div>
          </div>

          <div v-if="suggestedProducts.length > 0" class="suggestions-section">
            <div class="section-hdr">Tavsiya etiladigan mahsulotlar</div>
            <div class="suggested-items">
              <div v-for="p in suggestedProducts" :key="p._id" class="suggested-item" @click="selectSuggestedProduct(p.slug)">
                <img :src="p.mainImage || '/uploads/walkie_talkie_luxury.png'" class="suggest-thumb" />
                <div class="suggest-info">
                  <span class="suggest-name">{{ p.name }}</span>
                  <span class="suggest-price">${{ p.price.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- Popular Brands Logo Cards -->
    <section class="brands-section-luxury">
      <div class="brands-container">
        <h2 class="section-title text-center">Ishonchli hamkorlarimiz</h2>
        <div class="brands-grid-luxury">
          <div 
            v-for="brand in brands" 
            :key="brand._id"
            class="brand-card-luxury"
            :class="{ active: filters.brand === brand.slug }"
            @click="selectBrand(brand.slug)"
          >
            <div class="brand-logo-text">{{ brand.name }}</div>
            <span class="brand-badge-click" v-if="filters.brand === brand.slug">Katalogda</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Products Catalog layout -->
    <section class="catalog-section" id="catalog-section">
      <div class="catalog-container">
        <!-- Filters Sidebar on Desktop -->
        <aside class="desktop-filters-sidebar">
          <div class="filters-card card">
            <div class="filters-sidebar-header">
              <h3>Filtrlar</h3>
              <button class="clear-sidebar-filters" @click="resetFilters">Tozalash</button>
            </div>

            <!-- Price -->
            <div class="filter-group">
              <label class="form-label">Narx oralig'i (USD)</label>
              <div class="price-inputs">
                <input type="number" v-model="filters.minPrice" @change="applyFilters" class="form-input price-limit" placeholder="Min" />
                <span>-</span>
                <input type="number" v-model="filters.maxPrice" @change="applyFilters" class="form-input price-limit" placeholder="Max" />
              </div>
            </div>

            <!-- Frequency -->
            <div class="filter-group">
              <label class="form-label">Chastota diapazoni</label>
              <select v-model="filters.frequency" @change="applyFilters" class="form-input">
                <option value="">Istalgan chastota</option>
                <option value="UHF">UHF (400-470 MHz)</option>
                <option value="VHF">VHF (136-174 MHz)</option>
                <option value="Dual">Dual Band</option>
              </select>
            </div>

            <!-- Power -->
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

            <!-- Availability -->
            <div class="filter-group checkbox-group">
              <input type="checkbox" id="desk-in-stock" v-model="filters.inStock" @change="applyFilters" />
              <label for="desk-in-stock">Faqat omborda bor mahsulotlar</label>
            </div>
          </div>
        </aside>

        <!-- Product Listing Grid Area -->
        <div class="products-listing-area">
          <div class="grid-controls-row">
            <span class="results-count-text">{{ pagination.total }} ta mahsulot topildi</span>
            <div class="controls-actions-row">
              <select v-model="filters.sort" @change="applyFilters" class="form-input sort-select-luxury">
                <option value="">Saralash: Yangi kelganlar</option>
                <option value="price_asc">Narx: arzonidan qimmatiga</option>
                <option value="price_desc">Narx: qimmatidan arzoniga</option>
                <option value="popular">Ommabopligi</option>
              </select>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading && products.length === 0" class="loading-box text-center" style="padding: 100px 0;">
            <p>Aloqa chastotalari skanerlanmoqda...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="products.length === 0" class="empty-state-card card text-center" style="padding: 60px;">
            <h3>Siz tanlagan mezonlar bo'yicha mahsulot topilmadi.</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 20px;">Qidiruv yoki filtrlarni tozalab ko'ring.</p>
            <button class="btn btn-primary" @click="resetFilters">Katalogni tiklash</button>
          </div>

          <!-- Luxury Products Grid -->
          <div v-else class="products-grid-luxury">
            <template v-for="(prod, index) in products" :key="prod._id">
              <!-- Injected CRM CTA Card -->
              <div v-if="index > 0 && index % 6 === 0" class="luxury-cta-card card text-center">
                <div class="cta-luxury-emoji">📡</div>
                <h3>Maxsus loyiha bo'yicha ratsiyalar kerakmi?</h3>
                <p>Bizning mutaxassis-injenerlarimiz sizning korxonangiz uchun to'liq signal tizimini loyihalashtirib berishadi.</p>
                <div class="cta-luxury-buttons">
                  <a :href="'tel:' + settingsStore.settings.phone" class="btn btn-primary btn-sm">Qo'ng'iroq qilish</a>
                  <a :href="settingsStore.settings.telegramLink" target="_blank" class="btn btn-secondary btn-sm">Telegram Aloqa</a>
                </div>
              </div>

              <!-- Product Card (luxury rounded 24px) -->
              <div class="product-card-luxury card">
                <div class="card-image-section" @click="viewProduct(prod.slug)">
                  <img 
                    :src="prod.mainImage || '/uploads/walkie_talkie_luxury.png'" 
                    alt="MobiMax Product" 
                    class="luxury-prod-img"
                  />
                  <!-- Hover Image effect -->
                  <img 
                    v-if="prod.images && prod.images[1]" 
                    :src="prod.images[1]" 
                    class="luxury-prod-img hover-img"
                  />
                  
                  <!-- Badges overlay -->
                  <span class="luxury-discount-badge" v-if="prod.discount > 0">-{{ prod.discount }}%</span>
                  <span class="luxury-stock-badge out-of-stock" v-if="prod.stock === 0">Omborda yo'q</span>
                </div>

                <!-- Floating Wishlist Button -->
                <button 
                  class="luxury-wishlist-toggle"
                  :class="{ active: wishlistStore.isFavorite(prod._id) }"
                  @click="wishlistStore.toggleFavorite(prod._id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" :fill="wishlistStore.isFavorite(prod._id) ? '#ff3b30' : 'none'" :stroke="wishlistStore.isFavorite(prod._id) ? '#ff3b30' : 'currentColor'" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div class="card-details-section">
                  <span class="luxury-brand-tag">{{ prod.brand?.name }}</span>
                  <h3 class="luxury-product-title" @click="viewProduct(prod.slug)">{{ prod.name }}</h3>
                  
                  <!-- Short specs highlights -->
                  <div class="luxury-specs-tags">
                    <span v-for="spec in prod.specifications?.slice(0,2)" :key="spec.key" class="luxury-spec-pill">
                      {{ spec.value }}
                    </span>
                  </div>

                  <!-- Star Ratings placeholder for premium feel -->
                  <div class="luxury-ratings-row">
                    <span class="star-filled">★</span>
                    <span class="rating-text">5.0 (12 ta sharh)</span>
                  </div>

                  <div class="luxury-pricing-row">
                    <div class="price-container">
                      <span class="current-price-val">${{ prod.price.toFixed(2) }}</span>
                      <span class="old-price-val" v-if="prod.oldPrice > 0">${{ prod.oldPrice.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- Bottom buttons aligned side-by-side -->
                  <div class="luxury-actions-buttons">
                    <button class="btn btn-primary add-cart-luxury-btn" @click="cartStore.addToCart(prod, 1)">
                      Savatga qo'shish
                    </button>
                    <button class="btn btn-accent-outline quote-luxury-btn" @click="openQuickOrder(prod)">
                      ⚡ Tezkor buyurtma
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Load More -->
          <div v-if="products.length > 0 && pagination.page < pagination.totalPages" class="load-more-wrapper text-center">
            <button class="btn btn-secondary load-more-luxury" :disabled="loading" @click="loadMore">
              {{ loading ? 'Yuklanmoqda...' : 'Yana yuklash' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section (Apple style minimal grid) -->
    <section class="benefits-section">
      <div class="benefits-container grid-4-columns">
        <div class="benefit-item text-center">
          <div class="benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h3>Rasmiy Kafolat</h3>
          <p>Barcha MobiMax mahsulotlariga 1 yillik rasmiy ishlab chiqaruvchi kafolati beriladi.</p>
        </div>

        <div class="benefit-item text-center">
          <div class="benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.75A1.125 1.125 0 012.625 17.625V4.625c0-.621.504-1.125 1.125-1.125H12.75v15.25m-6-3h9.75m1.5-6h2.25A2.25 2.25 0 0122.5 13.5v3.75a1.125 1.125 0 01-1.125 1.125h-.375m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <h3>Tezkor Yetkazib berish</h3>
          <p>O'zbekiston bo'ylab 24 soat ichida mutaxassis orqali yetkazib berish va o'rnatish.</p>
        </div>

        <div class="benefit-item text-center">
          <div class="benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3>Bepul Dasturlash</h3>
          <p>Sotib olingan ratsiyalar siz istagan chastotaga mutaxassislarimiz tomonidan bepul dasturlab beriladi.</p>
        </div>

        <div class="benefit-item text-center">
          <div class="benefit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3>CRM & B2B Hujjatlar</h3>
          <p>Shartnomalar, hisob-fakturalar va kotirovka so'rovlarini avtomatlashtirilgan tezkor rasmiylashtirish.</p>
        </div>
      </div>
    </section>



    <!-- Quick Order Modal dialog -->
    <div v-if="quickOrderProduct" class="modal-backdrop" @click="closeQuickOrder"></div>
    <div v-if="quickOrderProduct" class="quick-order-modal card">
      <div class="modal-header">
        <h3>Tezkor buyurtma</h3>
        <button class="close-modal-btn" @click="closeQuickOrder">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="quickOrderSuccess" class="quick-order-success-view text-center" style="padding: 10px 0;">
          <div style="font-size: 40px; color: #34c759; margin-bottom: 12px;">✓</div>
          <h4>Buyurtmangiz ro'yxatga olindi!</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px;">
            Lid ID: <strong>{{ quickOrderLeadId }}</strong>
          </p>
          <p style="font-size: 13px; margin-bottom: 20px;">Menejerlarimiz tez orada siz bilan bog'lanishadi.</p>
          <button class="btn btn-primary" style="width: 100%;" @click="closeQuickOrder">Yopish</button>
        </div>

        <div v-else>
          <div class="quick-prod-preview" style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px; background: var(--color-bg); padding: 10px; border-radius: 8px;">
            <img :src="quickOrderProduct.mainImage || '/uploads/walkie_talkie_luxury.png'" style="width: 50px; height: 50px; object-fit: contain;" />
            <div>
              <h4 style="font-size: 14px; font-weight: 700;">{{ quickOrderProduct.name }}</h4>
              <span style="color: var(--color-primary); font-weight: 700; font-size: 13px;">${{ quickOrderProduct.price.toFixed(2) }}</span>
            </div>
          </div>

          <form @submit.prevent="submitQuickOrder">
            <div class="form-group">
              <label class="form-label">Ismingiz *</label>
              <input type="text" v-model="quickOrderForm.name" class="form-input" placeholder="Ismingizni kiriting" required />
            </div>
            <div class="form-group">
              <label class="form-label">Telefon raqamingiz *</label>
              <input type="tel" v-model="quickOrderForm.phone" class="form-input" placeholder="+998 (90) 123-4567" required />
            </div>
            <button type="submit" class="btn btn-accent" style="width: 100%; margin-top: 10px;" :disabled="quickOrderSubmitting">
              {{ quickOrderSubmitting ? 'Yuborilmoqda...' : 'Tasdiqlash' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import { useSettingsStore } from '../stores/settings';

export default {
  name: 'Home',
  data() {
    return {
      products: [],
      categories: [],
      brands: [],
      loading: false,
      searchTimeout: null,
      showSearchSuggestions: false,
      showFilterDrawer: false,
      activeQuickChoice: '',
      recentSearches: [],
      popularSearches: ['Ratsiya', 'Baofeng UV-5R', 'Motorola', 'Antenna', 'Naushnik'],
      filters: {
        search: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        frequency: '',
        power: '',
        range: '',
        inStock: false,
        featured: '',
        popular: '',
        new: '',
        useCase: '',
        sort: '',
        page: 1
      },
      pagination: {
        total: 0,
        page: 1,
        totalPages: 1
      },
      quickOrderProduct: null,
      quickOrderForm: {
        name: '',
        phone: ''
      },
      quickOrderSubmitting: false,
      quickOrderSuccess: false,
      quickOrderLeadId: ''
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
    },
    suggestedProducts() {
      if (!this.filters.search) return [];
      const searchLower = this.filters.search.toLowerCase();
      return this.products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.sku.toLowerCase().includes(searchLower)
      ).slice(0, 5);
    }
  },
  mounted() {
    this.fetchFilterOptions();
    this.fetchProducts();
    this.loadSearchHistory();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
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
    async fetchProducts(append = false) {
      this.loading = true;
      try {
        const params = { ...this.filters, limit: 12 };
        const res = await axios.get('/api/products', { params });
        if (append) {
          this.products = [...this.products, ...res.data.products];
        } else {
          this.products = res.data.products;
        }
        this.pagination = res.data.pagination;
      } catch (err) {
        console.error('Error querying catalog:', err);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.filters.page = 1;
      this.fetchProducts();
    },
    applyFiltersAndClose() {
      this.applyFilters();
      this.showFilterDrawer = false;
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
        range: '',
        inStock: false,
        featured: '',
        popular: '',
        new: '',
        useCase: '',
        sort: '',
        page: 1
      };
      this.activeQuickChoice = '';
      this.showFilterDrawer = false;
      this.fetchProducts();
    },
    loadMore() {
      if (this.filters.page < this.pagination.totalPages) {
        this.filters.page += 1;
        this.fetchProducts(true);
      }
    },
    debounceSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        if (this.filters.search) {
          this.saveSearchTerm(this.filters.search);
        }
        this.applyFilters();
      }, 500);
    },
    clearSearch() {
      this.filters.search = '';
      this.applyFilters();
    },
    scrollToSearch() {
      const el = document.getElementById('search-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    viewProduct(slug) {
      this.showSearchSuggestions = false;
      this.$router.push(`/products/${slug}`);
    },
    selectSuggestedProduct(slug) {
      this.viewProduct(slug);
    },
    selectCategory(slug) {
      // Toggle category selection
      this.filters.category = (this.filters.category === slug) ? '' : slug;
      this.applyFilters();
      this.scrollToCatalog();
    },
    selectBrand(slug) {
      // Toggle brand selection
      this.filters.brand = (this.filters.brand === slug) ? '' : slug;
      this.applyFilters();
      this.scrollToCatalog();
    },
    scrollToCatalog() {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    // Search history
    loadSearchHistory() {
      const history = localStorage.getItem('recent_searches');
      this.recentSearches = history ? JSON.parse(history) : [];
    },
    saveSearchTerm(term) {
      if (!term.trim()) return;
      let history = localStorage.getItem('recent_searches');
      let arr = history ? JSON.parse(history) : [];
      arr = arr.filter(x => x.toLowerCase() !== term.toLowerCase());
      arr.unshift(term.trim());
      arr = arr.slice(0, 6);
      localStorage.setItem('recent_searches', JSON.stringify(arr));
      this.recentSearches = arr;
    },
    clearSearchHistory() {
      localStorage.removeItem('recent_searches');
      this.recentSearches = [];
    },
    applySearchTerm(term) {
      this.filters.search = term;
      this.showSearchSuggestions = false;
      this.saveSearchTerm(term);
      this.applyFilters();
    },
    // Quick order modal
    openQuickOrder(prod) {
      this.quickOrderProduct = prod;
      this.quickOrderForm.name = '';
      this.quickOrderForm.phone = '';
      this.quickOrderSuccess = false;
    },
    closeQuickOrder() {
      this.quickOrderProduct = null;
    },
    async submitQuickOrder() {
      if (!this.quickOrderForm.name || !this.quickOrderForm.phone) {
        alert('Iltimos, ism va telefon raqamingizni kiriting.');
        return;
      }
      this.quickOrderSubmitting = true;
      try {
        const payload = {
          customer: {
            name: this.quickOrderForm.name,
            phone: this.quickOrderForm.phone,
            region: 'Tezkor Buyurtma',
            comment: `Tezkor Buyurtma: ${this.quickOrderProduct.name}`
          },
          items: [{
            product: this.quickOrderProduct._id,
            quantity: 1,
            price: this.quickOrderProduct.price
          }]
        };

        const res = await axios.post('/api/order', payload);
        this.quickOrderLeadId = res.data.leadId;
        this.quickOrderSuccess = true;
      } catch (err) {
        console.error(err);
        alert('Tezkor buyurtma yuborishda xatolik. Iltimos qaytadan urining.');
      } finally {
        this.quickOrderSubmitting = false;
      }
    },
    getCategoryIconSvg(slug) {
      // Returns high-end inline SVG icons for the categories
      if (slug === 'portable-radios') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2zM12 7V3m0 0L9 5m3-2l3 2" /></svg>`;
      } else if (slug === 'vehicle-radios') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011 1v2a1 1 0 01-1 1m0-4h3m-3 0a1 1 0 00-1-1H9M13 6h5a2 2 0 012 2v7M16 8v3h4M3 10h10" /></svg>`;
      } else if (slug === 'antennas') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m0-18l-4 4m4-4l4 4m-4 5l-2 2m2-2l2 2m-2 3l-3 3m3-3l3 3" /></svg>`;
      } else if (slug === 'accessories') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.53M12 11c0-2.924-1.17-5.571-3.078-7.5M12 11h.01M9 11h-.01M4 9h.01M16 13h.01M20 11h.01M18 7h.01M15 4h.01" /></svg>`;
      } else if (slug === 'power') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    },
    handleClickOutside(e) {
      const searchContainer = this.$el.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        this.showSearchSuggestions = false;
      }
    },
    stripHtml(html) {
      if (!html) return '';
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
  }
};
</script>

<style scoped>
/* Luxury Minimalist Hero Section */
.hero-section {
  position: relative;
  background: var(--color-white);
  border-radius: var(--border-radius-card);
  margin-bottom: 32px;
  overflow: hidden;
  padding: 80px 48px;
  min-height: 520px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.hero-container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 48px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
}

.hero-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
}

.hero-badge {
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  color: var(--color-accent);
  letter-spacing: 0.15em;
  margin-bottom: 16px;
  background: rgba(240, 0, 0, 0.05);
  padding: 6px 14px;
  border-radius: 30px;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.15;
  color: var(--color-primary);
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 520px;
}

.hero-ctas {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.hero-trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.trust-badge-item {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
}

.hero-right {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg-circle {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(7, 27, 134, 0.04) 0%, rgba(245, 245, 247, 0) 70%);
  z-index: 1;
}

.hero-floating-img {
  max-height: 380px;
  max-width: 100%;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.08));
  animation: float 6s ease-in-out infinite;
}

/* Floating overlay cards */
.stats-floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  z-index: 3;
  width: max-content;
}

.stats-card-1 {
  top: 40px;
  left: 20px;
}

.stats-card-2 {
  bottom: 40px;
  right: 10px;
}

.stats-icon {
  font-size: 20px;
}

.stats-info h4 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stats-info p {
  font-size: 11px;
  color: var(--color-text-secondary);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Full Width Search Area */
.search-section-wrapper {
  margin-bottom: 48px;
}

.search-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-input-luxury {
  width: 100%;
  padding-left: 60px;
  padding-right: 60px;
  border-radius: 20px;
  height: 64px;
  font-weight: 500;
  font-size: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  background-color: var(--color-white);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-smooth);
}

.search-input-luxury:focus {
  border-color: var(--color-primary);
  box-shadow: 0 8px 30px rgba(7, 27, 134, 0.05);
}

.clear-search-btn {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 26px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

/* Suggestions Dropdown */
.search-suggestions-box {
  position: absolute;
  top: 105%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--color-white) !important;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-hover);
  padding: 24px;
  border-radius: var(--border-radius-card);
}

.suggestions-close-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.close-suggestions-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.suggestions-section {
  margin-bottom: 20px;
}

.section-hdr {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-history-btn {
  background: none;
  border: none;
  font-size: 11px;
  color: var(--color-accent);
  cursor: pointer;
}

.history-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-chip {
  background: var(--color-bg);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--color-text);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.history-chip:hover {
  background: var(--color-primary);
  color: var(--color-white);
}

.history-chip.popular {
  background: rgba(7, 27, 134, 0.05);
  color: var(--color-primary);
}

.suggested-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggested-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
}

.suggested-item:last-child {
  border-bottom: none;
}

.suggest-thumb {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.suggest-info {
  display: flex;
  flex-direction: column;
}

.suggest-name {
  font-size: 13px;
  font-weight: 600;
}

.suggest-price {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 700;
}

/* Category cards grid/scroller */
.categories-section {
  margin-bottom: 48px;
}

.categories-container {
  max-width: 1300px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.categories-scroller {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 4px;
}

.categories-scroller::-webkit-scrollbar {
  display: none;
}

.category-card-luxury {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-white);
  padding: 16px 24px;
  border-radius: 20px;
  cursor: pointer;
  min-width: 250px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: var(--transition-smooth);
}

.category-card-luxury:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.category-card-luxury.active {
  background: var(--color-primary);
  color: var(--color-white);
}

.category-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(7, 27, 134, 0.05);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-card-luxury.active .category-icon-bg {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
}

.category-card-info h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 2px;
}

.category-card-info p {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.category-card-luxury.active .category-card-info p {
  color: rgba(255, 255, 255, 0.7);
}

/* Brands section styling */
.brands-section-luxury {
  margin-bottom: 60px;
}

.brands-container {
  max-width: 1300px;
  margin: 0 auto;
}

.brands-grid-luxury {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.brand-card-luxury {
  background: var(--color-white);
  padding: 24px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: var(--transition-smooth);
}

.brand-card-luxury:hover {
  transform: scale(1.04);
  box-shadow: var(--shadow-hover);
}

.brand-card-luxury.active {
  background: rgba(240, 0, 0, 0.05);
  border-color: var(--color-accent);
}

.brand-logo-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
}

.brand-badge-click {
  position: absolute;
  top: 8px;
  right: 12px;
  background: var(--color-accent);
  color: var(--color-white);
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Catalog Grid & Filters Sidebar */
.catalog-section {
  margin-bottom: 80px;
}

.catalog-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  max-width: 1300px;
  margin: 0 auto;
}

.desktop-filters-sidebar {
  position: sticky;
  top: 90px;
  align-self: start;
  z-index: 10;
}

.filters-card {
  padding: 24px;
}

.filters-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.filters-sidebar-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.clear-sidebar-filters {
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
  background: var(--color-bg);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-group label {
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.grid-controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.results-count-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.controls-actions-row {
  display: flex;
  gap: 16px;
}

.mobile-filter-btn {
  display: none;
}

.sort-select-luxury {
  padding: 10px 16px;
  font-size: 13px;
  min-width: 200px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

/* Products grid - Apple Store columns */
.products-grid-luxury {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}


/* Product Card - Dynamic self-adjusting height, luxury layout */
.product-card-luxury {
  height: 100%;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: var(--border-radius-card);
  transition: var(--transition-smooth);
}

.product-card-luxury:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

.card-image-section {
  position: relative;
  height: 240px; /* 50% image area */
  background: #FFFFFF;
  border-bottom: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.luxury-prod-img {
  max-width: 75%;
  max-height: 75%;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.hover-img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.product-card-luxury:hover .luxury-prod-img:not(.hover-img) {
  transform: scale(1.05);
}

.product-card-luxury:hover .hover-img {
  opacity: 1;
}

.luxury-discount-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--color-accent);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.luxury-stock-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #3a3a3c;
  color: var(--color-white);
  font-size: 9px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.luxury-wishlist-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  z-index: 10;
  color: var(--color-text-secondary);
  transition: var(--transition-smooth);
}

.luxury-wishlist-toggle:hover {
  transform: scale(1.1);
}

.luxury-wishlist-toggle.active {
  color: var(--color-accent);
  background: var(--color-white);
}

.card-details-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.luxury-brand-tag {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.luxury-product-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
  margin-bottom: 8px;
  cursor: pointer;
  height: 38px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.luxury-specs-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.luxury-spec-pill {
  font-size: 10px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.luxury-ratings-row {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.star-filled {
  color: #ff9500;
  font-size: 12px;
}

.rating-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.luxury-pricing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.current-price-val {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
}

.old-price-val {
  font-size: 13px;
  text-decoration: line-through;
  color: var(--color-text-secondary);
  margin-left: 8px;
}

.luxury-actions-buttons {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.add-cart-luxury-btn {
  flex: 1.2;
  height: 40px !important;
  font-size: 11px !important;
  border-radius: 10px;
  padding: 0 4px !important;
  flex-shrink: 1;
  min-width: 0;
}

.quote-luxury-btn {
  flex: 0.8;
  height: 40px !important;
  font-size: 11px !important;
  border-radius: 10px;
  padding: 0 4px !important;
  flex-shrink: 1;
  min-width: 0;
}

/* Injected CRM CTA Card luxury style */
.luxury-cta-card {
  grid-column: span 3;
  background: linear-gradient(135deg, rgba(7, 27, 134, 0.02) 0%, rgba(240, 0, 0, 0.01) 100%);
  border: 1.5px dashed rgba(7, 27, 134, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

@media (min-width: 1440px) {
  .luxury-cta-card {
    grid-column: span 4;
  }
}

.cta-luxury-emoji {
  font-size: 32px;
  margin-bottom: 12px;
}

.luxury-cta-card h3 {
  font-size: 18px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.luxury-cta-card p {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin-bottom: 20px;
}

.cta-luxury-buttons {
  display: flex;
  gap: 12px;
}

/* Load More */
.load-more-wrapper {
  margin-top: 40px;
}

.load-more-luxury {
  background: var(--color-white);
  border: 1px solid var(--color-border);
}

/* Benefits Section */
.benefits-section {
  background: var(--color-white);
  padding: 80px 48px;
  margin: 60px -80px -40px;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
}

.benefits-container {
  max-width: 1300px;
  margin: 0 auto;
}

.grid-4-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.benefit-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.benefit-item h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.benefit-item p {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Quick Order Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 3000;
}

.quick-order-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 380px;
  max-width: 90%;
  z-index: 3001;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius-card);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

/* Mobile responsive media queries */
@media (max-width: 1024px) {
  .hero-section {
    padding: 60px 24px;
  }
  .hero-container {
    grid-template-columns: 1.2fr 0.8fr;
    gap: 32px;
  }
  .hero-title {
    font-size: 36px;
  }
  .catalog-container {
    grid-template-columns: 1fr;
  }
  .desktop-filters-sidebar {
    display: none;
  }
  .mobile-filter-btn {
    display: inline-flex;
    align-items: center;
  }
  .products-grid-luxury {
    grid-template-columns: repeat(3, 1fr);
  }
  .luxury-cta-card {
    grid-column: span 3;
  }
  .grid-4-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 24px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-left {
    align-items: center;
  }
  .hero-ctas {
    justify-content: center;
  }
  .hero-trust-badges {
    justify-content: center;
  }
  .hero-right {
    height: 300px;
    margin-top: 24px;
  }
  .stats-card-1 {
    left: 0;
  }
  .stats-card-2 {
    right: 0;
  }
  .brands-grid-luxury {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .brand-card-luxury {
    padding: 14px 10px;
    border-radius: 14px;
  }
  .brand-logo-text {
    font-size: 13px;
  }
  .grid-controls-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .controls-actions-row {
    width: 100%;
    gap: 8px;
  }
  .mobile-filter-btn {
    flex: 1;
    justify-content: center;
    height: 42px;
  }
  .sort-select-luxury {
    flex: 1;
    min-width: 0;
    height: 42px;
  }
  .products-grid-luxury {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .product-card-luxury {
    height: 100%;
  }
  .card-image-section {
    height: 180px;
  }
  .luxury-product-title {
    font-size: 13px;
    height: 34px;
  }
  .luxury-spec-pill {
    display: none;
  }
  .star-filled, .rating-text {
    font-size: 10px;
  }
  .current-price-val {
    font-size: 15px;
  }
  .luxury-cta-card {
    grid-column: span 2;
    padding: 20px;
  }
  .luxury-cta-card p {
    font-size: 11px;
  }
  .benefits-section {
    padding: 60px 24px;
    margin: 40px -20px -20px;
  }
  .luxury-actions-buttons {
    flex-direction: column;
    gap: 6px;
  }
  .add-cart-luxury-btn, .quote-luxury-btn {
    width: 100%;
    flex: none !important;
  }
}

@media (max-width: 480px) {
  .benefits-section {
    margin: 40px -20px -20px;
  }
  .brands-grid-luxury {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .brand-card-luxury {
    padding: 12px 8px;
    border-radius: 12px;
  }
  .brand-logo-text {
    font-size: 12px;
  }
  .grid-4-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .luxury-actions-buttons {
    flex-direction: column;
    gap: 6px;
  }
  .add-cart-luxury-btn, .quote-luxury-btn {
    width: 100%;
  }
  .product-card-luxury {
    height: 100%;
  }
}
</style>
