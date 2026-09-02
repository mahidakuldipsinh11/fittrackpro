from django.contrib import admin

from .models import Category, ContactMessage, Order, OrderItem, Product, Review, CouponUsage


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_deal", "is_featured"]
    list_filter = ["category", "is_deal", "is_featured"]
    search_fields = ["name"]


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
