"""
Export products from MySQL to a Django fixture JSON file,
then create a fresh SQLite database with all 200 products.
"""
import os
import sys
import json
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fittrack.settings")

# Use MySQL settings directly for export
import fittrack.settings as settings
settings.DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "fittrack_db",
        "USER": "root",
        "PASSWORD": "kuldip2612",
        "HOST": "127.0.0.1",
        "PORT": "3306",
        "OPTIONS": {"charset": "utf8mb4"},
    }
}
settings.DEBUG = False

django.setup()

from store.models import Product, Category, Brand
from accounts.models import User

print("=== Exporting from MySQL ===")

# Export categories
categories = list(Category.objects.all())
print(f"Categories: {len(categories)}")
cat_fixture = []
for c in categories:
    cat_fixture.append({
        "model": "store.category",
        "pk": c.pk,
        "fields": {
            "name": c.name,
            "slug": c.slug,
        }
    })

# Export brands
brands = list(Brand.objects.all())
print(f"Brands: {len(brands)}")
brand_fixture = []
for b in brands:
    brand_fixture.append({
        "model": "store.brand",
        "pk": b.pk,
        "fields": {
            "name": b.name,
            "slug": b.slug,
        }
    })

# Export products
products = list(Product.objects.select_related('category', 'brand').all())
print(f"Products: {len(products)}")
product_fixture = []
for p in products:
    product_fixture.append({
        "model": "store.product",
        "pk": p.pk,
        "fields": {
            "name": p.name,
            "slug": p.slug,
            "description": p.description or "",
            "price": str(p.price),
            "compare_price": str(p.compare_price) if p.compare_price else None,
            "image": p.image or "",
            "category": p.category_id,
            "brand": p.brand_id if p.brand_id else None,
            "stock": p.stock,
            "is_active": p.is_active,
            "is_deal": p.is_deal,
            "deal_discount": p.deal_discount,
            "deal_claimed": p.deal_claimed,
            "total_stock": p.total_stock,
            "rating": str(p.rating) if p.rating else "0",
            "num_reviews": p.num_reviews,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
    })

# Save fixture
fixture_path = os.path.join(os.path.dirname(__file__), "mk", "mk", "Fittrack", "django_backend", "products_fixture.json")
with open(fixture_path, "w") as f:
    json.dump(cat_fixture + brand_fixture + product_fixture, f, indent=2)

print(f"\nFixture saved: {fixture_path}")
print(f"Total items: {len(cat_fixture) + len(brand_fixture) + len(product_fixture)}")
