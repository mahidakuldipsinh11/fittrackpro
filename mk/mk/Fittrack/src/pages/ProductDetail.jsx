import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, ChevronRight, Plus, Minus, MessageSquare, Send } from "lucide-react";
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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRole, setReviewRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reviewsRef = useRef(null);

  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch reviews for this product
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    api.get("/reviews/", { params: { product_name: product.name } })
      .then((res) => setReviews(res.data.results || res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product?.name]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to submit a review.");
      navigate("/login");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write your review.");
      return;
    }
    setSubmitting(true);
    try {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "null");
      const payload = {
        rating: reviewRating,
        text: reviewText.trim(),
        user_name: userData?.name || undefined,
        user_email: userData?.email || undefined,
        product_name: product.name,
      };
      if (reviewTitle.trim()) payload.title = reviewTitle.trim();
      if (reviewRole.trim()) payload.role = reviewRole.trim();
      await api.post("/reviews/", payload);
      toast.success("Review submitted! Thank you. 🎉");
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewTitle("");
      setReviewText("");
      setReviewRole("");
      const res = await api.get("/reviews/", { params: { product_name: product.name } });
      setReviews(res.data.results || res.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Please login to submit a review.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.detail || "Failed to submit review. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  // Review stats
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "0";
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => Number(rev.rating) === r).length,
  }));

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
                <Star key={i} size={16} fill={i <= Math.round(Number(avgRating)) ? "#f97316" : "none"} stroke={i <= Math.round(Number(avgRating)) ? "#f97316" : "#64748b"} />
              ))}
              <span>{avgRating} out of 5 {reviews.length > 0 && `(${reviews.length} review${reviews.length > 1 ? "s" : ""})`}</span>
              {reviews.length > 0 && <button className="pd-reviews-link" onClick={scrollToReviews}>View Reviews</button>}
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

        {/* Reviews Section */}
        <section className="pd-reviews" ref={reviewsRef}>
          <div className="pd-reviews__head">
            <div>
              <h2><MessageSquare size={20} /> Customer Reviews</h2>
              <p>
                {reviewsLoading ? "Loading reviews..." : reviews.length > 0
                  ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} for ${p.name}`
                  : "No reviews yet for this product. Be the first to review!"}
              </p>
            </div>
            {!showReviewForm && (
              <button className="pd-review-btn" onClick={() => setShowReviewForm(true)}>
                ✍️ Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="pd-reviews__summary">
              <div className="pd-avg">
                <span className="pd-avg-num">{avgRating}</span>
                <div className="rv-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(Number(avgRating)) ? "#C8A951" : "none"} stroke={s <= Math.round(Number(avgRating)) ? "#C8A951" : "#888"} />
                  ))}
                </div>
                <span className="pd-avg-count">Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}</span>
              </div>
              <div className="pd-rating-bars">
                {ratingCounts.map(({ stars, count }) => (
                  <div className="rv-bar-row" key={stars}>
                    <span className="rv-bar-label">{stars} ★</span>
                    <div className="rv-bar-track">
                      <div className="rv-bar-fill" style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }} />
                    </div>
                    <span className="rv-bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showReviewForm && (
            <form className="pd-review-form" onSubmit={handleSubmitReview}>
              <h3>Write a Review for {p.name}</h3>
              <div className="rv-form__field">
                <label>Your Rating *</label>
                <div className="rv-form__rating">
                  <div className="rv-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`rv-star ${(reviewHover || reviewRating) >= s ? "active" : ""}`}
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setReviewHover(s)}
                        onMouseLeave={() => setReviewHover(0)}
                        aria-label={`${s} star`}
                      >
                        <Star size={24} fill={(reviewHover || reviewRating) >= s ? "#C8A951" : "none"} stroke={(reviewHover || reviewRating) >= s ? "#C8A951" : "#666"} />
                      </button>
                    ))}
                  </div>
                  <span className="rv-form__rating-label">{["Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating - 1]}</span>
                </div>
              </div>
              <div className="rv-form__field">
                <label>Review Title</label>
                <input type="text" placeholder="Summarize your experience" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} maxLength={200} />
              </div>
              <div className="rv-form__field">
                <label>Your Review *</label>
                <textarea placeholder="Tell others about your experience with this product..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} required />
              </div>
              <div className="rv-form__row">
                <div className="rv-form__field">
                  <label>Your Role (Optional)</label>
                  <input type="text" placeholder="e.g. Gym Owner, Fitness Trainer" value={reviewRole} onChange={(e) => setReviewRole(e.target.value)} />
                </div>
              </div>
              <div className="pd-review-actions">
                <button type="submit" className="pd-review-submit" disabled={submitting}>
                  <Send size={16} /> {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button type="button" className="pd-review-cancel" onClick={() => setShowReviewForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {reviewsLoading ? (
            <div className="pd-reviews__empty"><div className="rv-spinner" /><p>Loading reviews...</p></div>
          ) : reviews.length === 0 ? (
            <div className="pd-reviews__empty">
              <MessageSquare size={40} />
              <p>No reviews yet. Be the first to share your experience with this product!</p>
              {isLoggedIn && !showReviewForm && (
                <button className="pd-review-btn" onClick={() => setShowReviewForm(true)}>Write a Review</button>
              )}
            </div>
          ) : (
            <div className="rv-grid pd-review-grid">
              {reviews.map((review) => {
                const initial = review.user_name ? review.user_name.charAt(0).toUpperCase() : "U";
                const date = new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
                return (
                  <div className="rv-card" key={review.id}>
                    <div className="rv-card__top">
                      <div className="rv-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= Number(review.rating) ? "#C8A951" : "none"} stroke={s <= Number(review.rating) ? "#C8A951" : "#888"} />
                        ))}
                      </div>
                      <span className="rv-card__date">{date}</span>
                    </div>
                    {review.title && <h3 className="rv-card__title">{review.title}</h3>}
                    <p className="rv-card__text">{review.text}</p>
                    <div className="rv-card__author">
                      <div className="rv-card__avatar">{initial}</div>
                      <div>
                        <span className="rv-card__name">{review.user_name || "Anonymous"}</span>
                        {review.role && <span className="rv-card__role">{review.role}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!showReviewForm && !isLoggedIn && reviews.length === 0 && (
            <button className="pd-review-btn" onClick={() => { navigate("/login"); }}>
              Sign In to Write a Review
            </button>
          )}
        </section>

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
