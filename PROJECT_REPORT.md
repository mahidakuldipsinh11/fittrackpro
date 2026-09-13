# FitTrack Pro — Complete Project Report

*Report date: 13 Sep 2026*

## 1. Project Overview

**FitTrack Pro** is a full-stack **fitness e-commerce web application** (gym equipment and supplements store) built with a **React (Vite)** frontend and a **Django (DRF)** backend. It includes a complete shopper experience — product catalog, cart, checkout with payments, orders, tracking, reviews, wishlist, coupons, AI-style chat support, and an admin panel.

Live URLs:

| Component | URL / Service |
|---|---|
| Frontend (production) | https://fittrackpro-sand.vercel.app (Vercel) |
| Backend API | https://fittrackpro-backend-vig5.onrender.com (Render) |
| PostgreSQL database | Render Postgres — `fittrack-db-v2` |
| GitHub repo | https://github.com/mahidakuldipsinh11/fittrackpro |
| Keep-awake | GitHub Actions workflow (pings backend every 5 min) |

---

## 2. Tech Stack

### Frontend (`mk/mk/Fittrack`)
- **React 18** + **Vite 8** (build tool)
- **react-router-dom 7** (SPA routing)
- **Axios** (API client with JWT interceptor + retry)
- **Lucide-react** icons, **Recharts** (admin charts), **jsPDF** (invoice), **QRCode**
- **Tailwind/postcss** present; main styling is custom CSS per page

### Backend (`mk/mk/Fittrack/django_backend`)
- **Django 5** + **Django REST Framework**
- **djangorestframework-simplejwt** (JWT auth)
- **django-cors-headers**, **whitenoise** (static serving), **gunicorn**
- **psycopg2-binary** + **dj-database-url** (PostgreSQL via env `DATABASE_URL`)
- **Razorpay** (payment gateway), **Pillow** (images)

### Deployment
- **Vercel** — builds frontend (`npm run build`), rewrites all routes to `index.html`. Build sets `VITE_API_URL=https://fittrackpro-backend-vig5.onrender.com/api`.
- **Render** — `render.yaml`: runs `migrate` → `collectstatic` → `gunicorn fittrack.wsgi`.
- **GitHub Actions** — `keep-awake.yml` prevents Render free-tier sleep.

---

## 3. Repository Layout

```
D:\Mk_demo\
├── mk/mk/Fittrack/            # Frontend (React/Vite)
│   ├── src/
│   │   ├── pages/             # Shop, Home, Deals, Cart, Checkout, Profile, Reviews, About, OrderTracking, Contact, Login, Signup, Admin (Fittrackadmin), ProductDetail, policies...
│   │   ├── context/           # Auth, Cart, Coupon, Product, Toast, Wishlist, Chatbot, Navbar, Footer, CartDrawer
│   │   ├── api/client.js      # Axios base config
│   │   └── data/              # products.json (fallback), productsData.js
│   └── django_backend/        # Django backend (also served locally from here)
│       ├── store/             # Products, Categories, Orders, Reviews, Wishlist, Coupons, Payments, Tracking, Refunds, Policies
│       ├── accounts/          # Custom User (email login), auth views
│       ├── product_images/    # 50 product images (slug names)
│       └── fittrack/          # settings.py, urls.py, wsgi
├── product_images/            # (emptied — duplicates removed; canonical copy in django_backend)
├── render.yaml                # Render deploy config
├── vercel.json                # Vercel build config
├── requirements.txt           # Python deps
└── .github/workflows/keep-awake.yml
```

---

## 4. Key Features

### Shopper features
- **Product catalog** — 50 products in 13 categories, filters (category/rating/search), sorting, deals.
- **Product detail page** — image, price, discount badge, ratings summary, related equipment, customer reviews.
- **Cart** — add/remove/quantity, saved in localStorage + context.
- **Checkout** — address form, order flow, **Razorpay** payment integration, invoice download (jsPDF).
- **Orders** — order list, step-by-step **order tracking** (OrderTracking model), cancellation with **OTP verification**.
- **Wishlist** — per-user wishlist.
- **Coupons** — one-time coupon (WELCOME10) activation by email.
- **Reviews** — users submit reviews; **public GET** (all approved reviews visible with/without login), product-filtered, rating breakdown.
- **Recently viewed** — featured product tracking on home page.
- **Auth** — signup/login (email + password, JWT), profile page, admin login.

### Admin / Business features
- **FittrackAdmin** panel — dashboard with charts (Recharts), product/order/user management.
- **Emails** — welcome email, login notification, order confirmation (all sent in background threads to avoid blocking).
- **Chatbot** — customer support widget on the site.

### Other
- WhatsApp / contact form (emailjs-com).
- Responsive custom CSS themes (dark theme).

---

## 5. Database (PostgreSQL — `fittrack_db_edli`)

### apps: `accounts` (custom User)
- `User` — email login (case-insensitive), `name`, `is_staff`, manager with `create_user`/`create_superuser`.

### app: `store`
Main models: `Category`, `Product`, `ProductVariant`, `Order`, `OrderItem`, `Payment`, `CouponUsage`, `Wishlist`, `Review`, `OrderTracking`, `RecentlyViewed`, `CancellationOTP`, `Refund`, `ReturnRequest`, `Policy`, `PolicySection`, `ContactMessage`.

Current data (live DB):

| Entity | Count |
|---|---|
| Users | 3 (admin + 2 test) |
| Categories | 13 |
| Products | 50 |
| Product images | 50 (slug files in `django_backend/product_images/`) |
| Orders / Wishlists / Reviews | test/minimal |

Product model key fields: `name`, `category`, `price`, `was_price`, `off_percent`, `description`, `image` (URL path like `product_images/olympic-barbell-20kg.jpg`), `tag`, `is_deal`, `is_featured`, `claimmed` (claimed), `ends_in_hours`, `stock`, optional `image_upload`.

---

## 6. Main API Endpoints (`/api/...`)

| Method | Endpoint | Access |
|---|---|---|
| GET | `/products/` | Public (50 products, slug images) |
| GET | `/products/<id>/`, `/categories/`, `/brands/` | Public |
| POST | `/products/create/`, PATCH/DELETE `/products/<id>/` | Staff/admin |
| POST | `/auth/login/`, `/auth/register/`, GET `/auth/me/` | Public / token |
| GET | `/reviews/` | Public (approved) |
| POST | `/reviews/` | Authenticated |
| GET/POST | `/orders/...`, `/track/...`, `/cart/...`, `/wishlist/...` | Authenticated |
| POST | `/payments/...` (Razorpay) | Authenticated |
| POST | `/coupon/activate/`, `/coupon/validate/` | Public |

---

## 7. Deployment Details

### Vercel (frontend)
- Build: `cd mk/mk/Fittrack && npm install && VITE_API_URL=https://fittrackpro-backend-vig5.onrender.com/api npx vite build --base=/`
- Output: `mk/mk/Fittrack/dist`; rewrites to `index.html` (SPA).
- Auto-deploys on push to `main`.

### Render (backend)
- `render.yaml`: install requirements → `migrate` → `collectstatic` → `gunicorn`.
- **Persistent Postgres** (`DATABASE_URL` secret). Deploy does NOT auto-load fixtures — data was seeded via `seed_products.py`.
- Free tier sleeps after inactivity; **keep-awake workflow** pings every 5 min.

### Serving built frontend locally on Django
- Django (`127.0.0.1:8000`) also serves the built React app: `urls.py` maps `/assets/*` to `dist/assets`, SPA catch-all → `index.html`. Rebuilding `dist/` is required after frontend changes.

---

## 8. Recent Work / Fixes (this project session)

1. **Product images fixed site-wide.**
   - Root cause: Render DB had 50 products pointing to old numeric images (`/product_images/815_…`), while the frontend fallback used slug names — images didn't match.
   - Reseeded Render DB from `seed_products.py` (50 products, slug images, 13 categories), fixed `Ez-curl-bar.jpg` case bug for Linux (Render).
   - Deleted 200 numeric image files (815–1014) from repo; regenerated `products_fixture.json` + `products_fixture_neon.json`.
   - Verified: all 50 live API images return **HTTP 200**; deleted ones return **404**.
2. **Frontend/backend image wiring verified** — deployed Vercel bundle points to Render API; `resolveImageUrl` prefixes backend origin; sync'd `productsData.js` to slug images.
3. **Login fixed (16-char password cap)** — admin password `FitTrack@Admin123` (17 chars) could not be typed/submitted. Raised login limit to 128 chars in `Login.jsx` and rebuilt `dist/`.
4. **Test account passwords reset** — `fresh_render@test.com` / `render_v2@test.com` → `Test@1234` (verified HTTP 200 login).
5. **Keep-awake workflow + root duplicate product_images removed** — committed and pushed.

### Git state
- HEAD `main` = `18db0fc` (pushed to origin).
- Uncommitted local changes: `.env` (→ Render API), `productsData.js`, `Login.jsx`; untracked `.agents/`, `skills-lock.json`.

---

## 9. How to Run Locally

### Frontend (Vite dev)
```bash
cd mk/mk/Fittrack
npm install
npm run dev          # serves on http://localhost:5173
```
`.env` now points to the live Render API, so no local backend is required for the frontend to show real data/images.

### Django backend (optional, port 8000)
```bash
cd mk/mk/Fittrack/django_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000   # serves API + built React (dist)
```

### Production build (served by Django on :8000)
```bash
cd mk/mk/Fittrack && npm run build   # refreshes dist/
```

---

## 10. Known Notes / Considerations

- **Render free tier**: cold starts (~60 s); keep-awake mitigates but occasional first-load fallback may occur.
- **Review visibility**: GET is public; product pages filter reviews by `product_name` — reviews without a product name appear only on the Reviews page.
- **Register** is limited to 8–16 char passwords (backend rule); **login** accepts up to 128.
- Postgres free instance expires **12 Oct 2026** — plan migration to a renewal/larger tier.
- `product_images/` (repo root) is now empty of duplicate images; canonical folder is `django_backend/product_images/` (50 files).