import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('mobimax_cart')) || [],
    isOpen: false
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },
  actions: {
    openCart() {
      this.isOpen = true;
    },
    closeCart() {
      this.isOpen = false;
    },
    toggleCart() {
      this.isOpen = !this.isOpen;
    },
    addToCart(product, quantity = 1) {
      const existing = this.items.find(item => item.product === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.mainImage || '',
          slug: product.slug,
          quantity: quantity
        });
      }
      this.syncStorage();
      this.isOpen = true; // Automatically open cart drawer on item addition!
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.product === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.syncStorage();
      }
    },
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.product !== productId);
      this.syncStorage();
    },
    clearCart() {
      this.items = [];
      this.syncStorage();
    },
    syncStorage() {
      localStorage.setItem('mobimax_cart', JSON.stringify(this.items));
    }
  }
});
