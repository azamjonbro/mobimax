# MobiMax

A full-stack accessories marketplace project with:
- `backend/`: Express.js API and MongoDB data layer
- `front/`: Vue 3 storefront for customers
- `adminpanel/`: Vue 3 admin dashboard for managing products, orders, categories, brands, banners, and settings

## Project structure

- `backend/`
  - `server.js` - main Express server
  - `routes/` - REST routes for public and admin features
  - `models/` - Mongoose schemas for products, categories, orders, users, analytics, settings, logs, and visits
  - `middleware/` - authentication and file upload handling
  - `crm/` - adapter integrations for CRM and notifications
  - `scripts/seed.js` - initial database seed helper
- `front/`
  - Vue 3 storefront
  - Product list, product detail, checkout, and cart/wishlist stores
- `adminpanel/`
  - Vue 3 admin dashboard
  - Pages for login, dashboard, products, orders, categories, brands, banners, logs, and settings

## Tech stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Axios
- Frontend: Vue 3, Vite, Vue Router, Pinia
- Admin panel: Vue 3, Vite, Vue Router, Pinia, TinyMCE editor

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with values such as:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

or for production:

```bash
npm start
```

### 2. Frontend store

```bash
cd front
npm install
npm run dev
```

### 3. Admin panel

```bash
cd adminpanel
npm install
npm run dev
```

## Development notes

- `backend/` serves the API and handles auth, uploads, and CRM adapters.
- `front/` is the customer-facing storefront.
- `adminpanel/` is the management interface for catalog and order administration.
- Each front-end app is built with Vite and can be previewed using `npm run preview` after build.

## Useful scripts

- `backend`: `npm run dev` (development), `npm start` (production), `npm run seed` (seed database)
- `front`: `npm run dev`, `npm run build`, `npm run preview`
- `adminpanel`: `npm run dev`, `npm run build`, `npm run preview`

## Notes

- Ensure MongoDB is running and reachable by the backend.
- Configure CORS or proxy settings if you run frontend and backend on different hosts/ports.
- Use the admin panel to manage products, categories, orders, banners, brands, logs, and settings.

