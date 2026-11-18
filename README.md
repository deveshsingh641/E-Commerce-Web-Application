# 🛍️ AURA Store — Full-Stack E-Commerce Web Application

A full-stack, enterprise-grade e-commerce platform built with Node.js, Express, MongoDB, and React (Vite & Tailwind CSS). Engineered for reliability, server-enforced pricing, resilient order lifecycles, and a responsive shopping experience.

---

## 📋 Key Architecture & Enhancements

### Frontend (React 18 + Vite + Tailwind CSS)
- 🎨 **Modern Glassmorphic Dark UI**: Custom Tailwind theme with responsive drawer, modals, and toasts.
- 🛒 **Persistent Shopping Cart & Wishlist**: Real-time stock-aware cart with promo code engine (`SAVE20`, `WELCOME10`, `FREESHIP`), plus a slide-over Wishlist drawer with one-click "Move to Bag" functionality.
- 🔍 **Debounced Search & Multi-Faceted Filters**: Instant keyword search debounced at 300ms, category tabs, price range slider, sort filters, and "In Stock Only" toggle.
- 📦 **Order Tracking, Filtering & Printable Invoices**: Visual stage-by-stage timeline tracking, status filters (In Transit, Delivered, Cancelled), order search, a 7-day return guarantee workflow, and a dedicated official printable invoice modal.
- 🛡️ **Role-Based Views**: Dedicated administrator dashboard with live inventory alerts, order status management, and analytics.
- ♿ **WCAG Accessibility**: Semantic elements, `aria-label` attributes on icon-only actions, and screen reader announcements.

### Backend (Node.js + Express + MongoDB / Mongoose)
- 🔐 **JWT Authentication & RBAC**: Secure JSON Web Token authentication with role-based authorization (User / Admin) and privilege escalation prevention.
- ⏱️ **Rate Limiting & Security Hardening**: Sliding-window rate limiter protecting auth endpoints from brute-force attacks (`X-RateLimit-*`), alongside OWASP-recommended HTTP security headers.
- ⚡ **In-Memory TTL Caching**: High-throughput caching for catalog queries (`X-Cache: HIT/MISS`) with automated pattern invalidation upon product writes.
- 🛡️ **Server-Side Price & Stock Verification**: Prevents client-side price manipulation by strictly re-verifying product prices, promotional discounts, and available stock against the database before order placement.
- ⚡ **Optimized MongoDB Aggregation**: Real-time revenue and dashboard statistics computed via database aggregation pipelines (excluding cancelled and returned orders).
- 🛡️ **Injection & ReDoS Protection**: Sanitized regular expressions for product search queries to prevent regular expression denial of service (ReDoS).
- 🗄️ **Resilient Error Classification**: Centralized middleware translating Mongoose `ValidationError`, `CastError`, and duplicate key conflicts (`11000`) into clean, structured JSON errors.
- 🧪 **Automated Test Suite**: Integrated unit and regression tests running natively with `node:test`.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0 or higher recommended)
- MongoDB instance (local or MongoDB Atlas connection string)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deveshsingh641/E-Commerce-Web-Application.git
   cd E-Commerce-Web-Application
   ```

2. **Install root and workspace dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Configure Environment Variables (`backend/.env`):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db
   JWT_SECRET=your_secure_jwt_secret_key_here
   ADMIN_INVITE_KEY=AURA_ADMIN_SECRET_KEY
   NODE_ENV=development
   ```

---

## 💻 Running the Application

### Development Mode (Runs Frontend & Backend concurrently):
```bash
npm run dev
```

### Run Individually:
```bash
# Backend (http://localhost:5000)
npm run dev:backend

# Frontend (http://localhost:3000 / http://localhost:5173)
npm run dev:frontend
```

### Production Build:
```bash
npm run build
```

### Run Automated Tests:
```bash
npm test
```

---

## 📱 Evaluation & Demo Credentials

The platform provides 1-click evaluation buttons in the top navbar and auth page, as well as the following seed credentials:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `admin123` | Store access, Inventory edit/add/delete, Order status dispatch, Analytics |
| **Customer** | `user@demo.com` | `user123` | Browsing, Purchasing, Cart management, Order cancellation, 7-day returns |

---

## 🔌 REST API Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a customer account (or admin if valid `adminCode` is provided)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/profile` — Fetch authenticated profile (`Authorization: Bearer <token>`)
- `PUT /api/auth/profile` — Update account profile details

### Products (`/api/products`)
- `GET /api/products` — Retrieve products with optional `keyword`, `category`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, `limit`
- `GET /api/products/:id` — Retrieve product details
- `GET /api/products/meta/categories` — Get category counts
- `POST /api/products` — Create product (*Admin only*)
- `PUT /api/products/:id` — Update product (*Admin only*)
- `DELETE /api/products/:id` — Delete product (*Admin only*)
- `POST /api/products/:id/reviews` — Submit verified customer rating (1–5) and review (*Customer only*)

### Orders (`/api/orders`)
- `POST /api/orders` — Create verified order with server-side pricing & atomic inventory reserve (*Customer*)
- `GET /api/orders/myorders` — Retrieve active and historical orders for the logged-in user
- `GET /api/orders/:id` — Retrieve order details and stage timeline
- `GET /api/orders` — Retrieve all orders across the system (*Admin only*)
- `PUT /api/orders/:id/status` — Advance or modify fulfillment status (*Admin only*)
- `PUT /api/orders/:id/cancel` — Cancel unfulfilled order and restock inventory
- `PUT /api/orders/:id/return` — Request return under the 7-day guarantee policy for delivered orders

### Analytics & System (`/api/stats`, `/api/health`, `/api/seed`)
- `GET /api/stats/dashboard` — Live revenue, active orders, and low-stock alerts (*Admin only*)
- `GET /api/health` — System status and database connectivity check
- `POST /api/seed/reset` — Reset database with seed inventory (*Protected, Admin only*)

---

## 🏗️ Repository Layout

```
E-Commerce-Web-Application/
├── backend/
│   ├── config/            # Database connection & environment mapping
│   ├── controllers/       # Controller business logic & queries
│   ├── middleware/        # JWT auth, RBAC, parameter & regex validators
│   ├── models/            # Mongoose schemas (User, Product, Order)
│   ├── routes/            # Express router mounts
│   ├── data/              # Seed runner & initial catalog
│   ├── tests/             # Automated test suite (node:test)
│   └── server.js          # Express app entry & error middleware
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components (Navbar, CartDrawer, Cards, Modals)
│   │   ├── context/       # React Context (AuthContext, CartContext)
│   │   ├── pages/         # Catalog, ProductDetail, Checkout, Orders, Admin, Auth
│   │   ├── services/      # Fetch API client
│   │   ├── App.jsx        # Routing & root shell
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   └── vite.config.js
├── screenshots/           # Application screenshots
├── package.json           # Unified scripts (dev, build, test, seed)
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.
