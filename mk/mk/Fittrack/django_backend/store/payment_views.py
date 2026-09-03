"""
Razorpay Payment Integration
- POST /api/payment/create-order/  → Creates a Razorpay order
- POST /api/payment/verify/        → Verifies payment signature
- GET  /api/payment/key/           → Returns Razorpay key ID for frontend

Setup:
1. Sign up at https://dashboard.razorpay.com
2. Go to Settings → API Keys
3. Copy Key ID and Key Secret
4. Add to Render environment variables:
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
5. Deploy — integration goes live automatically
"""

import os
import logging
from decimal import Decimal

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger("store.payment")

# Load Razorpay credentials from environment
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")


def get_razorpay_client():
    """Lazy import and create Razorpay client."""
    try:
        import razorpay
    except ImportError:
        raise ImportError(
            "razorpay package not installed. Run: pip install razorpay"
        )

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise ValueError(
            "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables"
        )

    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class RazorpayKeyView(APIView):
    """Return Razorpay key ID to frontend (safe — no secret key exposed)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not RAZORPAY_KEY_ID:
            return Response(
                {"error": "Razorpay not configured. Set RAZORPAY_KEY_ID in environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"key_id": RAZORPAY_KEY_ID})


class RazorpayCreateOrderView(APIView):
    """
    Create a Razorpay order before payment.
    POST { amount: 1999, currency: "INR", receipt: "ORD-1234" }
    Returns { order_id, amount, currency, key_id }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        amount = request.data.get("amount")
        currency = request.data.get("currency", "INR")
        receipt = request.data.get("receipt", "")

        if not amount:
            return Response(
                {"error": "amount is required (in INR)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Convert to paise (Razorpay expects smallest currency unit)
        try:
            amount_paise = int(round(float(amount) * 100))
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount_paise < 100:  # Minimum ₹1
            return Response(
                {"error": "Minimum amount is ₹1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            client = get_razorpay_client()
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": currency,
                "receipt": receipt,
                "payment_capture": 1,  # Auto-capture payment
            })

            logger.info(f"Razorpay order created: {razorpay_order['id']} for ₹{amount}")

            return Response({
                "order_id": razorpay_order["id"],
                "amount": amount_paise,
                "currency": currency,
                "key_id": RAZORPAY_KEY_ID,
            })

        except ImportError:
            return Response(
                {"error": "razorpay package not installed. Run: pip install razorpay"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            return Response(
                {"error": f"Failed to create payment order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RazorpayVerifyView(APIView):
    """
    Verify Razorpay payment signature after successful payment.
    POST {
        razorpay_order_id: "order_xxx",
        razorpay_payment_id: "pay_xxx",
        razorpay_signature: "xxx"
    }
    Returns { verified: true/false }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"error": "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            client = get_razorpay_client()

            # Verify signature
            params_dict = {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }

            client.utility.verify_payment_signature(params_dict)

            logger.info(f"Payment verified: {razorpay_payment_id} for order {razorpay_order_id}")

            return Response({
                "verified": True,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
            })

        except ImportError:
            return Response(
                {"error": "razorpay package not installed"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.error(f"Payment verification failed: {e}")
            return Response(
                {"verified": False, "error": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST,
            )
