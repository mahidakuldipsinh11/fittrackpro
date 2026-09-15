#!/bin/sh
set -e

WORKDIR=/app/mk/mk/Fittrack/django_backend
cd "$WORKDIR"

# ---- Wait for the database (only needed when DATABASE_URL is set) ----
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database at $DATABASE_URL ..."
  python - <<'PY'
import os, sys, time
import psycopg2
url = os.environ["DATABASE_URL"]
for i in range(60):
    try:
        psycopg2.connect(url).close()
        print("Database is ready.")
        sys.exit(0)
    except Exception:
        time.sleep(2)
print("Database not reachable after 120s. Aborting.")
sys.exit(1)
PY
fi

# ---- Apply migrations ----
echo "Running migrations..."
python manage.py migrate --noinput

# ---- Create admin superuser (safe: only if missing; creds never hardcoded) ----
echo "Ensuring admin user..."
python manage.py shell -c "
import os, django, secrets, string
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fittrack.settings')
django.setup()
from django.contrib.auth import get_user_model
U = get_user_model()
email = os.environ.get('ADMIN_EMAIL', 'admin@fittrack.com')
name = os.environ.get('ADMIN_NAME', 'Admin')
pw = os.environ.get('ADMIN_PASSWORD', '') or ''.join(secrets.choice(string.ascii_letters + string.digits + '#!@') for _ in range(16))
if U.objects.filter(email=email).exists():
    print('Admin already exists, skipping')
else:
    U.objects.create_superuser(email=email, name=name, password=pw)
    print('=== NEW SUPERUSER CREATED (save this now, shown only once) ===')
    print('Email   :', email)
    print('Password:', pw if not os.environ.get('ADMIN_PASSWORD') else '(set via ADMIN_PASSWORD env)')
    print('=============================================================')
"

# ---- Seed 50 products only on first boot (never reset existing data) ----
echo "Seeding products if empty..."
python manage.py shell -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fittrack.settings')
django.setup()
from store.models import Product
if Product.objects.count() == 0:
    import runpy
    runpy.run_path('seed_products.py', run_name='__main__')
    print('Seeded products from seed_products.py')
else:
    print(f'Found {Product.objects.count()} products, skipping seed')
"

# ---- Collect static (copies dist assets for WhiteNoise) ----
echo "Collecting static files..."
python manage.py collectstatic --noinput

# ---- Start server ----
echo "Starting gunicorn on 0.0.0.0:\$PORT ..."
exec gunicorn fittrack.wsgi:application --bind 0.0.0.0:${PORT} --workers ${WEB_CONCURRENCY:-2} --timeout 120