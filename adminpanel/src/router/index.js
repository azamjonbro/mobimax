import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Products from '../views/Products.vue';
import ProductEdit from '../views/ProductEdit.vue';
import Categories from '../views/Categories.vue';
import Brands from '../views/Brands.vue';
import Orders from '../views/Orders.vue';
import Banners from '../views/Banners.vue';
import Settings from '../views/Settings.vue';
import Logs from '../views/Logs.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { requiresAuth: true }
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: ProductEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/products/edit/:id',
    name: 'ProductEdit',
    component: ProductEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/brands',
    name: 'Brands',
    component: Brands,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/banners',
    name: 'Banners',
    component: Banners,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard checks for JWT presence in storage
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('mobimax_admin_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
