"""
Build a fresh SQLite database for Vercel deployment.
Run: python build_sqlite_db.py
"""
import os
import sys
import sqlite3
import json

BASE_DIR = os.path.join(os.path.dirname(__file__), "mk", "mk", "Fittrack", "django_backend")
DB_PATH = os.path.join(BASE_DIR, "db.sqlite3")
FIXTURE_PATH = os.path.join(BASE_DIR, "products_fixture.json")

# Remove old
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"Deleted old {DB_PATH}")

# Read fixture
with open(FIXTURE_PATH) as f:
    fixture = json.load(f)

# Separate by model
categories = [item for item in fixture if item["model"] == "store.category"]
products = [item for item in fixture if item["model"] == "store.product"]
print(f"Fixture: {len(categories)} categories, {len(products)} products")

# Create SQLite DB
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Create Django tables (minimal schema matching the models)
c.executescript("""
-- Django auth tables
CREATE TABLE IF NOT EXISTS django_content_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL,
    codename VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_group (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS django_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied DATETIME NOT NULL
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME,
    is_superuser BOOLEAN NOT NULL DEFAULT 0,
    email VARCHAR(254) UNIQUE,
    name VARCHAR(150),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_staff BOOLEAN NOT NULL DEFAULT 0,
    date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts_user_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts_user_user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL
);

-- Store tables
CREATE TABLE IF NOT EXISTS store_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS store_product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    was_price DECIMAL(10,2),
    off_percent SMALLINT NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    image VARCHAR(500) NOT NULL DEFAULT '',
    image_upload VARCHAR(100),
    brand VARCHAR(100) NOT NULL DEFAULT 'FitTrack',
    tag VARCHAR(50),
    is_deal BOOLEAN NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT 0,
    claimed SMALLINT NOT NULL DEFAULT 0,
    ends_in_hours INTEGER NOT NULL DEFAULT 48,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES store_category(id)
);

CREATE TABLE IF NOT EXISTS store_order (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    coupon_code VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id)
);

CREATE TABLE IF NOT EXISTS store_orderitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES store_order(id),
    FOREIGN KEY (product_id) REFERENCES store_product(id)
);

CREATE TABLE IF NOT EXISTS store_wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id),
    FOREIGN KEY (product_id) REFERENCES store_product(id)
);

CREATE TABLE IF NOT EXISTS store_contactmessage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_couponusage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    code VARCHAR(50) NOT NULL,
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id)
);

CREATE TABLE IF NOT EXISTS store_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating SMALLINT NOT NULL,
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id),
    FOREIGN KEY (product_id) REFERENCES store_product(id)
);

CREATE TABLE IF NOT EXISTS store_ordertracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES store_order(id)
);

CREATE TABLE IF NOT EXISTS store_cancellationotp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES store_order(id)
);

CREATE TABLE IF NOT EXISTS store_refund (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES store_order(id)
);

CREATE TABLE IF NOT EXISTS store_productvariant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES store_product(id)
);

CREATE TABLE IF NOT EXISTS store_recentlyviewed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id),
    FOREIGN KEY (product_id) REFERENCES store_product(id)
);

CREATE TABLE IF NOT EXISTS store_policy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS store_policysection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (policy_id) REFERENCES store_policy(id)
);

-- Admin log
CREATE TABLE IF NOT EXISTS django_admin_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_time DATETIME NOT NULL,
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL,
    change_message TEXT NOT NULL,
    content_type_id INTEGER,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (content_type_id) REFERENCES django_content_type(id),
    FOREIGN KEY (user_id) REFERENCES accounts_user(id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date DATETIME NOT NULL
);
""")

print("Tables created")

# Insert categories
for cat in categories:
    c.execute("INSERT OR REPLACE INTO store_category (id, name) VALUES (?, ?)",
              (cat["pk"], cat["fields"]["name"]))
print(f"Inserted {len(categories)} categories")

# Insert products
for prod in products:
    fields = prod["fields"]
    c.execute("""INSERT OR REPLACE INTO store_product 
        (id, name, category_id, price, was_price, off_percent, description, image, 
         brand, tag, is_deal, is_featured, claimed, ends_in_hours, stock, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (prod["pk"], fields["name"], fields["category"],
         fields["price"], fields.get("was_price"), fields.get("off_percent", 0),
         fields.get("description", ""), fields.get("image", ""),
         fields.get("brand", "FitTrack"), fields.get("tag"),
         fields.get("is_deal", False), fields.get("is_featured", False),
         fields.get("claimed", 0), fields.get("ends_in_hours", 48),
         fields.get("stock", 0), "2026-01-01 00:00:00"))
print(f"Inserted {len(products)} products")

# Create superuser
import hashlib
import base64
import secrets
salt = secrets.token_hex(16)
password_hash = hashlib.pbkdf2_hmac('sha256', b'admin123', salt.encode(), 100000)
password_encoded = f"pbkdf2_sha256$100000${salt}${base64.b64encode(password_hash).decode()}"
c.execute("""INSERT OR REPLACE INTO accounts_user 
    (id, email, name, password, is_active, is_staff, is_superuser)
    VALUES (1, 'admin@fittrack.com', 'Admin', ?, 1, 1, 1)""", (password_encoded,))
print("Created admin user: admin@fittrack.com / admin123")

conn.commit()
conn.close()

size = os.path.getsize(DB_PATH)
print(f"\n✅ SQLite DB created: {DB_PATH}")
print(f"   Size: {size:,} bytes ({size/1024:.1f} KB)")
print(f"   Categories: {len(categories)}")
print(f"   Products: {len(products)}")
