import json
from pathlib import Path

from django.core.management.base import BaseCommand

from accounts.models import User
from store.models import Category, Product


class Command(BaseCommand):
    help = "Load FitTrack products and demo user from db.json"

    def handle(self, *args, **options):
        db_path = Path(__file__).resolve().parents[4] / "backend" / "data" / "db.json"
        if not db_path.exists():
            self.stderr.write(self.style.ERROR(f"db.json not found at {db_path}"))
            return

        with open(db_path, encoding="utf-8") as f:
            data = json.load(f)

        for user_data in data.get("users", []):
            email = user_data["email"]
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"User already exists: {email}")
                continue

            user = User.objects.create_user(
                email=email,
                name=user_data.get("name", "User"),
                password="password123",
            )
            self.stdout.write(self.style.SUCCESS(f"Created user: {email} (password: password123)"))

        for product_data in data.get("products", []):
            category, _ = Category.objects.get_or_create(name=product_data["cat"])
            tag = product_data.get("tag")
            Product.objects.update_or_create(
                id=product_data["id"],
                defaults={
                    "name": product_data["name"],
                    "category": category,
                    "price": product_data["price"],
                    "was_price": product_data.get("was"),
                    "off_percent": product_data.get("off", 0),
                    "description": product_data.get("description", ""),
                    "image": product_data["image"],
                    "tag": tag,
                    "is_deal": bool(product_data.get("is_deal", 0)),
                    "is_featured": bool(tag),
                    "claimed": product_data.get("claimed", 0),
                    "ends_in_hours": product_data.get("ends_in_hours", 48),
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {Product.objects.count()} products and {Category.objects.count()} categories."
            )
        )
