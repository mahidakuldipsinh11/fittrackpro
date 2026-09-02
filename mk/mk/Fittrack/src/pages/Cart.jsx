import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCoupon } from '../context/CouponContext';
import { Trash2, Plus, Minus, ShoppingBag, Tag, X } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, increaseQty, decreaseQty, total } = useContext(CartContext);
  const { coupon, isCouponActive, applyCoupon, removeCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const { discount, finalTotal, couponApplied } = applyCoupon(total);

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
      toast.success('Item removed from cart');
    }, 400);
  };

  const handleCheckout = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!loggedInUser) {
      toast.error("Please login or register before checkout.");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page empty-cart-page">
        <div className="empty-cart-container">
          <div className="empty-cart-icon-wrapper">
            <ShoppingBag size={80} className="empty-cart-icon" />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any gym equipment yet.</p>
          <Link to="/shop" className="btn-shop">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items">
          <h2 className="cart-title">Your Shopping Cart ({cart.length})</h2>
          {cart.map((item) => {
            const quantity = item.qty || item.quantity || 1;
            const itemImage = item.image || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";

            return (
              <div 
                key={item.id} 
                className={`cart-card ${removingId === item.id ? 'removing' : 'fade-in'}`}
              >
                <img 
                  src={itemImage} 
                  alt={item.name} 
                  className="cart-img"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  {item.cat && <span className="cart-cat-tag">{item.cat}</span>}
                  {/* ─── Per-item discount breakdown ─── */}
                  {(() => {
                    const origPrice = Number(item.was) || 0;
                    const dealPrice = Number(item.price) || 0;
                    const hasDeal = origPrice > 0 && origPrice > dealPrice;
                    const dealPct = hasDeal ? Math.round(((origPrice - dealPrice) / origPrice) * 100) : 0;
                    const finalP = couponApplied ? applyCoupon(dealPrice).finalTotal : dealPrice;
                    const saved = origPrice > 0 ? origPrice - finalP : 0;
                    return (
                      <div className="cart-price-breakdown">
                        {hasDeal && <span className="cart-original">₹{origPrice.toLocaleString('en-IN')}</span>}
                        {hasDeal && <span className="cart-deal-badge">-{dealPct}% OFF</span>}
                        <p className="cart-price">₹{dealPrice.toLocaleString('en-IN')}</p>
                        {couponApplied && (
                          <>
                            <span className="cart-coupon-arrow">→</span>
                            <span className="cart-coupon-badge">🏷️ {couponCode} -{discountPercent}%</span>
                            <span className="cart-final-price">₹{finalP.toLocaleString('en-IN')}</span>
                          </>
                        )}
                        {saved > 0 && <span className="cart-item-saved">You save ₹{saved.toLocaleString('en-IN')}</span>}
                      </div>
                    );
                  })()}
                  <div className="cart-actions">
                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item.id)} className="qty-btn" aria-label="Decrease quantity">
                        <Minus size={16} />
                      </button>
                      <span>{quantity}</span>
                      <button onClick={() => increaseQty(item.id)} className="qty-btn" aria-label="Increase quantity">
                        <Plus size={16} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="remove-btn">
                      <Trash2 size={18} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  {(() => {
                    const origPrice = Number(item.was) || 0;
                    const dealPrice = Number(item.price) || 0;
                    const finalP = couponApplied ? applyCoupon(dealPrice).finalTotal : dealPrice;
                    return <span>₹{(finalP * quantity).toLocaleString('en-IN')}</span>;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary fade-in">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>FREE</span>
          </div>

          {(() => {
            const totalWas = cart.reduce((sum, item) => sum + (Number(item.was) || 0) * (item.qty || item.quantity || 1), 0);
            const dealSavings = totalWas > 0 ? totalWas - total : 0;
            return dealSavings > 0 ? (
              <div className="summary-row" style={{ color: '#10b981' }}>
                <span>🎉 Deal Savings</span>
                <span>-₹{dealSavings.toLocaleString('en-IN')}</span>
              </div>
            ) : null;
          })()}

          {couponApplied && (
            <div className="coupon-applied-row">
              <div className="coupon-applied-badge">
                <Tag size={14} />
                <span>WELCOME10</span>
                <button onClick={() => { removeCoupon(); toast.info('Coupon removed.'); }} className="coupon-remove-btn">
                  <X size={12} />
                </button>
              </div>
              <span className="coupon-discount">-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>

          {!couponApplied && (
            <div className="coupon-promo-box">
              <Tag size={14} />
              <span>Subscribe on Home page to get <strong>10% OFF</strong> with code <strong>WELCOME10</strong></span>
            </div>
          )}

          <button 
            className="checkout-btn"
            onClick={handleCheckout}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
