<template>
  <div class="page-container">
    <!-- Navbar Navigation -->
    <nav class="navbar">
      <router-link to="/" class="nav-brand">
        MobiMax<span>.</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Bosh sahifa</router-link>
        <router-link to="/products" class="nav-link">Mahsulotlar</router-link>
      </div>
      <div class="nav-actions">
        <!-- Wishlist Toggle -->
        <button class="nav-btn" @click="toggleWishlist" title="Tanlanganlar">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span v-if="wishlistCount > 0" class="badge">{{ wishlistCount }}</span>
        </button>

        <!-- Cart Toggle -->
        <button class="nav-btn" @click="toggleCart" title="Savat">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </button>
      </div>
    </nav>

    <!-- Main Viewport Router -->
    <router-view />

    <!-- Drawer Cart Slider -->
    <div v-if="cartStore.isOpen" class="drawer-backdrop" @click="toggleCart"></div>
    <div class="drawer" :style="{ transform: cartStore.isOpen ? 'translateX(0)' : 'translateX(100%)' }">
      <div class="drawer-header" style="align-items: center;">
        <button v-if="checkoutMode && !checkoutSuccess" class="drawer-back-btn" @click="cancelCheckout" style="background: none; border: none; font-size: 20px; cursor: pointer; margin-right: 12px; color: var(--color-primary);">←</button>
        <h2 class="drawer-title" style="flex: 1;">
          {{ checkoutSuccess ? 'Tasdiqlandi' : (checkoutMode ? 'Rasmiylashtirish' : 'Savat') }}
        </h2>
        <button class="drawer-close" @click="toggleCart">&times;</button>
      </div>

      <div class="drawer-content">
        <!-- SUCCESS SCREEN -->
        <div v-if="checkoutSuccess" class="drawer-success-screen" style="text-align: center; padding: 20px 0;">
          <div class="success-icon" style="width: 70px; height: 70px; background: rgba(7, 27, 134, 0.05); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 style="font-size: 20px; margin-bottom: 12px; font-weight: 700;">So'rov muvaffaqiyatli yuborildi!</h3>
          <p style="color: var(--color-text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 24px;">Sizning aloqa so'rovingiz ro'yxatdan o'tkazildi. Bizning muhandis-menejerlarimiz tez orada bog'lanishadi.</p>
          
          <div class="success-details" style="background: var(--color-bg); padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: left; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>So'rov ID:</span>
              <strong>{{ leadId }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;" v-if="totalAmount > 0">
              <span>Taxminiy jami:</span>
              <strong>${{ totalAmount.toFixed(2) }}</strong>
            </div>
          </div>

          <a :href="settingsStore.settings.telegramLink" target="_blank" class="btn btn-accent" style="width: 100%; margin-bottom: 12px; display: inline-flex;">Telegram Menejer</a>
          <button class="btn btn-secondary" style="width: 100%;" @click="toggleCart">Yopish</button>
        </div>

        <!-- CHECKOUT FORM -->
        <div v-else-if="checkoutMode" class="drawer-checkout-form">
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 20px;">Buyurtmani rasmiylashtirish uchun ma'lumotlaringizni kiriting:</p>
          
          <div class="form-group">
            <label class="form-label">To'liq ism-sharifingiz *</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="Ismingizni kiriting" required />
          </div>

          <div class="form-group">
            <label class="form-label">Telefon raqamingiz *</label>
            <input type="tel" v-model="form.phone" class="form-input" placeholder="+998 (90) 123-4567" required />
          </div>

          <div class="form-group">
            <label class="form-label">Viloyat / Shahar *</label>
            <input type="text" v-model="form.region" class="form-input" placeholder="Masalan: Toshkent shahar" required />
          </div>

          <div class="form-group">
            <label class="form-label">Kompaniya nomi (B2B bo'lsa)</label>
            <input type="text" v-model="form.company" class="form-input" placeholder="MChJ yoki korxona nomi" />
          </div>

          <div class="form-group">
            <label class="form-label">Telegram username</label>
            <input type="text" v-model="form.telegram" class="form-input" placeholder="@username" />
          </div>

          <div class="form-group">
            <label class="form-label">Qo'shimcha izohlar</label>
            <textarea v-model="form.comment" class="form-input" rows="2" placeholder="Masalan: dasturlash talablari..."></textarea>
          </div>
        </div>

        <!-- CART ITEM LIST -->
        <div v-else>
          <div v-if="cartStore.items.length === 0" class="empty-message">
            Savatingiz bo'sh.
          </div>
          <div v-else class="cart-items-list">
            <div v-for="item in cartStore.items" :key="item.product" class="cart-item">
              <img :src="item.image ? item.image : '/uploads/walkie_talkie_luxury.png'" class="cart-item-img" alt="" />
              <div class="cart-item-info">
                <h4 class="cart-item-name">{{ item.name }}</h4>
                <p class="cart-item-price">${{ item.price.toFixed(2) }}</p>
                <div class="cart-qty-control">
                  <button class="qty-btn" @click="cartStore.updateQuantity(item.product, item.quantity - 1)">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button class="qty-btn" @click="cartStore.updateQuantity(item.product, item.quantity + 1)">+</button>
                </div>
              </div>
              <button class="remove-item-btn" @click="cartStore.removeFromCart(item.product)">&times;</button>
            </div>
          </div>
        </div>
      </div>

      <div class="drawer-footer" v-if="cartStore.items.length > 0 || (checkoutMode && !checkoutSuccess)">
        <div class="subtotal-row">
          <span>Jami</span>
          <span class="subtotal-price">${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <button v-if="checkoutMode" class="btn btn-primary checkout-btn" :disabled="submitting" @click="submitLead">
          {{ submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash' }}
        </button>
        <button v-else class="btn btn-primary checkout-btn" @click="startCheckout">Buyurtma berish</button>
      </div>
    </div>

    <!-- Wishlist Drawer Slider -->
    <div v-if="showWishlist" class="drawer-backdrop" @click="toggleWishlist"></div>
    <div class="drawer" :style="{ transform: showWishlist ? 'translateX(0)' : 'translateX(100%)' }">
      <div class="drawer-header">
        <h2 class="drawer-title">Tanlanganlar</h2>
        <button class="drawer-close" @click="toggleWishlist">&times;</button>
      </div>
      <div class="drawer-content">
        <div v-if="wishlistStore.productIds.length === 0" class="empty-message">
          Tanlangan mahsulotlar yo'q.
        </div>
        <div v-else class="wishlist-items-list">
          <div v-for="id in wishlistStore.productIds" :key="id" class="wishlist-item">
            <p>Mahsulot SKU: {{ id }}</p>
            <button class="btn btn-secondary view-fav-btn" @click="viewProductById(id)">Ko'rish</button>
            <button class="remove-fav-btn" @click="wishlistStore.toggleFavorite(id)">O'chirish</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer>
      <div class="footer-grid">
        <div class="footer-col">
          <h3>MobiMax Accessories</h3>
          <p>Apple darajasidagi B2B ratsiya va aksessuarlar platformasi. Menejerlarga uzoq masofali ratsiyalar, chidamli aksessuarlar va batareyalarni sotib olishda yordam beradi.</p>
        </div>
        <div class="footer-col">
          <h3>Kategoriyalar</h3>
          <ul>
            <li><router-link to="/products?category=portable-radios">Ko'chma ratsiyalar</router-link></li>
            <li><router-link to="/products?category=vehicle-radios">Avtomobil ratsiyalari</router-link></li>
            <li><router-link to="/products?category=antennas">Antennalar</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Yordam va Aloqa</h3>
          <p style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ settingsStore.settings.workingHours || 'Dush - Jum: 9:00 - 18:00' }}
          </p>
          <p style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ settingsStore.settings.address || 'Toshkent sh., O\'zbekiston' }}
          </p>
          <p style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {{ settingsStore.settings.phone || '+998 (90) 123-4567' }}
          </p>
        </div>
        <div class="footer-col">
          <h3>Ijtimoiy tarmoqlar</h3>
          <ul>
            <li>
              <a :href="settingsStore.settings.telegramLink" target="_blank" style="display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                Telegram Menejer
              </a>
            </li>
            <li>
              <a :href="settingsStore.settings.instagramLink" target="_blank" style="display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram sahifa
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 MobiMax Accessories. Barcha huquqlar himoyalangan.</p>
        <p>Oson va tez buyurtma tizimi.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from './stores/cart';
import { useWishlistStore } from './stores/wishlist';
import { useSettingsStore } from './stores/settings';

export default {
  name: 'App',
  data() {
    return {
      showWishlist: false,
      checkoutMode: false,
      checkoutSuccess: false,
      submitting: false,
      leadId: '',
      totalAmount: 0,
      form: {
        name: '',
        phone: '',
        company: '',
        telegram: '',
        region: '',
        comment: ''
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
    },
    cartCount() {
      return this.cartStore.totalItems;
    },
    wishlistCount() {
      return this.wishlistStore.totalItems;
    }
  },
  methods: {
    toggleCart() {
      this.cartStore.toggleCart();
      if (this.cartStore.isOpen) {
        this.showWishlist = false;
        this.checkoutMode = false;
        this.checkoutSuccess = false;
      }
    },
    toggleWishlist() {
      this.showWishlist = !this.showWishlist;
      if (this.showWishlist) this.cartStore.closeCart();
    },
    startCheckout() {
      this.checkoutMode = true;
    },
    cancelCheckout() {
      this.checkoutMode = false;
    },
    async submitLead() {
      if (!this.form.name || !this.form.phone || !this.form.region) {
        alert('Iltimos, barcha majburiy maydonlarni to\'ldiring.');
        return;
      }
      this.submitting = true;
      try {
        const payload = {
          customer: {
            name: this.form.name,
            phone: this.form.phone,
            company: this.form.company,
            telegram: this.form.telegram,
            region: this.form.region,
            comment: this.form.comment
          },
          items: this.cartStore.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price
          }))
        };

        const res = await axios.post('/api/order', payload);
        this.leadId = res.data.leadId;
        this.totalAmount = res.data.total;
        
        // Clean cart state
        this.cartStore.clearCart();
        this.checkoutSuccess = true;
      } catch (err) {
        console.error(err);
        alert('So\'rovni yuborib bo\'lmadi. Iltimos, biz bilan bog\'laning.');
      } finally {
        this.submitting = false;
      }
    },
    viewProductById(id) {
      this.showWishlist = false;
      this.$router.push('/products');
    }
  }
};
</script>

<style scoped>
.empty-message {
  color: var(--color-text-secondary);
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  gap: 16px;
  align-items: center;
  position: relative;
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.cart-item-price {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 700;
  margin-bottom: 8px;
}

.cart-qty-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  width: max-content;
  overflow: hidden;
}

.qty-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-weight: 600;
}

.qty-val {
  padding: 0 12px;
  font-size: 13px;
}

.remove-item-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.remove-item-btn:hover {
  color: var(--color-accent);
}

.subtotal-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 20px;
}

.subtotal-price {
  color: var(--color-primary);
}

.checkout-btn {
  width: 100%;
  padding: 16px;
}

.wishlist-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wishlist-item {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.remove-fav-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  margin-left: 12px;
  font-size: 12px;
}
</style>
