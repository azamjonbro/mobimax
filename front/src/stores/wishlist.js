import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    productIds: JSON.parse(localStorage.getItem('mobimax_wishlist')) || []
  }),
  getters: {
    totalItems: (state) => state.productIds.length
  },
  actions: {
    toggleFavorite(productId) {
      if (this.productIds.includes(productId)) {
        this.productIds = this.productIds.filter(id => id !== productId);
      } else {
        this.productIds.push(productId);
      }
      this.syncStorage();
    },
    isFavorite(productId) {
      return this.productIds.includes(productId);
    },
    syncStorage() {
      localStorage.setItem('mobimax_wishlist', JSON.stringify(this.productIds));
    }
  }
});
