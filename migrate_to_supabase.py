"""
Migrate data from MySQL (local) to Supabase PostgreSQL
Run: python migrate_to_supabase.py
"""
import os
import sys
import django
import sqlite3

# Setup Django with Supabase DB
os.environ['DJANGO_SETTINGS_MODULE'] = 'fittrack.settings'
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'mk', 'mk', 'Fittrack', 'django_backend'))

# Load .env with Supabase DATABASE_URL
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'mk', 'mk', 'Fittrack', 'django_backend', '.env'))

django.setup()

from store.models import Category, Product
from accounts.models import User

def migrate_data():
    print("=== Migrating to Supabase ===")
    
    # Read from local SQLite
    sqlite_path = os.path.join(os.path.dirname(__file__), 'mk', 'mk', 'Fittrack', 'django_backend', 'db.sqlite3')
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Migrate Categories
    cursor.execute("SELECT id, name FROM store_category")
    cat_rows = cursor.fetchall()
    cat_map = {}
    for cat in cat_rows:
        obj, created = Category.objects.get_or_create(name=cat['name'])
        cat_map[cat['id']] = obj
    print(f"Categories: {len(cat_rows)} source -> {Category.objects.count()} in Supabase")
    
    # Migrate Products (bulk)
    cursor.execute("SELECT * FROM store_product")
    prod_rows = cursor.fetchall()
    count = 0
    for p in prod_rows:
        cat = cat_map.get(p['category_id'])
        if not cat:
            continue
        _, created = Product.objects.get_or_create(
            name=p['name'],
            defaults={
                'category': cat,
                'price': p['price'],
                'was_price': p['was_price'] if p['was_price'] else None,
                'off_percent': p['off_percent'] if p['off_percent'] else 0,
                'description': p['description'] or '',
                'image': p['image'] or '',
                'tag': p['tag'] if p['tag'] else None,
                'is_deal': bool(p['is_deal']),
                'is_featured': bool(p['is_featured']),
                'stock': p['stock'] if p['stock'] else 0,
                'brand': p['brand'] if p['brand'] else 'FitTrack Pro',
                'claimed': p['claimed'] if p['claimed'] else 0,
                'ends_in_hours': p['ends_in_hours'] if p['ends_in_hours'] else 48,
            }
        )
        count += 1
        if count % 50 == 0:
            print(f"  ...{count}/{len(prod_rows)} products migrated")
    print(f"Products: {count} source -> {Product.objects.count()} in Supabase")
    
    # Migrate Users
    cursor.execute("SELECT * FROM accounts_user")
    user_rows = cursor.fetchall()
    user_count = 0
    for u in user_rows:
        if not User.objects.filter(email=u['email']).exists():
            User.objects.create(
                email=u['email'],
                username=u['username'],
                first_name=u['first_name'] or '',
                last_name=u['last_name'] or '',
                phone=u['phone'] or '',
                is_staff=bool(u['is_staff']),
                is_superuser=bool(u['is_superuser']),
                password=u['password'],
            )
            user_count += 1
    print(f"Users: {user_count} created -> {User.objects.count()} total in Supabase")
    
    conn.close()
    print("\n=== Migration Complete! ===")

if __name__ == "__main__":
    migrate_data()
