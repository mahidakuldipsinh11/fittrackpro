from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render

from .models import ContactMessage, Order, Product, Category, Wishlist, Review, CouponUsage, OrderTracking, ProductVariant, RecentlyViewed, CancellationOTP, Refund, Policy, PolicySection, ReturnRequest
from .serializers import (
    ContactMessageSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductSerializer,
    CategorySerializer,
    ProductWriteSerializer,
    WishlistSerializer,
    ReviewSerializer,
    CouponUsageSerializer,
    OrderTrackingSerializer,
    ProductVariantSerializer,
    RecentlyViewedSerializer,
    CancellationOTPSerializer,
    RefundSerializer,
    PolicySerializer,
    PolicySectionSerializer,
    PolicySectionWriteSerializer,
    ReturnRequestSerializer,
    ReturnRequestCreateSerializer,
)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        brand = self.request.query_params.get("brand")
        search = self.request.query_params.get("search")
        is_deal = self.request.query_params.get("is_deal")

        if category and category.lower() != "all":
            queryset = queryset.filter(category__name__iexact=category)
        if brand and brand.lower() != "all":
            queryset = queryset.filter(brand__iexact=brand)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if is_deal is not None:
            queryset = queryset.filter(is_deal=is_deal.lower() in ("1", "true", "yes"))

        return queryset


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("category").all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProductWriteSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class DealListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.select_related("category").filter(is_deal=True)


class DealClaimView(APIView):
    """Increment claimed count when user grabs a deal."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, is_deal=True)
        except Product.DoesNotExist:
            return Response({"error": "Deal not found"}, status=status.HTTP_404_NOT_FOUND)

        product.claimed = min(product.claimed + 1, 100)
        product.save(update_fields=["claimed"])

        return Response({
            "claimed": product.claimed,
            "message": f"Deal claimed! Now {product.claimed}% claimed"
        })


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user).prefetch_related("items")
        return Order.objects.none()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Send order confirmation email in background thread (non-blocking)
        import threading
        import logging
        _log = logging.getLogger('store.email')

        def _send_email():
            try:
                from store.email_utils import send_order_confirmation_email
                sent = send_order_confirmation_email(order)
                if sent:
                    _log.info(f'Order confirmation email sent for {order.order_id}')
                else:
                    _log.warning(f'Order confirmation email NOT sent for {order.order_id} — no email found')
            except Exception as e:
                _log.error(f'Order confirmation email failed for {order.order_id}: {e}')

        threading.Thread(target=_send_email, daemon=True).start()

        # Return response immediately — don't wait for email
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class AdminOrderListView(generics.ListAPIView):
    """Sabhi orders — sirf admin/staff ke liye (Admin panel Orders tab)."""
    queryset = Order.objects.all().prefetch_related("items")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    """Admin panel se order status change karne ke liye."""
    queryset = Order.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        status_value = request.data.get("status")
        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        if status_value == "Cancelled":
            # Stock wapas add karo jo order place hone par kam hua tha
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock"])

            order.delete()
            return Response({"message": "Order cancelled and removed."}, status=status.HTTP_200_OK)

        order.status = status_value
        order.save()

        # Send email notification in background thread (non-blocking)
        import threading, logging as _log_mod
        _log = _log_mod.getLogger('store.email')
        def _send_status_email():
            try:
                from store.email_utils import send_order_shipped_email, send_order_delivered_email, send_order_processing_email
                if status_value == "Processing":
                    sent = send_order_processing_email(order)
                    _log.info(f'Processing email sent={sent} for {order.order_id}')
                elif status_value == "Shipped":
                    sent = send_order_shipped_email(order)
                    _log.info(f'Shipped email sent={sent} for {order.order_id}')
                elif status_value == "Delivered":
                    sent = send_order_delivered_email(order)
                    _log.info(f'Delivered email sent={sent} for {order.order_id}')
            except Exception as e:
                _log.error(f'Status email failed for {order.order_id}: {e}')
        threading.Thread(target=_send_status_email, daemon=True).start()

        return Response(OrderSerializer(order).data)


class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "message": "FitTrack API is running"})


class PromotionalEmailView(APIView):
    """Admin: Send promotional/offer email to all registered users."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        subject = request.data.get("subject", "")
        message = request.data.get("message", "")
        offer_title = request.data.get("offer_title", "Special Offer")

        if not subject or not message:
            return Response(
                {"error": "subject and message are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from store.email_utils import send_promotional_email
        import threading

        def run_email():
            return send_promotional_email(subject, message, offer_title)

        thread = threading.Thread(target=run_email, daemon=True)
        thread.start()

        return Response({
            "message": f"Promotional email '{subject}' is being sent to all users.",
            "status": "sending",
        })


class SendWelcomeEmailView(APIView):
    """Send welcome email to a user (called after registration)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from store.email_utils import send_welcome_email
        import threading
        threading.Thread(target=send_welcome_email, args=(request.user,), daemon=True).start()
        return Response({"message": "Welcome email sent"})


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BrandListView(APIView):
    """Return distinct brand names with product counts."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Count
        brands = (
            Product.objects.exclude(brand="")
            .values("brand")
            .annotate(count=Count("id"))
            .order_by("brand")
        )
        return Response([
            {"name": b["brand"], "count": b["count"]}
            for b in brands
        ])


def index(request):
    return render(request, "index.html")


class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


# ─── WISHLIST VIEWS ────────────────────────────────────────────

class WishlistListCreateView(generics.ListCreateAPIView):
    """User ki wishlist — list + add item."""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related("product__category")

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({"message": "Already in wishlist"}, status=status.HTTP_200_OK)

        return Response(WishlistSerializer(wishlist_item).data, status=status.HTTP_201_CREATED)


class WishlistDeleteView(generics.DestroyAPIView):
    """Wishlist se item remove karna."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id, *args, **kwargs):
        deleted, _ = Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        if deleted:
            return Response({"message": "Removed from wishlist"}, status=status.HTTP_200_OK)
        return Response({"error": "Not in wishlist"}, status=status.HTTP_404_NOT_FOUND)


# ─── ORDER CANCEL (USER-FACING) ──────────────────────────────

class OrderCancelView(APIView):
    """
    Order cancel — OTP required for ALL payment methods:
    - OTP sent to user's email/phone
    - User must enter correct OTP to cancel
    - COD/UPI: 7-day return window with refund
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ("Confirmed", "Processing"):
            return Response(
                {"error": f"Order cannot be cancelled — current status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = str(order.payment_method).lower()

        # OTP required for ALL payment methods
        otp_code = request.data.get("otp")
        if not otp_code:
            return Response(
                {"error": "OTP required to cancel order. Please request OTP first.", "requires_otp": True},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Verify OTP
        from django.utils import timezone
        otp_obj = CancellationOTP.objects.filter(
            order=order, otp_code=otp_code, is_used=False, expires_at__gt=timezone.now()
        ).first()
        if not otp_obj:
            return Response(
                {"error": "Invalid or expired OTP. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        otp_obj.is_used = True
        otp_obj.save(update_fields=["is_used"])

        # Stock wapas add karo
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=["stock"])

        order.status = "Cancelled"
        order.save(update_fields=["status"])

        # COD/UPI — auto-create refund request
        if "cod" in payment or "upi" in payment:
            Refund.objects.create(
                order=order,
                amount=order.total,
                payment_mode="cod" if "cod" in payment else "upi",
                status="Pending",
                reason=request.data.get("reason", "Customer requested cancellation"),
            )

        # Add tracking step
        OrderTracking.objects.create(
            order=order,
            status="Cancelled",
            message="Order has been cancelled by customer.",
            location="",
        )

        # Send cancellation email in background thread (non-blocking)
        import threading, logging as _log_mod
        _log = _log_mod.getLogger('store.email')
        def _send_cancel_email():
            try:
                from store.email_utils import send_order_cancellation_email
                reason_text = request.data.get("reason", "Customer requested cancellation")
                sent = send_order_cancellation_email(order, reason_text)
                if sent:
                    _log.info(f'Order cancellation email sent for {order.order_id}')
                else:
                    _log.warning(f'Order cancellation email NOT sent for {order.order_id}')
            except Exception as e:
                _log.error(f'Cancel email failed for {order.order_id}: {e}')
        threading.Thread(target=_send_cancel_email, daemon=True).start()

        return Response({
            "message": "Order cancelled successfully",
            "status": "Cancelled",
            "refund_created": "cod" in payment or "upi" in payment,
        })


class OTPGenerateView(APIView):
    """Generate OTP for order cancellation — ALL payment methods ke liye."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ("Confirmed", "Processing"):
            return Response(
                {"error": f"Order cannot be cancelled — current status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils import timezone
        from datetime import timedelta

        # Invalidate any old unused OTPs for this order
        CancellationOTP.objects.filter(
            order=order, is_used=False
        ).update(is_used=True)

        otp_code = CancellationOTP.generate_otp()
        otp_obj = CancellationOTP.objects.create(
            order=order,
            otp_code=otp_code,
            email=request.user.email,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        # In production, send OTP via email/SMS
        # For now, return OTP in response (dev mode)
        return Response({
            "message": f"OTP sent to {request.user.email}",
            "otp": otp_code,  # Remove in production — send via email instead
            "expires_in": 600,
            "email": request.user.email,
        })


class ReturnEligibilityView(APIView):
    """Check if order is eligible for return/refund — COD/UPI7-day window."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        from django.utils import timezone
        from datetime import timedelta

        payment = str(order.payment_method).lower()
        is_cod_or_upi = "cod" in payment or "upi" in payment
        days_since = (timezone.now() - order.created_at).days
        is_eligible = is_cod_or_upi and order.status == "Delivered" and days_since <= 7
        days_remaining = max(0, 7 - days_since) if is_eligible else 0

        # Check if refund already exists
        has_refund = hasattr(order, "refund") and order.refund is not None

        return Response({
            "eligible": is_eligible,
            "payment_method": payment,
            "is_cod_or_upi": is_cod_or_upi,
            "days_remaining": days_remaining,
            "order_total": str(order.total),
            "has_refund": has_refund,
            "refund_status": order.refund.status if has_refund else None,
        })


# ──────────────────────── REVIEWS ────────────────────────

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET  → approved reviews (public)
    POST → submit a review (authenticated)
    """
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Review.objects.filter(is_approved=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─── COUPON VALIDATION (ONE-TIME ONLY) ────────────────────

class CouponValidateView(APIView):
    """
    POST { email, code: 'WELCOME10' }
    → 200 { valid: true } if not used before
    → 200 { valid: false, reason: 'already_used' } if already used
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        code = request.data.get("code", "WELCOME10")

        if not email or "@" not in email:
            return Response({"error": "Valid email required"}, status=status.HTTP_400_BAD_REQUEST)

        if CouponUsage.objects.filter(email=email, code=code).exists():
            return Response({"valid": False, "reason": "already_used"})

        return Response({"valid": True})


class CouponActivateView(APIView):
    """
    POST { email, code: 'WELCOME10' }
    → Records that this email used the coupon (one-time only).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        code = request.data.get("code", "WELCOME10")

        if not email or "@" not in email:
            return Response({"error": "Valid email required"}, status=status.HTTP_400_BAD_REQUEST)

        if CouponUsage.objects.filter(email=email, code=code).exists():
            return Response({"valid": False, "reason": "already_used"})

        user = None
        if request.user.is_authenticated:
            user = request.user

        CouponUsage.objects.create(code=code, email=email, user=user)
        return Response({"valid": True, "message": "Coupon activated successfully"})


# ─── FEATURE 1: ORDER TRACKING ────────────────────────────

class OrderTrackingView(APIView):
    """Get tracking steps for an order."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only owner or admin can see tracking
        if request.user.is_authenticated and (order.user == request.user or request.user.is_staff):
            pass
        elif not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        tracking = order.tracking.all().order_by('created_at')
        return Response({
            "order_id": order.order_id,
            "status": order.status,
            "tracking": OrderTrackingSerializer(tracking, many=True).data,
        })


class OrderTrackingUpdateView(APIView):
    """Admin: add a tracking step to an order."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        status_val = request.data.get("status")
        message = request.data.get("message", "")
        location = request.data.get("location", "")

        if status_val:
            order.status = status_val
            order.save(update_fields=["status"])

        tracking = OrderTracking.objects.create(
            order=order, status=status_val or order.status,
            message=message, location=location,
        )
        return Response(OrderTrackingSerializer(tracking).data, status=status.HTTP_201_CREATED)


# ─── FEATURE 2: REAL-TIME SEARCH ────────────────────────────

class SearchSuggestionsView(APIView):
    """Real-time search autocomplete — returns product names + categories."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 1:
            return Response({"products": [], "categories": []})

        products = Product.objects.filter(name__icontains=q).values("id", "name", "price", "image")[:8]
        categories = Category.objects.filter(name__icontains=q).values_list("name", flat=True)[:5]

        return Response({
            "products": list(products),
            "categories": list(categories),
        })


# ─── FEATURE 4: PRODUCT VARIANTS ────────────────────────────

class ProductVariantCreateView(APIView):
    """Admin: add variants to a product."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        variants_data = request.data.get("variants", [])
        created = []
        for v in variants_data:
            variant = ProductVariant.objects.create(
                product=product, name=v["name"],
                variant_type=v.get("variant_type", "size"),
                price_override=v.get("price_override"),
                stock=v.get("stock", 0),
            )
            created.append(ProductVariantSerializer(variant).data)

        return Response(created, status=status.HTTP_201_CREATED)


# ─── FEATURE 5: RECENTLY VIEWED ─────────────────────────────

class RecentlyViewedView(APIView):
    """Track viewed product + return recently viewed list."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            items = RecentlyViewed.objects.filter(user=request.user).select_related("product__category")[:12]
        else:
            session_id = request.query_params.get("session_id", "")
            if not session_id:
                return Response({"results": []})
            items = RecentlyViewed.objects.filter(session_id=session_id).select_related("product__category")[:12]

        return Response({"results": RecentlyViewedSerializer(items, many=True).data})

    def post(self, request):
        product_id = request.data.get("product_id")
        session_id = request.data.get("session_id", "")

        if not product_id:
            return Response({"error": "product_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.is_authenticated:
            obj, _ = RecentlyViewed.objects.get_or_create(user=request.user, product=product)
            obj.save()  # updates viewed_at
        elif session_id:
            obj, _ = RecentlyViewed.objects.get_or_create(session_id=session_id, product=product)
            obj.save()
        else:
            return Response({"error": "session_id or login required"}, status=status.HTTP_400_BAD_REQUEST)

        # Cleanup: keep only last 50 per user/session
        if request.user.is_authenticated:
            ids = RecentlyViewed.objects.filter(user=request.user).order_by('-viewed_at').values_list('id', flat=True)[:50]
            RecentlyViewed.objects.filter(user=request.user).exclude(id__in=list(ids)).delete()
        elif session_id:
            ids = RecentlyViewed.objects.filter(session_id=session_id).order_by('-viewed_at').values_list('id', flat=True)[:50]
            RecentlyViewed.objects.filter(session_id=session_id).exclude(id__in=list(ids)).delete()

        return Response({"message": "Recorded"})


# ═══════════════════════════════════════════════════════════════
# POLICY VIEWS — Editable Return/Refund/Privacy/Disclaimer pages
# ═══════════════════════════════════════════════════════════════

class PolicyListView(generics.ListAPIView):
    """List all policies (public)."""
    queryset = Policy.objects.prefetch_related("sections").all()
    serializer_class = PolicySerializer
    permission_classes = [permissions.AllowAny]


class PolicyDetailView(generics.RetrieveAPIView):
    """Get a single policy by slug (public)."""
    queryset = Policy.objects.prefetch_related("sections").all()
    serializer_class = PolicySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class PolicySectionUpdateView(APIView):
    """Update policy sections — logged-in users can edit."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, slug):
        try:
            policy = Policy.objects.get(slug=slug)
        except Policy.DoesNotExist:
            return Response({"error": "Policy not found"}, status=status.HTTP_404_NOT_FOUND)

        sections_data = request.data.get("sections", [])
        if not sections_data:
            return Response({"error": "No sections provided"}, status=status.HTTP_400_BAD_REQUEST)

        updated_sections = []
        for section_data in sections_data:
            section_id = section_data.get("id")
            if section_id:
                # Update existing section
                try:
                    section = PolicySection.objects.get(id=section_id, policy=policy)
                    section.icon = section_data.get("icon", section.icon)
                    section.title = section_data.get("title", section.title)
                    section.content = section_data.get("content", section.content)
                    section.list_items = section_data.get("list_items", section.list_items)
                    section.order = section_data.get("order", section.order)
                    section.is_visible = section_data.get("is_visible", section.is_visible)
                    section.save()
                    updated_sections.append(section)
                except PolicySection.DoesNotExist:
                    continue
            else:
                # Create new section
                section = PolicySection.objects.create(
                    policy=policy,
                    icon=section_data.get("icon", "📋"),
                    title=section_data.get("title", "New Section"),
                    content=section_data.get("content", ""),
                    list_items=section_data.get("list_items", ""),
                    order=section_data.get("order", 0),
                    is_visible=section_data.get("is_visible", True),
                )
                updated_sections.append(section)

        # Update policy title and subtitle if provided
        if "title" in request.data:
            policy.title = request.data["title"]
        if "subtitle" in request.data:
            policy.subtitle = request.data["subtitle"]
        policy.save()

        return Response(PolicySerializer(policy).data)

    def post(self, request, slug):
        """Add a new section to a policy."""
        try:
            policy = Policy.objects.get(slug=slug)
        except Policy.DoesNotExist:
            return Response({"error": "Policy not found"}, status=status.HTTP_404_NOT_FOUND)

        section = PolicySection.objects.create(
            policy=policy,
            icon=request.data.get("icon", "📋"),
            title=request.data.get("title", "New Section"),
            content=request.data.get("content", ""),
            list_items=request.data.get("list_items", ""),
            order=request.data.get("order", 0),
            is_visible=request.data.get("is_visible", True),
        )
        return Response(PolicySectionSerializer(section).data, status=status.HTTP_201_CREATED)

    def delete(self, request, slug):
        """Delete a section from a policy."""
        try:
            policy = Policy.objects.get(slug=slug)
        except Policy.DoesNotExist:
            return Response({"error": "Policy not found"}, status=status.HTTP_404_NOT_FOUND)

        section_id = request.data.get("section_id")
        if not section_id:
            return Response({"error": "section_id required"}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = PolicySection.objects.filter(id=section_id, policy=policy).delete()
        if deleted:
            return Response({"message": "Section deleted"})
        return Response({"error": "Section not found"}, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════════
# RETURN REQUEST VIEWS — User can return delivered items
# ═══════════════════════════════════════════════════════════════

class ReturnRequestCreateView(APIView):
    """User creates a return request for a delivered order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReturnRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Find the order
        try:
            order = Order.objects.get(order_id=data["order_id"], user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only delivered orders can be returned
        if order.status != "Delivered":
            return Response(
                {"error": f"Only delivered orders can be returned. Current status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if return already requested for this order
        existing = ReturnRequest.objects.filter(
            order=order, status__in=["Requested", "Approved", "Picked Up", "Inspected"]
        ).exists()
        if existing:
            return Response(
                {"error": "A return request already exists for this order. Please wait for it to be processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check 7-day return window
        from django.utils import timezone
        from datetime import timedelta
        days_since = (timezone.now() - order.created_at).days
        if days_since > 7:
            return Response(
                {"error": "Return window has expired. Returns must be requested within 7 days of delivery."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create return request
        return_req = ReturnRequest.objects.create(
            user=request.user,
            order=order,
            product_name=data["product_name"],
            reason=data["reason"],
            reason_detail=data.get("reason_detail", ""),
            return_amount=data["return_amount"],
        )

        # Auto-create refund for COD/UPI orders
        payment = str(order.payment_method).lower()
        if "cod" in payment or "upi" in payment:
            Refund.objects.get_or_create(
                order=order,
                defaults={
                    "amount": data["return_amount"],
                    "payment_mode": "cod" if "cod" in payment else "upi",
                    "status": "Pending",
                    "reason": f"Return requested: {data['reason']}",
                },
            )

        # Send return request email to user
        import threading
        def _send_return_email():
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                reason_display = dict(ReturnRequest.REASON_CHOICES).get(data['reason'], data['reason'])
                subject = f"Return Request Received - {return_req.ran_number}"
                message = (
                    f"Hi {request.user.name},\n\n"
                    f"Your return request has been received successfully.\n\n"
                    f"Return Authorization Number (RAN): {return_req.ran_number}\n"
                    f"Order ID: {order.order_id}\n"
                    f"Product: {data['product_name']}\n"
                    f"Reason: {reason_display}\n"
                    f"Refund Amount: Rs. {data['return_amount']}\n\n"
                    f"What happens next:\n"
                    f"1. Our team will review your return request within 24 hours.\n"
                    f"2. Once approved, our delivery partner will pick up the item within 2-3 business days.\n"
                    f"3. After inspection, your refund will be processed within 7 days.\n\n"
                    f"Refund method: {'Bank transfer (COD/UPI)' if 'cod' in payment or 'upi' in payment else 'Original payment method'}\n\n"
                    f"For any questions, contact us at support@fittrackpro.com\n\n"
                    f"Thank you,\nFitTrack Pro Team"
                )
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [request.user.email], fail_silently=True)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Return email failed: {e}")
        threading.Thread(target=_send_return_email, daemon=True).start()

        return Response(ReturnRequestSerializer(return_req).data, status=status.HTTP_201_CREATED)


class ReturnRequestListView(generics.ListAPIView):
    """User's return requests list."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReturnRequest.objects.filter(user=self.request.user).select_related("order")


class ReturnRequestDetailView(generics.RetrieveAPIView):
    """Get return request details."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReturnRequest.objects.filter(user=self.request.user).select_related("order")


class AdminReturnListView(generics.ListAPIView):
    """Admin: List all return requests."""
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = ReturnRequest.objects.all().select_related("order", "user")


class AdminReturnUpdateView(APIView):
    """Admin: Update return request status."""
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            return_req = ReturnRequest.objects.get(pk=pk)
        except ReturnRequest.DoesNotExist:
            return Response({"error": "Return request not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        admin_notes = request.data.get("admin_notes", "")

        valid_statuses = ["Requested", "Approved", "Picked Up", "Inspected", "Refund Initiated", "Refund Completed", "Rejected"]
        if new_status not in valid_statuses:
            return Response({"error": f"Invalid status. Choose from: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        return_req.status = new_status
        if admin_notes:
            return_req.admin_notes = admin_notes
        return_req.save()

        # If approved, update refund status
        if new_status in ("Approved", "Picked Up", "Inspected"):
            refund = getattr(return_req.order, "refund", None)
            if refund and refund.status == "Pending":
                refund.status = "Approved"
                refund.save(update_fields=["status"])

        if new_status == "Refund Completed":
            from django.utils import timezone as tz
            refund = getattr(return_req.order, "refund", None)
            if refund:
                refund.status = "Processed"
                refund.processed_at = tz.now()
                refund.save(update_fields=["status", "processed_at"])

            # Auto-update order status to 'Returned'
            order = return_req.order
            order.status = "Returned"
            order.save(update_fields=["status"])

            # Auto-increase product stock for returned items
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=["stock"])

            # Send final email to user
            import threading
            def _send_return_final_email():
                try:
                    from django.core.mail import send_mail
                    from django.conf import settings
                    subject = f"Return Completed - {return_req.ran_number}"
                    message = (
                        f"Hi {return_req.user.name},\n\n"
                        f"Your return has been completed successfully.\n\n"
                        f"Return Authorization Number: {return_req.ran_number}\n"
                        f"Order ID: {order.order_id}\n"
                        f"Product: {return_req.product_name}\n"
                        f"Refund Amount: Rs. {return_req.return_amount}\n"
                        f"Refund Status: Completed\n\n"
                        f"Your order has been marked as 'Returned' in our system.\n"
                        f"The product has been removed from your order history.\n\n"
                        f"For any questions, contact us at fittrackpronoreply@gmail.com\n\n"
                        f"Thank you,\nFitTrack Pro Team"
                    )
                    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [return_req.user.email], fail_silently=True)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Return final email failed: {e}")
            threading.Thread(target=_send_return_final_email, daemon=True).start()

            # Return request stays in database for admin history
            return Response({"message": "Return completed. Order marked as Returned. Return request saved in history."})

        # Send status update email
        import threading
        def _send_return_status_email():
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                status_messages = {
                    'Approved': 'Your return request has been approved. Our delivery partner will pick up the item within 2-3 business days.',
                    'Picked Up': 'Your item has been picked up. Our team will inspect it shortly.',

                    'Refund Completed': f'Refund of Rs. {return_req.return_amount} has been credited to your account. Thank you!',
                    'Rejected': 'Your return request has been rejected. Please contact support for details.',
                }
                msg = status_messages.get(new_status, f'Your return status has been updated to {new_status}.')
                subject = f"Return {new_status} - {return_req.ran_number}"
                message = (
                    f"Hi {return_req.user.name},\n\n"
                    f"{msg}\n\n"
                    f"Return Authorization Number: {return_req.ran_number}\n"
                    f"Order ID: {return_req.order.order_id}\n"
                    f"Product: {return_req.product_name}\n"
                    f"Current Status: {new_status}\n\n"
                    f"For any questions, contact us at support@fittrackpro.com\n\n"
                    f"Thank you,\nFitTrack Pro Team"
                )
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [return_req.user.email], fail_silently=True)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Return status email failed: {e}")
        threading.Thread(target=_send_return_status_email, daemon=True).start()

        return Response(ReturnRequestSerializer(return_req).data)
