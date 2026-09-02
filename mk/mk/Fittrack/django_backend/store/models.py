from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="products"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    was_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    off_percent = models.PositiveSmallIntegerField(default=0)
    description = models.TextField(blank=True)

    # Existing: seed data / external image URL
    image = models.URLField(max_length=500, blank=True)

    # New: allow uploading an actual image file from admin/frontend
    image_upload = models.ImageField(upload_to="products/", blank=True, null=True)

    brand = models.CharField(max_length=100, blank=True, default="FitTrack")
    tag = models.CharField(max_length=50, null=True, blank=True)
    is_deal = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    claimed = models.PositiveSmallIntegerField(default=0)
    ends_in_hours = models.PositiveIntegerField(default=48)
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def image_url(self):
        """Prefer uploaded file; fallback to external URL (for seed data)."""
        if self.image_upload:
            return self.image_upload.url
        return self.image


class Order(models.Model):
    STATUS_CHOICES = [
        ("Confirmed", "Confirmed"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
        ("Returned", "Returned"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    order_id = models.CharField(max_length=20, unique=True)
    date = models.DateField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    gst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deal_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Confirmed")
    payment_method = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=150)
    customer_address = models.TextField()
    customer_phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.customer_name


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, related_name="order_items"
    )
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500, blank=True)
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="wishlisted_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user} - {self.product}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.email}"


class CouponUsage(models.Model):
    """Track which user/email has used which coupon — one-time only."""
    code = models.CharField(max_length=30, default="WELCOME10")
    email = models.EmailField(unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coupon_usages",
    )
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-used_at"]

    def __str__(self):
        return f"{self.code} used by {self.email}"


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(default=5)  # 1-5 stars
    title = models.CharField(max_length=200, blank=True)
    text = models.TextField()
    product_name = models.CharField(max_length=200, blank=True)  # optional — which product
    role = models.CharField(max_length=150, blank=True)  # e.g. "Gym Owner, Mumbai"
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)  # admin can moderate

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.name} - {self.rating}⭐ - {self.text[:50]}"


# ═══════════════════════════════════════════════════════════════
# FEATURE 1: ORDER TRACKING (step-by-step status history)
# ═══════════════════════════════════════════════════════════════

class OrderTracking(models.Model):
    """Each row = one status update for an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="tracking")
    status = models.CharField(max_length=20)
    message = models.CharField(max_length=300, blank=True)
    location = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_id} -> {self.status}"


# ═══════════════════════════════════════════════════════════════
# ORDER CANCELLATION OTP
# ═══════════════════════════════════════════════════════════════

import random


class CancellationOTP(models.Model):
    """OTP for order cancellation — online payment orders ke liye."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="cancellation_otps")
    otp_code = models.CharField(max_length=6)
    email = models.EmailField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP {self.otp_code} for {self.order.order_id}"

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))


class Refund(models.Model):
    """Refund tracking — COD/UPI orders ke liye7-day return window."""
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Processed", "Processed"),
        ("Rejected", "Rejected"),
    ]
    PAYMENT_MODE_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("upi", "UPI"),
        ("online", "Online Payment"),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="refund")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    reason = models.TextField(blank=True)
    refund_to = models.CharField(max_length=200, blank=True, help_text="UPI ID or bank details for refund")
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Refund {self.amount} for {self.order.order_id} ({self.status})"


# ═══════════════════════════════════════════════════════════════
# FEATURE 4: PRODUCT VARIANTS (size / weight)
# ═══════════════════════════════════════════════════════════════

class ProductVariant(models.Model):
    """Size or weight variant for a product."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    name = models.CharField(max_length=100)           # e.g. "M", "XL", "20kg"
    variant_type = models.CharField(max_length=20, default="size")  # size / weight
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ["product", "name"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


# ═══════════════════════════════════════════════════════════════
# FEATURE 5: RECENTLY VIEWED PRODUCTS
# ═══════════════════════════════════════════════════════════════

class RecentlyViewed(models.Model):
    """Track which products a user (or session) has viewed."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="recently_viewed",
    )
    session_id = models.CharField(max_length=64, blank=True, db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="viewed_by")
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-viewed_at"]
        unique_together = []  # allow multiple views of same product (updates timestamp)

    def __str__(self):
        target = self.user or self.session_id
        return f"{target} viewed {self.product.name}"


# ═══════════════════════════════════════════════════════════════
# FEATURE 6: EDITABLE POLICIES (Return, Refund, Privacy, Disclaimer)
# ═══════════════════════════════════════════════════════════════

class Policy(models.Model):
    """Editable policy pages — admin/logged-in users can edit content."""
    SLUG_CHOICES = [
        ("return-policy", "Return Policy"),
        ("refund-policy", "Refund Policy"),
        ("privacy-policy", "Privacy Policy"),
        ("disclaimer", "Disclaimer"),
    ]

    slug = models.SlugField(unique=True, choices=SLUG_CHOICES, max_length=50)
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["slug"]

    def __str__(self):
        return self.title


class PolicySection(models.Model):
    """Individual section within a policy page."""
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name="sections")
    icon = models.CharField(max_length=10, default="📋")
    title = models.CharField(max_length=200)
    content = models.TextField(help_text="Main paragraph text for this section")
    list_items = models.TextField(
        blank=True,
        help_text="Bullet points, one per line"
    )
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.policy.title} — {self.title}"

    def get_list_items(self):
        """Return list_items as a Python list."""
        if not self.list_items:
            return []
        return [line.strip() for line in self.list_items.strip().split("\n") if line.strip()]


# ═══════════════════════════════════════════════════════════════
# FEATURE 7: RETURN & REFUND REQUESTS
# ═══════════════════════════════════════════════════════════════

class ReturnRequest(models.Model):
    """User return request — delivered orders ke liye."""
    STATUS_CHOICES = [
        ("Requested", "Requested"),
        ("Approved", "Approved"),
        ("Picked Up", "Picked Up"),
        ("Inspected", "Inspected"),
        ("Refund Initiated", "Refund Initiated"),
        ("Refund Completed", "Refund Completed"),
        ("Rejected", "Rejected"),
    ]
    REASON_CHOICES = [
        ("changed_mind", "Changed my mind"),
        ("better_price", "Found a better price"),
        ("wrong_item", "Received wrong item"),
        ("defective", "Item is defective/damaged"),
        ("not_as_described", "Not as described"),
        ("size_issue", "Size/fit issue"),
        ("other", "Other reason"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="return_requests")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="return_requests")
    order_item_id = models.PositiveIntegerField(null=True, blank=True, help_text="Specific order item id (optional)")
    product_name = models.CharField(max_length=200)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    reason_detail = models.TextField(blank=True, help_text="Additional details from user")
    return_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Requested")
    ran_number = models.CharField(max_length=20, blank=True, help_text="Return Authorization Number")
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Return {self.ran_number or 'Pending'} - {self.product_name} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.ran_number:
            import random
            self.ran_number = f"RAN-{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)
