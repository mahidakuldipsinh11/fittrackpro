"""
FitTrack Pro — Email Utilities
Send order confirmation (with discount + invoice), cancellation, tracking, and promotional emails.
Sender: fittrackpro.noreply@gmail.com
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

FROM_EMAIL = getattr(settings, "DEFAULT_FROM_EMAIL", "FitTrack Pro <fittrackpro.noreply@gmail.com>")
SITE_URL = getattr(settings, "SITE_URL", "http://127.0.0.1:8000")

ADMIN_EMAILS = getattr(settings, "ADMIN_EMAILS", ["fittrackpro.noreply@gmail.com"])


def _build_items_table(order):
    """Build HTML table rows for order items with per-item discount breakdown."""
    rows = ""
    for item in order.items.all():
        deal_pct = 0
        if item.product and item.product.was_price and item.product.was_price > item.price:
            deal_pct = round((item.product.was_price - item.price) / item.product.was_price * 100)
        item_total = item.price * item.quantity
        rows += f"""
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px 10px;">
                <strong>{item.product_name}</strong><br>
                <span style="color:#888;font-size:12px;">{item.category or 'Equipment'}</span>
                {'<br><span style="color:#dc2626;font-size:12px;">🏷️ ' + str(deal_pct) + '% OFF</span>' if deal_pct > 0 else ''}
            </td>
            <td style="padding:12px 10px;text-align:center;">{item.quantity}</td>
            <td style="padding:12px 10px;text-align:right;">
                ₹{item_total:,.0f}
            </td>
        </tr>"""
    return rows


def _build_invoice_section(order):
    """Build discount breakdown and invoice summary."""
    deal_savings = order.deal_savings if hasattr(order, 'deal_savings') and order.deal_savings else 0
    coupon_discount = order.coupon_discount if hasattr(order, 'coupon_discount') and order.coupon_discount else 0
    total_saved = deal_savings + coupon_discount

    discount_section = ""
    if deal_savings > 0:
        discount_section += f"""
        <div style="display:flex;justify-content:space-between;padding:6px 0;color:#16a34a;">
            <span>🎉 Deal Discount</span>
            <span>-₹{deal_savings:,.0f}</span>
        </div>"""
    if coupon_discount > 0:
        discount_section += f"""
        <div style="display:flex;justify-content:space-between;padding:6px 0;color:#16a34a;">
            <span>🏷️ Welcome Bonus (10%)</span>
            <span>-₹{coupon_discount:,.0f}</span>
        </div>"""
    if total_saved > 0:
        discount_section += f"""
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 15px;margin:10px 0;text-align:center;">
            <span style="color:#166534;font-weight:bold;">💰 Total You Saved: -₹{total_saved:,.0f}</span>
        </div>"""

    return discount_section


def send_order_confirmation_email(order):
    """
    Order placed — email with discount breakdown + invoice-like summary.
    """
    try:
        user_email = order.user.email if order.user else None
        email_to = user_email
        if not email_to:
            email_to = getattr(order, "customer_email", None)
        if not email_to:
            logger.warning(f"No email found for order {order.order_id}")
            return False

        customer_name = order.customer_name or (order.user.get_full_name() if order.user else "Customer")
        items_html = _build_items_table(order)
        discount_html = _build_invoice_section(order)

        deal_savings = order.deal_savings if hasattr(order, 'deal_savings') and order.deal_savings else 0
        coupon_discount = order.coupon_discount if hasattr(order, 'coupon_discount') and order.coupon_discount else 0
        total_saved = deal_savings + coupon_discount

        html_message = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:linear-gradient(135deg,#FF6B00,#FF9500);padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Order Confirmation & Invoice</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#16a34a;margin-top:0;">✅ Your Order is Successfully Placed!</h2>
                <p style="color:#555;">Hi <strong>{customer_name}</strong>,</p>
                <p style="color:#555;">Thank you for shopping with FitTrack Pro! Your order has been confirmed.</p>

                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#166534;"><strong>Order ID:</strong> {order.order_id}</p>
                    <p style="margin:5px 0 0;color:#166534;"><strong>Payment Method:</strong> {order.payment_method}</p>
                    <p style="margin:5px 0 0;color:#166534;"><strong>Date:</strong> {order.date}</p>
                </div>

                <h3 style="color:#333;border-bottom:2px solid #FF6B00;padding-bottom:8px;">📦 Order Items</h3>
                <table style="width:100%;border-collapse:collapse;margin:10px 0;">
                    <thead>
                        <tr style="background:#f1f5f9;">
                            <th style="padding:10px;text-align:left;">Product</th>
                            <th style="padding:10px;text-align:center;">Qty</th>
                            <th style="padding:10px;text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>{items_html}</tbody>
                </table>

                <div style="border-top:2px solid #eee;padding-top:15px;margin-top:15px;">
                    <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555;">
                        <span>Subtotal (MRP)</span><span>₹{order.subtotal:,.0f}</span>
                    </div>
                    {discount_html}
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #FF6B00;margin-top:10px;">
                        <span style="font-size:18px;font-weight:bold;color:#FF6B00;">Total Paid</span>
                        <span style="font-size:18px;font-weight:bold;color:#FF6B00;">₹{order.total:,.0f}</span>
                    </div>
                </div>

                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#9a3412;">📦 <strong>Delivery Address:</strong></p>
                    <p style="margin:5px 0 0;color:#9a3412;">{order.customer_name}<br>{order.customer_address}<br>📞 {order.customer_phone}</p>
                </div>

                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#1e40af;">📍 <strong>Tracking Updates:</strong></p>
                    <p style="margin:5px 0 0;color:#1e40af;">You will receive email updates when your order status changes:<br>
                    ✅ Confirmed → 📦 Processing → 🚚 Shipped → 🏠 Out for Delivery → ✅ Delivered</p>
                </div>

                <p style="color:#555;">Track your order anytime from <a href="{SITE_URL}/profile" style="color:#FF6B00;">Profile → My Orders</a>.</p>
                <p style="color:#555;">Thank you for choosing FitTrack Pro! 💪</p>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro. All rights reserved.</p>
                <p style="color:#94a3b8;margin:5px 0 0;font-size:12px;">📧 fittrackpro.noreply@gmail.com | 📞 +91 98765 43210</p>
            </div>
        </div>"""

        msg = EmailMultiAlternatives(
            subject=f"✅ Order Confirmed — {order.order_id} | Invoice & Discount Details | FitTrack Pro",
            body=f"Order {order.order_id} confirmed. Total: ₹{order.total:,.0f}. You saved: ₹{total_saved:,.0f}",
            from_email=FROM_EMAIL,
            to=[email_to],
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=True)

        logger.info(f"Order confirmation email sent to {email_to} for {order.order_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to send confirmation email for {order.order_id}: {e}")
        return False


def send_order_cancellation_email(order, reason="Customer requested cancellation"):
    """
    Order cancelled — email to user AND admin with reason.
    """
    try:
        user_email = order.user.email if order.user else None
        if not user_email:
            logger.warning(f"No email for cancelled order {order.order_id}")
            return False

        customer_name = order.customer_name or (order.user.get_full_name() if order.user else "Customer")
        payment = str(order.payment_method).lower()
        is_refund = "cod" in payment or "upi" in payment

        refund_section = ""
        if is_refund:
            refund_section = f"""
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:15px;margin:20px 0;">
                <p style="margin:0;color:#1e40af;">💰 <strong>Refund Information</strong></p>
                <p style="margin:8px 0 0;color:#1e40af;">A refund of <strong>₹{order.total:,.0f}</strong> will be processed to your account within <strong>7 business days</strong>.</p>
            </div>"""
        else:
            refund_section = f"""
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:15px;margin:20px 0;">
                <p style="margin:0;color:#1e40af;">💰 <strong>Refund Information</strong></p>
                <p style="margin:8px 0 0;color:#1e40af;">A refund of <strong>₹{order.total:,.0f}</strong> will be processed to your original payment method within <strong>7-10 business days</strong>.</p>
            </div>"""

        # ─── Email to USER ───
        user_html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#dc2626;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Order Cancelled</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#dc2626;margin-top:0;">❌ Order Cancelled Successfully</h2>
                <p style="color:#555;">Hi <strong>{customer_name}</strong>,</p>
                <p style="color:#555;">Your order <strong>#{order.order_id}</strong> has been cancelled as per your request.</p>

                <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#991b1b;"><strong>Order ID:</strong> {order.order_id}</p>
                    <p style="margin:5px 0 0;color:#991b1b;"><strong>Cancelled Amount:</strong> ₹{order.total:,.0f}</p>
                    <p style="margin:5px 0 0;color:#991b1b;"><strong>Your Reason:</strong> {reason}</p>
                </div>

                {refund_section}

                <p style="color:#555;">We're sorry to see you go! Visit our <a href="{SITE_URL}/shop" style="color:#FF6B00;">Shop</a> anytime.</p>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro. All rights reserved.</p>
            </div>
        </div>"""

        msg_user = EmailMultiAlternatives(
            subject=f"❌ Order Cancelled — {order.order_id} | FitTrack Pro",
            body=f"Order {order.order_id} cancelled. Reason: {reason}. Refund: ₹{order.total:,.0f}",
            from_email=FROM_EMAIL,
            to=[user_email],
        )
        msg_user.attach_alternative(user_html, "text/html")
        msg_user.send(fail_silently=True)

        # ─── Email to ADMIN ───
        admin_html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#dc2626;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:20px;">⚠️ Order Cancelled Alert</h1>
            </div>
            <div style="padding:20px;background:white;">
                <h3 style="color:#333;">Cancellation Details</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px;color:#666;"><strong>Order ID:</strong></td><td>{order.order_id}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Customer:</strong></td><td>{customer_name}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Email:</strong></td><td>{user_email}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Phone:</strong></td><td>{order.customer_phone}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Amount:</strong></td><td>₹{order.total:,.0f}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Payment:</strong></td><td>{order.payment_method}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>Reason:</strong></td><td style="color:#dc2626;font-weight:bold;">{reason}</td></tr>
                </table>
                <p style="margin-top:15px;color:#999;font-size:12px;">Action needed: Process refund if applicable.</p>
            </div>
        </div>"""

        msg_admin = EmailMultiAlternatives(
            subject=f"⚠️ CANCELLED: Order {order.order_id} — Reason: {reason[:50]}",
            body=f"Order {order.order_id} cancelled by {customer_name}. Reason: {reason}. Amount: ₹{order.total:,.0f}",
            from_email=FROM_EMAIL,
            to=ADMIN_EMAILS,
        )
        msg_admin.attach_alternative(admin_html, "text/html")
        msg_admin.send(fail_silently=True)

        logger.info(f"Cancellation emails sent for {order.order_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to send cancellation email for {order.order_id}: {e}")
        return False


def send_order_shipped_email(order):
    """
    Order shipped — tracking update email.
    """
    try:
        user_email = order.user.email if order.user else None
        if not user_email:
            return False

        customer_name = order.customer_name or (order.user.get_full_name() if order.user else "Customer")

        html_message = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#2563eb;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Shipping Update</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#2563eb;margin-top:0;">📦 Your Order Has Been Shipped!</h2>
                <p style="color:#555;">Hi <strong>{customer_name}</strong>,</p>
                <p style="color:#555;">Great news! Your order <strong>#{order.order_id}</strong> has been shipped and is on its way to you.</p>

                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#1e40af;"><strong>Order ID:</strong> {order.order_id}</p>
                    <p style="margin:5px 0 0;color:#1e40af;"><strong>Status:</strong> 🚚 Shipped</p>
                    <p style="margin:5px 0 0;color:#1e40af;"><strong>Estimated Delivery:</strong> 3-5 business days</p>
                </div>

                <h3 style="color:#333;">📍 Tracking Status</h3>
                <div style="padding:10px 0;">
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Confirmed</strong> <span style="margin-left:auto;color:#888;">Order placed</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#2563eb;">
                        <span style="margin-right:10px;">✅</span> <strong>Processing</strong> <span style="margin-left:auto;color:#888;">Preparing for shipment</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#FF6B00;font-weight:bold;">
                        <span style="margin-right:10px;">🚚</span> <strong>Shipped</strong> <span style="margin-left:auto;color:#888;">On the way</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#ccc;">
                        <span style="margin-right:10px;">⏳</span> Out for Delivery
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#ccc;">
                        <span style="margin-right:10px;">⏳</span> Delivered
                    </div>
                </div>

                <p style="color:#555;">Track your order from <a href="{SITE_URL}/profile" style="color:#FF6B00;">Profile → My Orders</a>.</p>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro. All rights reserved.</p>
            </div>
        </div>"""

        msg = EmailMultiAlternatives(
            subject=f"📦 Order Shipped — {order.order_id} | FitTrack Pro",
            body=f"Order {order.order_id} has been shipped. Estimated delivery: 3-5 business days.",
            from_email=FROM_EMAIL,
            to=[user_email],
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=True)

        logger.info(f"Shipped email sent for {order.order_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to send shipped email for {order.order_id}: {e}")
        return False


def send_order_delivered_email(order):
    """
    Order delivered — final tracking update email.
    """
    try:
        user_email = order.user.email if order.user else None
        if not user_email:
            return False

        customer_name = order.customer_name or (order.user.get_full_name() if order.user else "Customer")

        deal_savings = order.deal_savings if hasattr(order, 'deal_savings') and order.deal_savings else 0
        coupon_discount = order.coupon_discount if hasattr(order, 'coupon_discount') and order.coupon_discount else 0
        total_saved = deal_savings + coupon_discount

        savings_text = ""
        if total_saved > 0:
            savings_text = f'<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 15px;margin:10px 0;text-align:center;"><span style="color:#166534;font-weight:bold;">💰 Total Saved on this order: ₹{total_saved:,.0f}</span></div>'

        html_message = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#16a34a;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Delivery Confirmation</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#16a34a;margin-top:0;">🎉 Your Order Has Been Delivered!</h2>
                <p style="color:#555;">Hi <strong>{customer_name}</strong>,</p>
                <p style="color:#555;">Your order <strong>#{order.order_id}</strong> has been successfully delivered. We hope you love your new gym equipment!</p>

                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#166534;"><strong>Order ID:</strong> {order.order_id}</p>
                    <p style="margin:5px 0 0;color:#166534;"><strong>Total Paid:</strong> ₹{order.total:,.0f}</p>
                </div>

                {savings_text}

                <h3 style="color:#333;">📍 Full Tracking Timeline</h3>
                <div style="padding:10px 0;">
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Confirmed</strong>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Processing</strong>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Shipped</strong>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Out for Delivery</strong>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;font-weight:bold;">
                        <span style="margin-right:10px;">🎉</span> <strong>Delivered</strong> <span style="margin-left:auto;color:#888;">Complete!</span>
                    </div>
                </div>

                <p style="color:#555;">Loved your purchase? Share your experience by leaving a review on our <a href="{SITE_URL}/shop" style="color:#FF6B00;">Shop</a> page!</p>
                <p style="color:#555;">Thank you for choosing FitTrack Pro! 💪</p>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro. All rights reserved.</p>
            </div>
        </div>"""

        msg = EmailMultiAlternatives(
            subject=f"🎉 Order Delivered — {order.order_id} | FitTrack Pro",
            body=f"Order {order.order_id} has been delivered. Total: ₹{order.total:,.0f}. Saved: ₹{total_saved:,.0f}",
            from_email=FROM_EMAIL,
            to=[user_email],
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=True)

        logger.info(f"Delivered email sent for {order.order_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to send delivered email for {order.order_id}: {e}")
        return False


def send_order_processing_email(order):
    """
    Order processing — tracking update email.
    """
    try:
        user_email = order.user.email if order.user else None
        if not user_email:
            return False

        customer_name = order.customer_name or (order.user.get_full_name() if order.user else "Customer")

        html_message = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#8b5cf6;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Order Processing Update</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#8b5cf6;margin-top:0;">⚙️ Your Order is Being Processed!</h2>
                <p style="color:#555;">Hi <strong>{customer_name}</strong>,</p>
                <p style="color:#555;">Your order <strong>#{order.order_id}</strong> is now being processed and will be shipped soon.</p>

                <div style="background:#f5f3ff;border:1px solid #c4b5fd;border-radius:8px;padding:15px;margin:20px 0;">
                    <p style="margin:0;color:#6d28d9;"><strong>Order ID:</strong> {order.order_id}</p>
                    <p style="margin:5px 0 0;color:#6d28d9;"><strong>Status:</strong> ⚙️ Processing</p>
                    <p style="margin:5px 0 0;color:#6d28d9;"><strong>Next Step:</strong> 📦 Shipped (within 1-2 days)</p>
                </div>

                <h3 style="color:#333;">📍 Tracking Status</h3>
                <div style="padding:10px 0;">
                    <div style="display:flex;align-items:center;padding:8px 0;color:#16a34a;">
                        <span style="margin-right:10px;">✅</span> <strong>Confirmed</strong> <span style="margin-left:auto;color:#888;">Order placed</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#FF6B00;font-weight:bold;">
                        <span style="margin-right:10px;">⚙️</span> <strong>Processing</strong> <span style="margin-left:auto;color:#888;">Preparing</span>
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#ccc;">
                        <span style="margin-right:10px;">⏳</span> Shipped
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#ccc;">
                        <span style="margin-right:10px;">⏳</span> Out for Delivery
                    </div>
                    <div style="display:flex;align-items:center;padding:8px 0;color:#ccc;">
                        <span style="margin-right:10px;">⏳</span> Delivered
                    </div>
                </div>

                <p style="color:#555;">Track your order from <a href="{SITE_URL}/profile" style="color:#FF6B00;">Profile → My Orders</a>.</p>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro. All rights reserved.</p>
            </div>
        </div>"""

        msg = EmailMultiAlternatives(
            subject=f"⚙️ Order Processing — {order.order_id} | FitTrack Pro",
            body=f"Order {order.order_id} is being processed. Shipment expected within 1-2 days.",
            from_email=FROM_EMAIL,
            to=[user_email],
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=True)

        logger.info(f"Processing email sent for {order.order_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to send processing email for {order.order_id}: {e}")
        return False


def send_promotional_email(subject, message_html, offer_title="Special Offer"):
    """Sabhi registered users ko promotional email bhejo."""
    from accounts.models import User
    users = User.objects.filter(is_active=True).exclude(email="").values_list("email", flat=True)
    results = {"sent": 0, "failed": 0, "total": 0}
    for email in users:
        results["total"] += 1
        try:
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
                <div style="background:linear-gradient(135deg,#FF6B00,#FF9500);padding:30px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:24px;">🏋️ FitTrack Pro</h1>
                    <p style="color:#fff;margin:10px 0 0;opacity:0.9;">🎉 {offer_title}</p>
                </div>
                <div style="padding:30px;background:white;">
                    <h2 style="color:#1a1a2e;margin-top:0;">{offer_title}</h2>
                    {message_html}
                    <div style="text-align:center;margin:25px 0;">
                        <a href="{SITE_URL}/shop" style="background:#FF6B00;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Shop Now</a>
                    </div>
                </div>
                <div style="background:#1a1a2e;padding:20px;text-align:center;">
                    <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro.</p>
                </div>
            </div>"""
            msg = EmailMultiAlternatives(
                subject=f"🎉 {subject} | FitTrack Pro",
                body=f"{offer_title} — Shop now at FitTrack Pro!",
                from_email=FROM_EMAIL,
                to=[email],
            )
            msg.attach_alternative(html, "text/html")
            msg.send(fail_silently=True)
            results["sent"] += 1
        except Exception as e:
            logger.error(f"Failed to send promo email to {email}: {e}")
            results["failed"] += 1
    return results


def send_welcome_email(user):
    """Naye user ko welcome email."""
    try:
        if not user.email:
            return False
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;">
            <div style="background:#FF6B00;padding:30px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">🏋️ Welcome to FitTrack Pro!</h1>
                <p style="color:#fff;margin:10px 0 0;opacity:0.9;">Your fitness journey starts here</p>
            </div>
            <div style="padding:30px;background:white;">
                <h2 style="color:#1a1a2e;margin-top:0;">Hello {user.get_full_name() or user.name}!</h2>
                <p style="color:#555;">Welcome to FitTrack Pro — India's premium fitness equipment store.</p>
                <ul style="color:#555;">
                    <li>🛒 Browse <strong>200+ products</strong> — gym equipment, clothing, supplements</li>
                    <li>🏷️ Get exclusive <strong>deals & discounts</strong></li>
                    <li>📦 Track your orders in real-time</li>
                    <li>💳 <strong>10% Welcome Bonus</strong> on your first purchase!</li>
                </ul>
                <div style="text-align:center;margin:25px 0;">
                    <a href="{SITE_URL}/shop" style="background:#FF6B00;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Start Shopping</a>
                </div>
            </div>
            <div style="background:#1a1a2e;padding:20px;text-align:center;">
                <p style="color:#94a3b8;margin:0;font-size:12px;">© 2026 FitTrack Pro.</p>
            </div>
        </div>"""
        msg = EmailMultiAlternatives(
            subject="🏋️ Welcome to FitTrack Pro! Here's your 10% OFF",
            body="Welcome to FitTrack Pro! Start shopping now.",
            from_email=FROM_EMAIL,
            to=[user.email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=True)
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {e}")
        return False
