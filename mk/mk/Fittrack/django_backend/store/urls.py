from django.urls import path

from .views import (
    ContactMessageCreateView,
    DealListView,
    DealClaimView,
    HealthCheckView,
    OrderListCreateView,
    ProductDetailView,
    ProductListView,
    ProductCreateView,
    CategoryListView,
    BrandListView,
    AdminOrderListView,
    AdminOrderStatusUpdateView,
    WishlistListCreateView,
    WishlistDeleteView,
    OrderCancelView,
    ReviewListCreateView,
    CouponValidateView,
    CouponActivateView,
    OrderTrackingView,
    OrderTrackingUpdateView,
    SearchSuggestionsView,
    ProductVariantCreateView,
    RecentlyViewedView,
    OTPGenerateView,
    ReturnEligibilityView,
    PromotionalEmailView,
    SendWelcomeEmailView,
    PolicyListView,
    PolicyDetailView,
    PolicySectionUpdateView,
    ReturnRequestCreateView,
    ReturnRequestListView,
    ReturnRequestDetailView,
    AdminReturnListView,
    AdminReturnUpdateView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/create/", ProductCreateView.as_view(), name="product-create"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("deals/", DealListView.as_view(), name="deal-list"),
    path("deals/<int:pk>/claim/", DealClaimView.as_view(), name="deal-claim"),
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/orders/<int:pk>/status/", AdminOrderStatusUpdateView.as_view(), name="admin-order-status"),
   path("contact/", ContactMessageCreateView.as_view(), name="contact-create"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("brands/", BrandListView.as_view(), name="brand-list"),

    # Wishlist endpoints
    path("wishlist/", WishlistListCreateView.as_view(), name="wishlist-list-create"),
    path("wishlist/<int:product_id>/remove/", WishlistDeleteView.as_view(), name="wishlist-remove"),

    # User order cancel
    path("orders/<str:order_id>/cancel/", OrderCancelView.as_view(), name="order-cancel"),

    # Reviews
    path("reviews/", ReviewListCreateView.as_view(), name="review-list-create"),

    # Coupon validation (one-time only)
    path("coupon/validate/", CouponValidateView.as_view(), name="coupon-validate"),
    path("coupon/activate/", CouponActivateView.as_view(), name="coupon-activate"),

    # Feature 1: Order Tracking
    path("orders/<str:order_id>/tracking/", OrderTrackingView.as_view(), name="order-tracking"),
    path("admin/orders/<str:order_id>/tracking/", OrderTrackingUpdateView.as_view(), name="admin-order-tracking"),

    # Feature 2: Real-time Search
    path("search/", SearchSuggestionsView.as_view(), name="search-suggestions"),

    # Feature 4: Product Variants
    path("products/<int:product_id>/variants/", ProductVariantCreateView.as_view(), name="product-variants"),

    # Feature 5: Recently Viewed
    path("recently-viewed/", RecentlyViewedView.as_view(), name="recently-viewed"),

    # Order Cancellation OTP + Return
    path("orders/<str:order_id>/generate-otp/", OTPGenerateView.as_view(), name="order-generate-otp"),
    path("orders/<str:order_id>/return-eligibility/", ReturnEligibilityView.as_view(), name="order-return-eligibility"),

    # Email endpoints
    path("admin/send-promo-email/", PromotionalEmailView.as_view(), name="send-promo-email"),
    path("send-welcome-email/", SendWelcomeEmailView.as_view(), name="send-welcome-email"),

    # Policy endpoints
    path("policies/", PolicyListView.as_view(), name="policy-list"),
    path("policies/<slug:slug>/", PolicyDetailView.as_view(), name="policy-detail"),
    path("policies/<slug:slug>/edit/", PolicySectionUpdateView.as_view(), name="policy-edit"),

    # Return request endpoints
    path("returns/", ReturnRequestListView.as_view(), name="return-list"),
    path("returns/create/", ReturnRequestCreateView.as_view(), name="return-create"),
    path("returns/<int:pk>/", ReturnRequestDetailView.as_view(), name="return-detail"),
    path("admin/returns/", AdminReturnListView.as_view(), name="admin-return-list"),
    path("admin/returns/<int:pk>/status/", AdminReturnUpdateView.as_view(), name="admin-return-status"),
]