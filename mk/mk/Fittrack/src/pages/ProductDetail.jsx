import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, ChevronRight, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useCoupon } from "../context/CouponContext";
import api from "../api/client";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);

  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}/`);
      setProduct(res.data);

      // Load related products from same category
      const catName = res.data.category?.name;
      if (catName) {
        const relRes = await api.get(`/products/?category=${encodeURIComponent(catName)}`);
        const items = (relRes.data.results || relRes.data || []).filter(p => p.id !== res.data.id).slice(0, 6);
        setRelated(items);
      }
    } catch {
      toast.error("Product not found");
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    const price = selectedVariant?.price_override || product.price;
    addToCart({ ...product, price, qty, selectedVariant });
    toast.success(`${product.name} added to cart!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist.");
      navigate("/login");
      return;
    }
    const result = await toggleWishlist(product);
    if (result.action === "added") toast.success("Added to wishlist!");
    else if (result.action === "removed") toast.info("Removed from wishlist.");
  };

  if (loading) return <main className="pd-page"><div className="pd-container"><p className="pd-loading">Loading product...</p></div></main>;
  if (!product) return null;

  const p = product;
  const currentPrice = selectedVariant?.price_override || p.price;
  const wishlisted = isLoggedIn && isInWishlist(p.id);

  // Determine variant type
  const variants = p.variants || [];
  const sizeVariants = variants.filter(v => v.variant_type === "size");
  const weightVariants = variants.filter(v => v.variant_type === "weight");

  return (
    <main className="pd-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to="/shop">Shop</Link> <ChevronRight size={14} />
          <Link to={`/shop?category=${encodeURIComponent(p.category?.name || "")}`}>{p.category?.name}</Link> <ChevronRight size={14} />
          <span>{p.name}</span>
        </nav>

        <button className="pd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Main Product */}
        <div className="pd-main">
          <div className="pd-image-section">
            <div className="pd-image-wrap">
              {p.tag && <span className="pd-badge">{p.tag}</span>}
              <img src={p.image} alt={p.name} />
            </div>
          </div>

          <div className="pd-info-section">
            <h1 className="pd-title">{p.name}</h1>

            <div className="pd-rating">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} fill={i <= 4 ? "#f97316" : "none"} stroke={i <= 4 ? "#f97316" : "#64748b"} />
              ))}
              <span>4.0 out of 5</span>
            </div>

            <div className="pd-price-box">
              <span className="pd-price">₹{Number(currentPrice).toLocaleString("en-IN")}</span>
              {p.was && (
                <>
                  <span className="pd-was">₹{Number(p.was).toLocaleString("en-IN")}</span>
                  <span className="pd-off">-{p.off_percent || Math.round(((p.was - currentPrice) / p.was) * 100)}% OFF</span>
                </>
              )}
            </div>

            {showDiscount && (
              <div className="pd-coupon-info">
                <span>🏷️ {couponCode} — Extra {discountPercent}% OFF</span>
                <span className="pd-coupon-price">
                  Now: ₹{applyCoupon(Number(currentPrice)).finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <p className="pd-description">{p.description}</p>

            <div className="pd-stock">
              {p.stock > 0 ? (
                <span className="pd-in-stock">✓ In Stock ({p.stock} available)</span>
              ) : (
                <span className="pd-out-stock">✗ Out of Stock</span>
              )}
            </div>

            {/* Size Variants */}
            {sizeVariants.length > 0 && (
              <div className="pd-variants">
                <label>Size:</label>
                <div className="pd-variant-options">
                  {sizeVariants.map(v => (
                    <button
                      key={v.id}
                      className={`pd-variant-btn ${selectedVariant?.id === v.id ? "active" : ""} ${!v.is_available ? "unavailable" : ""}`}
                      onClick={() => v.is_available && setSelectedVariant(v)}
                      disabled={!v.is_available}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Variants */}
            {weightVariants.length > 0 && (
              <div className="pd-variants">
                <label>Weight:</label>
                <div className="pd-variant-options">
                  {weightVariants.map(v => (
                    <button
                      key={v.id}
                      className={`pd-variant-btn ${selectedVariant?.id === v.id ? "active" : ""} ${!v.is_available ? "unavailable" : ""}`}
                      onClick={() => v.is_available && setSelectedVariant(v)}
                      disabled={!v.is_available}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pd-qty">
              <label>Quantity:</label>
              <div className="pd-qty-controls">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={16} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(p.stock, q + 1))} disabled={qty >= p.stock}><Plus size={16} /></button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pd-actions">
              <button className="pd-btn pd-btn--cart" onClick={handleAddToCart} disabled={p.stock <= 0 || added}>
                <ShoppingCart size={18} />
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button className={`pd-btn pd-btn--wish ${wishlisted ? "active" : ""}`} onClick={handleWishlist}>
                <Heart size={18} fill={wishlisted ? "#ef4444" : "none"} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pd-trust">
              <div className="pd-trust-item"><Truck size={18} /><span>Free Shipping</span></div>
              <div className="pd-trust-item"><Shield size={18} /><span>1-Year Warranty</span></div>
              <div className="pd-trust-item"><RotateCcw size={18} /><span>7-Day Easy Returns</span></div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="pd-related">
            <h2>Related Products — {p.category?.name}</h2>
            <div className="pd-related-grid">
              {related.map(rp => (
                <Link to={`/product/${rp.id}`} key={rp.id} className="pd-related-card">
                  <img src={rp.image} alt={rp.name} />
                  <div>
                    <h4>{rp.name}</h4>
                    <span className="pd-related-price">₹{Number(rp.price).toLocaleString("en-IN")}</span>
                    {rp.was && <span className="pd-related-was">₹{Number(rp.was).toLocaleString("en-IN")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
