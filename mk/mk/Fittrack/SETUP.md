# FitTrack Pro — Complete Setup Guide

Yeh guide `D:\mk` project ko run karne aur backend data MySQL mein save karne ke liye hai.

---

## Project Structure

```
D:\mk\
├── .venv\                    # Python virtual environment
└── Fittrack\
    ├── src\                  # React frontend (Vite)
    ├── package.json
    └── django_backend\       # Django REST API
        ├── manage.py
        ├── .env              # Database config (aap banayenge)
        ├── requirements.txt
        └── db.sqlite3        # SQLite (agar MySQL na ho)
```

---

## PART 1 — Software Install (Ek baar karna hai)

### 1. Python 3.11+ 
Already installed: `python --version`

### 2. Node.js 18+
Download: https://nodejs.org  
Check: `node --version` aur `npm --version`

### 3. MySQL Server
Download: https://dev.mysql.com/downloads/installer/  
Install karte waqt **root password** set karo aur yaad rakho.

MySQL install ke baad **MySQL Workbench** ya **Command Line** se database banao:

```sql
CREATE DATABASE fittrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## PART 2 — Python Backend Setup (MySQL)

### Step 1: Virtual environment activate karo

PowerShell mein:

```powershell
cd D:\mk
.\.venv\Scripts\Activate.ps1
```

Agar activation error aaye:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1
```

### Step 2: Backend dependencies install karo

```powershell
cd D:\mk\Fittrack\django_backend
pip install -r requirements.txt
```

### Step 3: `.env` file banao (MySQL config)

```powershell
copy .env.example .env
notepad .env
```

`.env` mein apna MySQL password likho:

```env
DB_ENGINE=mysql
DB_NAME=fittrack_db
DB_USER=root
DB_PASSWORD=APNA_MYSQL_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=3306
```

> **Note:** Agar MySQL nahi chahiye, `DB_ENGINE=sqlite` rakho — data `db.sqlite3` file mein save hoga.

### Step 4: MySQL tables create karo (migrate)

```powershell
python manage.py migrate
```

Yeh command MySQL mein yeh tables banayegi:
- `accounts_user` — users
- `store_category` — categories
- `store_product` — products
- `store_order` — orders
- `store_orderitem` — order items
- `store_contactmessage` — contact messages

### Step 5: Sample data load karo

```powershell
python manage.py seed_data
```

Yeh 12 products + demo user load karega:
- Email: `test@fittrack.com`
- Password: `password123`

### Step 6: (Optional) Admin panel ke liye superuser

```powershell
python manage.py createsuperuser
```

Admin: http://127.0.0.1:8000/admin/

### Step 7: Backend server start karo

```powershell
python manage.py runserver
```

Backend chalega: **http://127.0.0.1:8000**

Test karo browser mein:
- http://127.0.0.1:8000/api/health/
- http://127.0.0.1:8000/api/products/

---

## PART 3 — React Frontend Setup

**Naya terminal** kholo (backend wala terminal chalta rehne do):

```powershell
cd D:\mk\Fittrack
npm install
npm run dev
```

Frontend chalega: **http://localhost:5173**

Browser mein open karo — Shop page products API se load karega.

---

## PART 4 — Poora Project Run (Daily use)

Har baar 2 terminals chahiye:

| Terminal | Command | URL |
|----------|---------|-----|
| **Terminal 1 — Backend** | `cd D:\mk\Fittrack\django_backend` → `python manage.py runserver` | http://127.0.0.1:8000 |
| **Terminal 2 — Frontend** | `cd D:\mk\Fittrack` → `npm run dev` | http://localhost:5173 |

---

## MySQL mein Data Kahan Save Hota Hai?

| Data | MySQL Table |
|------|-------------|
| Users (signup/login) | `accounts_user` |
| Products | `store_product` |
| Categories | `store_category` |
| Orders | `store_order` |
| Order items | `store_orderitem` |
| Contact messages | `store_contactmessage` |

MySQL Workbench se dekh sakte ho:

```sql
USE fittrack_db;
SHOW TABLES;
SELECT * FROM store_product;
SELECT * FROM accounts_user;
```

---

## Common Problems & Fix

### MySQL connection error
- MySQL service running hai? (Services → MySQL80 → Start)
- `.env` mein password sahi hai?
- Database `fittrack_db` create hua hai?

```powershell
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;"
```

### `pip install PyMySQL` error
```powershell
pip install --upgrade pip
pip install PyMySQL python-dotenv
```

### Frontend products nahi dikh rahe
- Backend `http://127.0.0.1:8000` par chal raha hai?
- Browser console check karo (F12)

### Port already in use
```powershell
# Backend alag port par
python manage.py runserver 8001
```

---

## API Endpoints Summary

| Method | URL | Kaam |
|--------|-----|------|
| GET | `/api/products/` | Products list |
| GET | `/api/deals/` | Deal products |
| POST | `/api/auth/register/` | Sign up |
| POST | `/api/auth/login/` | Login |
| POST | `/api/orders/` | Order create |
| POST | `/api/contact/` | Contact form |

---

## Quick Copy-Paste (First time full setup)

```powershell
# 1. MySQL database (MySQL Workbench ya CLI mein)
# CREATE DATABASE fittrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. Backend
cd D:\mk
.\.venv\Scripts\Activate.ps1
cd Fittrack\django_backend
pip install -r requirements.txt
copy .env.example .env
# .env edit karo — DB_PASSWORD set karo
python manage.py migrate
python manage.py seed_data
python manage.py runserver

# 3. Frontend (naya terminal)
cd D:\mk\Fittrack
npm install
npm run dev
```

Done! Frontend: http://localhost:5173 | Backend: http://127.0.0.1:8000
