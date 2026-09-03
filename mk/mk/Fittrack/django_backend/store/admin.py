from django.contrib import admin
from django.utils.html import format_html

from .models import Category, ContactMessage, Order, OrderItem, Product, Review, CouponUsage


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["image_thumb", "name", "category", "price", "stock", "is_deal", "is_featured"]
    list_filter = ["category", "is_deal", "is_featured"]
    search_fields = ["name", "brand"]
    readonly_fields = ["image_preview"]
    list_editable = ["price", "stock", "is_deal", "is_featured"]

    def image_thumb(self, obj):
        url = obj.image_url
        if url:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px;" />', url)
        return "-"
    image_thumb.short_description = "Image"

    def image_preview(self, obj):
        url = obj.image_url
        if url:
            return format_html('<img src="{}" style="max-height:200px;border-radius:8px;" />', url)
        return "No image"
    image_preview.short_description = "Image Preview"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_id", "customer_name", "total", "status", "date"]
    list_filter = ["status", "date"]
    search_fields = ["order_id", "customer_name", "customer_phone"]
    inlines = [OrderItemInline]


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "created_at"]
    search_fields = ["name", "email"]


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ["code", "email", "user", "used_at"]
    search_fields = ["email", "code"]
    list_filter = ["code", "used_at"]
    list_per_page = 25
    readonly_fields = ["code", "email", "user", "used_at"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "rating", "title", "is_approved", "created_at"]
    list_filter = ["rating", "is_approved", "created_at"]
    search_fields = ["title", "text", "role"]
    list_editable = ["is_approved"]
    list_per_page = 25
