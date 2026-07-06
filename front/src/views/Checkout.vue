<template>
  <div class="checkout-page">
    <h1 class="section-title">B2B kotirovka so'rash</h1>
    <p class="section-subtitle">Oson tizim. Ro'yxatdan o'tish shart emas. Tezkor ko'rib chiqish.</p>

    <!-- Confirmation Screen -->
    <div v-if="success" class="success-screen card">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2>So'rov muvaffaqiyatli yuborildi!</h2>
      <p class="success-intro">Sizning aloqa so'rovingiz ro'yxatdan o'tkazildi. Bizning muhandis-menejerlarimiz uskunalar konfiguratsiyasini ko'rib chiqishmoqda.</p>
      
      <div class="lead-details-box">
        <div class="detail-row">
          <span>So'rov ID:</span>
          <strong>{{ leadId }}</strong>
        </div>
        <div class="detail-row" v-if="totalAmount > 0">
          <span>Taxminiy jami narx:</span>
          <strong>${{ totalAmount.toFixed(2) }}</strong>
        </div>
      </div>

      <p class="success-notice">Ushbu buyurtma CRM navbatiga yo'naltirildi va mas'ul guruhga Telegram orqali xabar yuborildi. Tez orada muhandis siz bilan bog'lanadi.</p>
      <button class="btn btn-primary return-btn" @click="returnHome">Bosh sahifaga qaytish</button>
    </div>

    <!-- Active Form View -->
    <div v-else class="checkout-layout">
      <!-- Checkout Form -->
      <div class="checkout-form-container card">
        <h3>Aloqa va Yetkazib berish ma'lumotlari</h3>
        <p class="form-intro-desc">Onlayn to'lov talab qilinmaydi. Ushbu forma ulgurji narxlar va maxsus chegirmalarni tasdiqlash uchun xizmat qiladi.</p>

        <form @submit.prevent="submitLead">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Ism-sharifingiz *</label>
              <input type="text" v-model="form.name" class="form-input" placeholder="Alex Mercer" required />
            </div>

            <div class="form-group">
              <label class="form-label">Telefon raqamingiz *</label>
              <input type="tel" v-model="form.phone" class="form-input" placeholder="+998 (90) 123-4567" required />
            </div>

            <div class="form-group">
              <label class="form-label">Kompaniya yoki tashkilot nomi</label>
              <input type="text" v-model="form.company" class="form-input" placeholder="Apex Logistics LLC" />
            </div>

            <div class="form-group">
              <label class="form-label">Telegram username</label>
              <input type="text" v-model="form.telegram" class="form-input" placeholder="@alex_mercer" />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Viloyat / Obyekt joylashgan hudud *</label>
              <input type="text" v-model="form.region" class="form-input" placeholder="Tashkent Region / Okhangaron construction zone" required />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Izoh va chastota bo'yicha maxsus talablar</label>
              <textarea v-model="form.comment" class="form-input" rows="4" placeholder="Qurilmani dasturlash chastotalari, qo'shimcha naushnik yoki zaryadlash moslamalari bo'yicha talablarni yozishingiz mumkin..."></textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-accent submit-lead-btn" :disabled="submitting || cartStore.items.length === 0">
            {{ submitting ? 'So\'rov yuborilmoqda...' : 'So\'rovni yuborish' }}
          </button>
        </form>
      </div>

      <!-- Order Review Sidebar -->
      <div class="order-review-container">
        <div class="card">
          <h3>Ko'rib chiqilayotgan mahsulotlar</h3>
          
          <div v-if="cartStore.items.length === 0" class="empty-cart-review">
            Savatingiz bo'sh. Kotirovka so'rash uchun mahsulotlarni ko'rib chiqing.
            <router-link to="/products" class="btn btn-secondary browse-btn">Katalogni ko'rish</router-link>
          </div>
          
          <div v-else class="review-items-list">
            <div v-for="item in cartStore.items" :key="item.product" class="review-item">
              <img :src="item.image ? item.image : '/uploads/walkie_talkie_luxury.png'" alt="" class="review-item-img" />
              <div class="review-item-info">
                <h4>{{ item.name }}</h4>
                <span class="review-item-sku">SKU: {{ item.sku }}</span>
                <div class="qty-price-row">
                  <span class="review-qty">Soni: {{ item.quantity }}</span>
                  <span class="review-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="review-totals">
              <div class="total-row">
                <span>Mahsulotlar soni</span>
                <span>{{ cartStore.totalItems }} dona</span>
              </div>
              <div class="total-row main-total">
                <span>Taxminiy qiymati</span>
                <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useCartStore } from '../stores/cart';

export default {
  name: 'Checkout',
  data() {
    return {
      submitting: false,
      success: false,
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
    }
  },
  methods: {
    async submitLead() {
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
        this.success = true;
      } catch (err) {
        console.error(err);
        alert('So\'rovni yuborib bo\'lmadi. Iltimos, biz bilan to\'g\'ridan-to\'g\'ri bog\'laning.');
      } finally {
        this.submitting = false;
      }
    },
    returnHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  margin-top: 32px;
}

@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .order-review-container {
    order: -1;
  }
}

.form-intro-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 576px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: span 2;
}

@media (max-width: 576px) {
  .full-width {
    grid-column: span 1;
  }
}

.submit-lead-btn {
  width: 100%;
  padding: 16px;
}

.submit-lead-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Review details */
.empty-cart-review {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
}

.browse-btn {
  width: 100%;
  margin-top: 16px;
}

.review-items-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.review-item {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.review-item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.review-item-info {
  flex: 1;
}

.review-item-info h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.review-item-sku {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.qty-price-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 13px;
}

.review-price {
  font-weight: 700;
  color: var(--color-primary);
}

.review-totals {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.main-total {
  font-weight: 800;
  font-size: 18px;
  color: var(--color-primary);
  margin-top: 12px;
}

/* Success page */
.success-screen {
  text-align: center;
  max-width: 600px;
  margin: 60px auto;
  padding: 60px 40px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: rgba(7, 27, 134, 0.05);
  color: var(--color-primary);
  border-radius: 50%;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-screen h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.success-intro {
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.lead-details-box {
  background: var(--color-bg);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 32px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 15px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.success-notice {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 40px;
}

.return-btn {
  width: 100%;
}
</style>
