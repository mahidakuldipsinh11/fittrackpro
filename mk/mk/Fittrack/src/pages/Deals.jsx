import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductContext";
import { useCoupon } from "../context/CouponContext";
import api from "../api/client";
import "./Deals.css";

function calculateTimeLeft(endTime) {
  const diff = endTime - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };

  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / 1000 / 60) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function Deals() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  const dealsList = useMemo(() => products.filter((p) => p.is_deal), [products]);

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // Naye deals aane par ya product list update hone par timers reset karo
    const initializedDeals = dealsList.map((d) => {
      const endTime = Date.now() + (d.endsInHours || 48) * 60 * 60 * 1000;
      return {
        ...d,
        endTime,
        timeLeft: calculateTimeLeft(endTime),
      };
    });
    setDeals(initializedDeals);

    const timer = setInterval(() => {
      setDeals((prevDeals) =>
        prevDeals.map((deal) => ({
          ...deal,
          timeLeft: calculateTimeLeft(deal.endTime),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealsList.map((d) => d.id).join(",")]);

  const handleAddToCart = async (deal) => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!loggedInUser) {
      toast.error("Please login or register before adding items to your cart.");
      return;
    }
    addToCart({
      id: deal.id,
      name: deal.name,
      price: deal.price,
      was: deal.was,
      image: deal.image,
      cat: deal.cat,
      is_deal: deal.is_deal,
      off: deal.off,
    });
    toast.success(`${deal.name} deal added to cart!`);

    // Update claimed count in backend
    try {
      const res = await api.post(`/deals/${deal.id}/claim/`);
      setDeals((prev) =>
        prev.map((d) =>
          d.id === deal.id ? { ...d, claimed: res.data.claimed } : d
        )
      );
    } catch (err) {
      // Silently fail — claimed count is not critical
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";
  };

  return (
    <main className="ft-page deals">
      <div className="deals-hero-bg">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&auto=format&fit=crop&q=80" alt="Deals" />
        <div className="deals-hero-bg__overlay" />
        <section className="deals-hero">
          <div className="ft-container">
            <span className="ft-eyebrow">Limited time offers</span>
            <h1>Current Flash Deals</h1>
            <p>Exclusive clearance prices on high-end commercial racks, plates, and cardio gear.</p>
          </div>
        </section>
      </div>

      <section className="ft-container deals-grid">
        {deals.map((d, index) => (
          <div
            key={d.id}
            className="deal-card staggered-entry"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <div className="deal-card__thumb">
              <span className="deal-card__badge pulsing-badge">SAVE {d.off || 0}%</span>
              <img
                src={d.image}
                alt={d.name}
                className="deal-card__img"
                loading="lazy"
                onError={handleImageError}
              />
            </div>

            <div className="deal-card__body">
              <span className="deal-card__cat">{d.cat}</span>
              <h3>{d.name}</h3>

              <div className="deal-card__prices">
                {/* ─── Show original was price + deal discount + coupon discount ─── */}
                {d.was && (
                  <span className="deal-card__original">
                    ₹{Number(d.was).toLocaleString("en-IN")}
                  </span>
                )}
                {d.was && (
                  <span className="deal-card__deal-badge">
                    -{Math.round(((d.was - d.price) / d.was) * 100)}% OFF
                  </span>
                )}
                <span className="deal-card__now">
                  ₹{Number(d.price).toLocaleString("en-IN")}
                </span>
                {/* ─── Additional 10% coupon discount ─── */}
                {showDiscount && (
                  <>
                    <span className="deal-card__coupon-divider">→</span>
                    <span className="deal-card__coupon-badge">🏷️ {couponCode} -{discountPercent}%</span>
                    <span className="deal-card__final-price">
                      ₹{applyCoupon(Number(d.price)).finalTotal.toLocaleString("en-IN")}
                    </span>
                    <span className="deal-card__total-save">
                      Total Save: ₹{(Number(d.was || d.price) - applyCoupon(Number(d.price)).finalTotal).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>

              <div className="deal-card__progress">
                <div className="progress-text">
                  <span>{d.claimed || 0}% Claimed</span>
                  <span className="stock-available">In Stock</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${d.claimed || 0}%` }}
                  ></div>
                </div>
              </div>

             
                <button
                  className="ft-btn ft-btn--primary deal-card__btn"
                  onClick={() => handleAddToCart(d)}
                >
                  Grab Deal
                </button>
              </div>
            </div>
        ))}

        {deals.length === 0 && (
          <div className="shop-empty">
            <p>No active deals right now. Admin panel se "Deal" product add karo.</p>
          </div>
        )}
      </section>
    </main>
  );
}