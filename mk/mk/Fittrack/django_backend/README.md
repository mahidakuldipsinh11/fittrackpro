# FitTrack Django Backend

REST API for the FitTrack Pro fitness equipment e-commerce frontend.

## Setup

```bash
# From project root (D:\mk)
.venv\Scripts\activate
cd Fittrack\django_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Server runs at **http://127.0.0.1:8000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| GET | `/api/products/` | List all products |
| GET | `/api/products/?category=Barbells` | Filter by category |
| GET | `/api/products/?search=barbell` | Search products |
| GET | `/api/products/<id>/` | Product detail |
| GET | `/api/deals/` | Deal products only |
| POST | `/api/auth/register/` | Register `{name, email, password}` |
| POST | `/api/auth/login/` | Login `{email, password}` |
| GET | `/api/auth/me/` | Current user (JWT required) |
| POST | `/api/orders/` | Create order |
| GET | `/api/orders/` | User orders (JWT required) |
| POST | `/api/contact/` | Contact form `{name, email, message}` |

## Demo Login

After running `seed_data`:

- Email: `test@fittrack.com`
- Password: `password123`

## Admin Panel

```bash
python manage.py createsuperuser
```

Open http://127.0.0.1:8000/admin/
