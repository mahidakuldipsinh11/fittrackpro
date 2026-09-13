# FitTrack Pro — Project Report

---

## Cover Page

| Field | Details |
|---|---|
| **Project Title** | FitTrack Pro — Premium Fitness Equipment E-Commerce Platform |
| **Technology Stack** | React.js · Django REST Framework · PostgreSQL |
| **Deployment** | Vercel (Frontend) · Render (Backend) |
| **Live URL** | https://fittrackpro-sand.vercel.app |
| **GitHub Repository** | https://github.com/mahidakuldipsinh11/fittrackpro |
| **Report Date** | September 2026 |

---

## Table of Contents

1. Project Overview
2. Objectives
3. Technology Stack
4. System Architecture
5. Database Design
6. Frontend — Pages & Features
7. Backend — API Endpoints
8. Key Features
9. Security Implementation
10. Deployment & Hosting
11. Screenshots Description
12. Future Enhancements
13. Conclusion

---

## 1. Project Overview

**FitTrack Pro** is a fully functional, full-stack e-commerce web application for premium fitness equipment. The platform allows customers to browse gym products, add items to cart, apply coupon codes, place orders with Razorpay payment integration, track their orders, and manage their profile — all within a modern, responsive interface.

The project demonstrates a complete production-ready application built with industry-standard tools including a React.js SPA frontend, Django REST Framework backend, PostgreSQL cloud database, JWT authentication, email notifications, and CI/CD deployment via GitHub → Vercel + Render.

---

## 2. Objectives

- Build a complete e-commerce platform for fitness equipment
- Implement secure user authentication with email-based login and JWT tokens
- Provide product browsing with category filters, search, and sorting
- Enable cart management, coupon discounts, and Razorpay payment gateway
- Allow order placement, order tracking, and order cancellation with OTP verification
- Create an admin dashboard for product, order, and user management
- Deploy the full-stack application to production with real URLs
- Maintain a cloud PostgreSQL database (Supabase / Render PostgreSQL)

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.2.0 | UI Component Framework |
| Vite | 8.1.1 | Build Tool & Dev Server |
| React Router DOM | 7.18.1 | Client-side Routing |
| Axios | 1.19.0 | HTTP API Client |
| Recharts | 3.10.1 | Admin Analytics Charts |
| Lucide React | 1.31.0 | Icon Library |
| jsPDF | 4.2.1 | Invoice PDF Generation |
| html2canvas | — | Screenshot for PDF Invoice |
| Tailwind CSS | 3.4.0 | Utility CSS Framework |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Programming Language |
| Django | 5.0.6 | Web Framework |
| Django REST Framework | — | REST API Builder |
| Simple JWT | — | JWT Authentication |
| django-cors-headers | — | CORS Handling |
| dj-database-url | — | Database URL Parsing |
| Whitenoise | — | Static File Serving |
| psycopg2 | — | PostgreSQL Adapter |
| Pillow | — | Image Processing |

### Database
| Database | Usage |
|---|---|
| PostgreSQL (Render Cloud) | Production Database |
| PostgreSQL (Supabase) | Alternative Cloud DB |
| SQLite | Local Development |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend Hosting (Auto-deploy from GitHub) |
| Render | Backend Django Server Hosting |
| GitHub | Source Code Version Control & CI/CD |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USER BROWSER                     │
│          https://fittrackpro-sand.vercel.app        │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS Requests
                      ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL (Frontend CDN)                  │
│         React.js SPA — Vite Build Output            │
│   Routes: /, /shop, /cart, /checkout, /profile,    │
│           /deals, /about, /contact, /admin          │
└─────────────────────┬───────────────────────────────┘
                      │ API Calls (/api/...)
                      ▼
┌─────────────────────────────────────────────────────┐
│           RENDER (Django Backend Server)            │
│   https://fittrackpro-backend-uayc.onrender.com     │
│                                                     │
│   Django REST Framework                             │
│   ├── /api/products/         Product CRUD           │
│   ├── /api/orders/           Order Management       │
│   ├── /api/auth/             JWT Auth               │
│   ├── /api/deals/            Deal Products          │
│   ├── /api/wishlist/         Wishlist               │
│   ├── /api/reviews/          Product Reviews        │
│   ├── /api/coupon/           Coupon Validation      │
│   └── /api/categories/       Category List          │
└─────────────────────┬───────────────────────────────┘
                      │ SQL Queries
                      ▼
┌─────────────────────────────────────────────────────┐
│         PostgreSQL DATABASE (Render Cloud)          │
│   Tables: store_product, store_category,            │
│           store_order, store_orderitem,             │
│           accounts_user, store_wishlist,            │
│           store_review, store_couponusage           │
└─────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### Tables Overview

#### `store_product`
| Column | Type | Description |
|---|---|---|
| id | Integer PK | Auto-increment Primary Key |
| name | VARCHAR(200) | Product Name |
| category_id | FK | Foreign Key → store_category |
| price | Decimal | Selling Price (INR) |
| was_price | Decimal | Original Price (for discount display) |
| off_percent | Integer | Discount Percentage |
| description | Text | Product Description |
| image | URLField | Product Image Path |
| image_upload | ImageField | Uploaded Image File |
| tag | VARCHAR(50) | Badge Tag (BEST SELLER, HOT DEAL etc.) |
| is_deal | Boolean | Show in Deals section |
| is_featured | Boolean | Featured Product flag |
| claimed | Integer | Deal claimed percentage |
| ends_in_hours | Integer | Deal expiry hours |
| stock | Integer | Available stock count |
| created_at | DateTime | Record creation time |

#### `store_category`
| Column | Type | Description |
|---|---|---|
| id | Integer PK | Primary Key |
| name | VARCHAR(100) | Unique category name |

**Product Categories (14 active):**
- Weights, Racks, Cardio, Benches, Accessories
- Dumbbells, Kettlebells, Functional Training
- Storage, Machines, Gym Packages
- Yoga & Fitness, Gym Flooring

#### `store_order`
| Column | Type | Description |
|---|---|---|
| order_id | VARCHAR | Unique Order ID (FT-XXXX) |
| user_id | FK | Linked User |
| subtotal | Decimal | Pre-tax total |
| gst | Decimal | GST amount |
| total | Decimal | Final payable amount |
| status | VARCHAR | Order status |
| payment_method | VARCHAR | UPI / Card / Wallet etc. |
| customer_name | VARCHAR | Buyer name |
| customer_address | Text | Delivery address |
| customer_phone | VARCHAR | Phone number |
| created_at | DateTime | Order timestamp |

**Order Status Flow:**
`Confirmed → Processing → Shipped → Out for Delivery → Delivered`

#### `accounts_user` (Custom User Model)
| Column | Type | Description |
|---|---|---|
| email | EmailField UNIQUE | Login identifier (no username) |
| name | VARCHAR | Display name |
| is_staff | Boolean | Admin access |
| is_superuser | Boolean | Full admin access |
| date_joined | DateTime | Registration time |

#### Other Tables
- `store_wishlist` — User saved products
- `store_review` — Product star ratings and comments
- `store_couponusage` — Coupon redemption tracking
- `store_ordertracking` — Delivery milestone timestamps
- `store_productvariant` — Size/color variants
- `store_recentlyviewed` — User browsing history
- `store_cancellationotp` — OTP for order cancellation
- `store_policy` — Privacy, Return, Refund policies

---

## 6. Frontend — Pages & Features

### Pages (15 Total)

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Hero banner, featured products, deals section, testimonials |
| **Shop** | `/shop` | 50 products with category filter, search, sort, product modal |
| **Deals** | `/deals` | Special discounted products with countdown timer |
| **Cart** | `/cart` | Cart items, quantity management, coupon code, GST calculation |
| **Checkout** | `/checkout` | Address form, Razorpay payment gateway integration |
| **Profile** | `/profile` | User info, order history, wishlist, invoice download |
| **Order Tracking** | `/orders/:id/tracking` | Real-time order status with milestone timeline |
| **About** | `/about` | Company story, team, mission |
| **Contact** | `/contact` | Contact form with EmailJS integration |
| **Login** | `/login` | Email + password authentication |
| **Signup** | `/signup` | New user registration |
| **Admin Dashboard** | `/fittrackadmin` | Full admin panel for products, orders, users |
| **Reviews** | `/reviews` | Product reviews and ratings |
| **Product Detail** | `/product/:id` | Individual product page |
| **Policy Pages** | `/privacy`, `/return`, `/refund` | Legal policy pages |

### Key Frontend Components

#### Shop Page (`Shop.jsx`)
- 50 gym products displayed in responsive grid
- **Category Filter** — Weights, Racks, Cardio, Benches, Accessories, Dumbbells, Kettlebells, Functional Training, Storage, Machines, Gym Packages, Yoga & Fitness, Gym Flooring
- **Search Bar** — Real-time product name search
- **Rating Filter** — 3★, 4★, 5★ stars
- **Sort Options** — Featured / Price: Low to High / Price: High to Low
- **Product Card** — Image, category badge, price, discount %, wishlist button
- **Product Details Modal** — Full detail popup with Add to Cart, related products

#### Cart (`Cart.jsx`)
- Add / Remove / Update quantity
- Coupon code validation (one-time use)
- GST calculation (18%)
- Deal savings display
- Proceed to checkout button

#### Checkout (`Checkout.jsx`)
- Delivery address form
- Razorpay payment gateway integration
- Order confirmation email on success
- Order ID generation (FT-XXXXXX format)

#### Admin Dashboard (`Fittrackadmin.jsx`)
- Product management (Add / Edit / Delete)
- Order management with status updates
- User list management
- Sales analytics with Recharts bar/pie charts
- Promotional email sender
- Policy page editor

---

## 7. Backend — API Endpoints

### Authentication (`/api/auth/`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | New user registration |
| POST | `/api/auth/login/` | Email + password → JWT token |
| GET | `/api/auth/users/` | All users (admin only) |
| GET | `/api/auth/profile/` | Current user profile |

### Products (`/api/products/`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/` | List all 50 products |
| GET | `/api/products/?category=Cardio` | Filter by category |
| GET | `/api/products/?search=barbell` | Search products |
| GET | `/api/products/<id>/` | Single product detail |
| POST | `/api/products/create/` | Add product (admin) |
| PATCH | `/api/products/<id>/` | Update product (admin) |
| DELETE | `/api/products/<id>/` | Delete product (admin) |

### Orders (`/api/orders/`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders/` | User's order history |
| POST | `/api/orders/` | Place new order |
| GET | `/api/orders/<id>/tracking/` | Order tracking status |
| POST | `/api/orders/<id>/cancel/` | Cancel order |
| POST | `/api/orders/<id>/generate-otp/` | OTP for cancellation |

### Other Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/deals/` | Deal products only |
| `POST /api/deals/<id>/claim/` | Claim a deal |
| `GET /api/categories/` | All product categories |
| `GET /api/wishlist/` | User wishlist |
| `POST /api/wishlist/` | Add to wishlist |
| `DELETE /api/wishlist/<id>/remove/` | Remove from wishlist |
| `GET /api/reviews/` | Product reviews |
| `POST /api/reviews/` | Submit review |
| `POST /api/coupon/validate/` | Validate coupon code |
| `GET /api/search/` | Search suggestions |
| `GET /api/recently-viewed/` | Recently viewed products |

---

## 8. Key Features

### 1. JWT Authentication
- Email-based login (no username)
- JWT access + refresh token system
- Token stored in localStorage
- Protected routes on frontend
- Admin-only API endpoints secured

### 2. Product Management
- 50 curated fitness equipment products
- 14 categories with real product images
- Discount pricing with percentage display
- Stock management
- Deal/Featured product flags
- Product variants (size, color)

### 3. Shopping Cart & Coupon System
- Persistent cart using Context API
- Real-time quantity updates
- One-time coupon code validation
- GST (18%) automatic calculation
- Deal savings tracking

### 4. Razorpay Payment Integration
- Secure payment gateway
- Multiple payment modes: UPI, Card, Net Banking, Wallet
- Order confirmation on payment success
- Payment failure handling

### 5. Order Management System
- Auto-generated unique Order IDs
- 7-stage order status tracking
- Email notifications on order placed
- OTP-based order cancellation
- Return request system
- Downloadable PDF invoice using jsPDF

### 6. Admin Dashboard
- Full product CRUD operations
- Order status management
- User management
- Sales analytics charts (Recharts)
- Promotional email broadcaster
- Return & refund management

### 7. Email System
- Order confirmation emails
- Welcome email on registration
- Promotional email campaigns
- Cancellation notifications

### 8. Wishlist & Reviews
- Add/remove products from wishlist
- Persistent across sessions (DB-backed)
- Star rating system (1-5)
- Review text with user display name

### 9. Responsive Design
- Mobile-first CSS layout
- Works on phones, tablets, desktops
- Touch-friendly product cards
- Hamburger menu on mobile

---

## 9. Security Implementation

| Security Measure | Implementation |
|---|---|
| **Authentication** | JWT tokens with expiry |
| **Password Hashing** | Django's PBKDF2 SHA256 |
| **CORS Protection** | django-cors-headers with allowed origins |
| **Admin Access** | `IsAdminUser` permission on write endpoints |
| **Input Validation** | DRF serializer-level validation |
| **SSL/HTTPS** | Enforced on Vercel and Render |
| **Environment Variables** | `.env` file for secrets (not committed) |
| **CSRF Protection** | Django CSRF middleware |

---

## 10. Deployment & Hosting

### Deployment Architecture

```
GitHub (main branch)
      │
      ├──► Vercel (Auto-deploy on push)
      │         React build → CDN Distribution
      │         URL: fittrackpro-sand.vercel.app
      │
      └──► Render (Auto-deploy on push)
                Django server → Gunicorn
                URL: fittrackpro-backend-uayc.onrender.com
                PostgreSQL Database: fittrack_db_340o
```

### Build Configuration (`vercel.json`)
```json
{
  "buildCommand": "cd mk/mk/Fittrack && npm install && npx vite build",
  "outputDirectory": "mk/mk/Fittrack/dist",
  "cleanUrls": true,
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

### Environment Variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Django secret key |
| `VITE_API_URL` | Backend API base URL |
| `DEBUG` | Django debug mode |
| `ALLOWED_HOSTS` | Permitted hostnames |

---

## 11. Product Catalog (All 50 Products)

| # | Product Name | Category | Price (₹) |
|---|---|---|---|
| 1 | Pro Olympic Barbell 20kg | Weights | 8,999 |
| 2 | Rubber Bumper Plate Set 100kg | Weights | 24,999 |
| 3 | EZ Curl Bar | Weights | 3,999 |
| 4 | Cast Iron Plate Set 50kg | Weights | 6,999 |
| 5 | Trap Bar / Hex Bar | Weights | 10,999 |
| 6 | Olympic Curl Bar with Collars | Weights | 4,999 |
| 7 | Heavy Duty Power Rack | Racks | 44,999 |
| 8 | Half Rack with Pull-up Bar | Racks | 29,999 |
| 9 | Full Powerlifting Competition Rack | Racks | 69,999 |
| 10 | Commercial Treadmill T-9 | Cardio | 89,999 |
| 11 | Air Rowing Machine | Cardio | 44,999 |
| 12 | Spin Bike Studio Edition | Cardio | 32,999 |
| 13 | Commercial Elliptical Trainer | Cardio | 74,999 |
| 14 | Curved Manual Treadmill | Cardio | 69,999 |
| 15 | Spin Bike Home Edition | Cardio | 19,999 |
| 16 | Recumbent Exercise Bike | Cardio | 35,999 |
| 17 | Stair Climber Step Machine | Cardio | 59,999 |
| 18 | Adjustable FID Bench | Benches | 14,999 |
| 19 | Flat Utility Bench | Benches | 6,999 |
| 20 | Adjustable Weight Bench Pro | Benches | 17,999 |
| 21 | Preacher Curl Bench | Benches | 8,999 |
| 22 | Premium Cotton Wrist Wraps | Accessories | 999 |
| 23 | Resistance Band Set - 5 Levels | Accessories | 1,499 |
| 24 | Olympic Weightlifting Platform | Accessories | 34,999 |
| 25 | Skipping Rope with Counter | Accessories | 799 |
| 26 | Push-Up Board Training System | Accessories | 1,299 |
| 27 | Ab Roller Wheel with Knee Pad | Accessories | 899 |
| 28 | Pull-Up Bar Doorway Mount | Accessories | 1,999 |
| 29 | Adjustable Dumbbell Pair 20kg | Dumbbells | 8,999 |
| 30 | Neoprene Dumbbell Pair 2kg | Dumbbells | 999 |
| 31 | Kettlebell Set 4kg to 16kg | Kettlebells | 7,999 |
| 32 | Competition Kettlebell 24kg | Kettlebells | 3,499 |
| 33 | Yoga Mat 8mm Anti-Slip | Yoga & Fitness | 1,499 |
| 34 | Weighted Medicine Ball 8kg | Functional Training | 2,999 |
| 35 | Plyometric Jump Box Set | Functional Training | 6,999 |
| 36 | Battle Rope 40ft | Functional Training | 3,999 |
| 37 | Sled Push and Pull Trainer | Functional Training | 9,999 |
| 38 | Vertical Plate Storage Tree | Storage | 5,999 |
| 39 | Dumbbell Storage Rack 3 Tier | Storage | 8,999 |
| 40 | Rubber Gym Flooring Roll 10mm | Gym Flooring | 4,999 |
| 41 | Functional Cable Crossover Machine | Machines | 1,19,999 |
| 42 | Smith Machine with Lat Pulldown | Machines | 89,999 |
| 43 | Professional Leg Press Machine | Machines | 99,999 |
| 44 | Multi Station 8-User Gym | Machines | 2,99,999 |
| 45 | Seated Chest Press Machine | Machines | 79,999 |
| 46 | Lat Pulldown and Low Row | Machines | 69,999 |
| 47 | Seated Leg Extension Machine | Machines | 64,999 |
| 48 | Assisted Dip and Pull-Up Machine | Machines | 84,999 |
| 49 | Complete Commercial Gym Setup | Gym Packages | 5,99,999 |
| 50 | Luxury Home Gym Package | Gym Packages | 2,49,999 |

---

## 12. Future Enhancements

| Enhancement | Description |
|---|---|
| **Product Search Suggestions** | Auto-complete search with live API results |
| **Advanced Filters** | Price range slider, multi-select categories |
| **Product Comparison** | Side-by-side product comparison feature |
| **Loyalty Points** | Points system for repeat purchases |
| **Multi-language Support** | Hindi and regional language support |
| **Mobile App** | React Native version for iOS and Android |
| **Inventory Alerts** | Low-stock email alerts for admin |
| **Product Bundles** | Package deals with multiple products |
| **Social Login** | Google / Facebook OAuth integration |
| **Live Chat** | Customer support chat widget |

---

## 13. Conclusion

FitTrack Pro successfully demonstrates a complete, production-ready e-commerce web application built using modern full-stack technologies. The project covers:

- **Frontend:** React.js SPA with 15 pages, Context API state management, responsive design
- **Backend:** Django REST Framework with 25+ API endpoints, JWT authentication
- **Database:** PostgreSQL cloud database with 12+ tables, proper foreign key relations
- **Payments:** Razorpay integration for real payment processing
- **Deployment:** Live production URLs on Vercel and Render with GitHub CI/CD
- **Admin Panel:** Full product/order/user management dashboard

The application is live and accessible at **https://fittrackpro-sand.vercel.app** with all features fully functional including user registration, product browsing, cart management, payment processing, and order tracking.

---

*Report prepared for FitTrack Pro Project*
*Technology: React.js + Django REST Framework + PostgreSQL*
*Deployment: Vercel + Render | Live: fittrackpro-sand.vercel.app*
