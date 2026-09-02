from rest_framework import serializers

from .models import Category, Product, Order, OrderItem, ContactMessage, Wishlist, Review, CouponUsage, OrderTracking, ProductVariant, RecentlyViewed, CancellationOTP, Refund, Policy, PolicySection, ReturnRequest


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = ["id", "status", "message", "location", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "name", "variant_type", "price_override", "stock", "is_available"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discount_price = serializers.SerializerMethodField()
    was = serializers.DecimalField(
        source="was_price", max_digits=10, decimal_places=2, read_only=True
    )
    image = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "brand",
            "price",
            "was_price",
            "was",
            "discount_price",
            "off_percent",
            "description",
            "image",
            "tag",
            "is_deal",
            "is_featured",
            "claimed",
            "ends_in_hours",
            "stock",
            "variants",
        ]

    def get_image(self, obj):
        url = obj.image_url
        if not url:
            return ""
        # Return relative URL for /media/ paths so frontend proxy handles it
        if url.startswith("/"):
            return url
        return url

    def get_discount_price(self, obj):
        return obj.was_price


class ProductWriteSerializer(serializers.ModelSerializer):
    """Admin panel se product add/edit karne ke liye. Category naam se aati hai."""
    cat = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image_upload = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "cat", "price", "was_price", "off_percent",
            "description", "image", "image_upload", "tag", "is_deal", "is_featured",
            "claimed", "ends_in_hours", "stock",
        ]

    def create(self, validated_data):
        cat_name = validated_data.pop("cat", "Accessories")
        image_file = validated_data.pop("image_upload", None)
        category, _ = Category.objects.get_or_create(name=cat_name)
        product = Product.objects.create(category=category, **validated_data)
        if image_file:
            product.image_upload = image_file
            product.save(update_fields=["image_upload"])
        return product

    def update(self, instance, validated_data):
        cat_name = validated_data.pop("cat", None)
        image_file = validated_data.pop("image_upload", None)

        if cat_name:
            category, _ = Category.objects.get_or_create(name=cat_name)
            instance.category = category

        # Agar naya image file aaya to purana URL clear karo
        if image_file:
            instance.image_upload = image_file
            instance.image = ""  # URL clear karo — file priority lega

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_name", "quantity", "price", "image", "category"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.SerializerMethodField()
    user_id = serializers.PrimaryKeyRelatedField(source="user", read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_id",
            "date",
            "subtotal",
            "gst",
            "deal_savings",
            "coupon_discount",
            "total",
            "status",
            "payment_method",
            "customer",
            "items",
            "user_id",
            "total_items",
        ]

    def get_customer(self, obj):
        return {
            "name": obj.customer_name,
            "address": obj.customer_address,
            "phone": obj.customer_phone,
        }

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())


class OrderCreateItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    qty = serializers.IntegerField(min_value=1, default=1)
    image = serializers.CharField(required=False, allow_blank=True)
    cat = serializers.CharField(required=False, allow_blank=True)


class OrderCreateSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    order_id = serializers.CharField(required=False)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    gst = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    dealSavings = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    couponDiscount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField(default="Confirmed")
    paymentMethod = serializers.CharField()
    customer = serializers.DictField()
    items = OrderCreateItemSerializer(many=True)

    def create(self, validated_data):
        user = self.context["request"].user
        if not user.is_authenticated:
            user = None

        customer = validated_data["customer"]
        order_id = validated_data.get("order_id") or validated_data.get("id")
        if not order_id:
            import random
            order_id = f"ORD-{random.randint(1000, 9999)}"

        order = Order.objects.create(
            user=user,
            order_id=order_id,
            subtotal=validated_data["subtotal"],
            gst=validated_data.get("gst", 0),
            deal_savings=validated_data.get("dealSavings", 0),
            coupon_discount=validated_data.get("couponDiscount", 0),
            total=validated_data["total"],
            status=validated_data.get("status", "Confirmed"),
            payment_method=validated_data["paymentMethod"],
            customer_name=customer.get("name", ""),
            customer_address=customer.get("address", ""),
            customer_phone=customer.get("phone", ""),
        )

        for item_data in validated_data["items"]:
            product = None
            product_id = item_data.get("id")
            if product_id:
                product = Product.objects.filter(pk=product_id).first()
                # Stock ghatao jab order place ho
                if product and product.stock >= item_data.get("qty", 1):
                    product.stock -= item_data.get("qty", 1)
                    product.save(update_fields=["stock"])

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data["name"],
                quantity=item_data.get("qty", 1),
                price=item_data["price"],
                image=item_data.get("image", ""),
                category=item_data.get("cat", ""),
            )

        # Auto-create initial tracking step
        OrderTracking.objects.create(
            order=order,
            status="Confirmed",
            message="Your order has been placed successfully. We will process it soon.",
            location="FitTrack Pro Warehouse",
        )

        return order

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "product", "added_at"]
        read_only_fields = ["id", "added_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "user_name", "user_email", "rating",
            "title", "text", "product_name", "role",
            "created_at", "is_approved",
        ]
        read_only_fields = ["id", "user_name", "user_email", "created_at", "is_approved"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class CouponUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponUsage
        fields = ["id", "code", "email", "used_at"]
        read_only_fields = ["id", "used_at"]


# ─── FEATURE 5: RECENTLY VIEWED ───────────────────────

class RecentlyViewedSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = RecentlyViewed
        fields = ["id", "product", "viewed_at"]
        read_only_fields = ["id", "viewed_at"]


class CancellationOTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = CancellationOTP
        fields = ["id", "order", "otp_code", "email", "is_used", "created_at", "expires_at"]
        read_only_fields = ["id", "created_at"]


class RefundSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(source="order.order_id", read_only=True)

    class Meta:
        model = Refund
        fields = ["id", "order", "order_id", "amount", "payment_mode", "status", "reason", "refund_to", "created_at", "processed_at"]
        read_only_fields = ["id", "created_at", "processed_at"]


# ─── POLICY SERIALIZERS ───────────────────────────────

class PolicySectionSerializer(serializers.ModelSerializer):
    list_items_list = serializers.SerializerMethodField()

    class Meta:
        model = PolicySection
        fields = ["id", "icon", "title", "content", "list_items", "list_items_list", "order", "is_visible"]
        read_only_fields = ["id"]

    def get_list_items_list(self, obj):
        return obj.get_list_items()


class PolicySerializer(serializers.ModelSerializer):
    sections = PolicySectionSerializer(many=True, read_only=True)

    class Meta:
        model = Policy
        fields = ["id", "slug", "title", "subtitle", "last_updated", "sections"]
        read_only_fields = ["id", "last_updated"]


class PolicySectionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicySection
        fields = ["id", "icon", "title", "content", "list_items", "order", "is_visible"]
        read_only_fields = ["id"]


# ─── RETURN REQUEST SERIALIZERS ───────────────────────

class ReturnRequestSerializer(serializers.ModelSerializer):
    order_id_display = serializers.CharField(source="order.order_id", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            "id", "order", "order_id_display", "order_item_id", "product_name",
            "reason", "reason_detail", "return_amount", "status",
            "ran_number", "admin_notes", "created_at", "updated_at",
            "user_name", "user_email",
        ]
        read_only_fields = ["id", "ran_number", "created_at", "updated_at", "user_name", "user_email"]


class ReturnRequestCreateSerializer(serializers.Serializer):
    order_id = serializers.CharField()
    product_name = serializers.CharField()
    reason = serializers.ChoiceField(choices=ReturnRequest.REASON_CHOICES)
    reason_detail = serializers.CharField(required=False, allow_blank=True, default="")
    return_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
