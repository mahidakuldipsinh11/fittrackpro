import React from "react";
import { Link } from "react-router-dom";
import { X, Trash2, Plus, Minus, ShoppingBag, Tag } from "lucide-react";
import { useCart } from "./CartContext";
import { useCoupon } from "./CouponContext";
import "./CartDrawer.css";

export default function CartDrawer() {
  const {
    cart,
    total,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    increaseQty,
    decreaseQty,
  } = useCart();

  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;
  const { discount, finalTotal, couponApplied } = applyCoupon(total);

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={closeDrawer} />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <h3>Added to Cart ({cart.length})</h3>
          <button className="cart-drawer__close" onClick={closeDrawer} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={48} />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cart.map((item) => {
                const quantity = item.qty || item.quantity || 1;
                const itemImage =
                  item.image ||
                  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";

                const originalPrice = Number(item.was) || 0;
                const dealPrice = Number(item.price) || 0;
                const hasDeal = originalPrice > 0 && originalPrice > dealPrice;
                const dealDiscount = hasDeal ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : 0;
                const finalItemPrice = showDiscount ? applyCoupon(dealPrice).finalTotal : dealPrice;
                const totalSaved = originalPrice > 0 ? (originalPrice - finalItemPrice) : 0;

                return (
                  <div key={item.id} className="cart-drawer__item">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="cart-drawer__img"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="cart-drawer__info">
                      <p className="cart-drawer__name">{item.name}</p>
                      <div className="cart-drawer__price-breakdown">
                        {hasDeal && <span className="cart-drawer__original">₹{originalPrice.toLocaleString("en-IN")}</span>}
                        {hasDeal && <span className="cart-drawer__deal-badge">-{dealDiscount}% OFF</span>}
                        <span className="cart-drawer__price">₹{dealPrice.toLocaleString("en-IN")}</span>
                        {couponApplied && (
                          <>
                            <span className="cart-drawer__coupon-arrow">→</span>
                            <span className="cart-drawer__coupon-badge"><Tag size={10} /> {couponCode} -{discountPercent}%</span>
                            <span className="cart-drawer__final-price">₹{finalItemPrice.toLocaleString("en-IN")}</span>
                          </>
                        )}
                      </div>
                      {totalSaved > 0 && <span className="cart-drawer__saved">You save ₹{totalSaved.toLocaleString("en-IN")}</span>}
                      <div className="cart-drawer__qty-row">
                        <div className="cart-drawer__qty-box">
                          <button onClick={() => decreaseQty(item.id)} aria-label="Decrease quantity"><Minus size={14} /></button>
                          <span>{quantity}</span>
                          <button onClick={() => increaseQty(item.id)} aria-label="Increase quantity"><Plus size={14} /></button>
                        </div>
                        <span className="cart-drawer__item-total">₹{(finalItemPrice * quantity).toLocaleString("en-IN")}</span>
                        <button className="cart-drawer__remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__total-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              {couponApplied && (
                <div className="cart-drawer__total-row cart-drawer__total-row--discount">
                  <span>{couponCode} (-{discountPercent}%)</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="cart-drawer__total-row cart-drawer__total-row--final">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <Link to="/cart" className="cart-drawer__btn cart-drawer__btn--ghost" onClick={closeDrawer}>View Cart</Link>
              <Link to="/checkout" className="cart-drawer__btn cart-drawer__btn--primary" onClick={closeDrawer}>Checkout Now</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}