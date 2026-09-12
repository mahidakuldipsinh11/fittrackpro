import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare, ThumbsUp, User, ShieldCheck, ChevronDown } from "lucide-react";
import api from "../api/client";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductContext";
import "./Reviews.css";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function StarRating({ rating, onRate, interactive = false, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rv-stars" role={interactive ? "radiogroup" : "img"} aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`rv-star ${(interactive ? (hover || rating) : rating) >= s ? "active" : ""}`}
          onClick={() => interactive && onRate && onRate(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          disabled={!interactive}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          <Star size={size} fill={(interactive ? (hover || rating) : rating) >= s ? "#C8A951" : "none"} stroke={(interactive ? (hover || rating) : rating) >= s ? "#C8A951" : "#666"} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initial = review.user_name ? review.user_name.charAt(0).toUpperCase() : "U";
  const date = new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="rv-card">
      <div className="rv-card__top">
        <StarRating rating={review.rating} />
        <span className="rv-card__date">{date}</span>
      </div>
      {review.title && <h3 className="rv-card__title">{review.title}</h3>}
      <p className="rv-card__text">{review.text}</p>
      {review.product_name && <span className="rv-card__product">🏷️ {review.product_name}</span>}
      <div className="rv-card__author">
        <div className="rv-card__avatar">{initial}</div>
        <div>
          <span className="rv-card__name">{review.user_name || "Anonymous"}</span>
          {review.role && <span className="rv-card__role">{review.role}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const toast = useToast();
  const { products } = useProducts();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [productName, setProductName] = useState("");
  const [role, setRole] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Filtered products for dropdown
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews/");
      setReviews(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();

    const stored = localStorage.getItem("fittrack_token");
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!stored || !user) {
      toast.error("Please login to submit a review.");
      navigate("/login");
      return;
    }

    if (!text.trim()) {
      toast.error("Please write your review.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        text: text.trim(),
        user_name: user.name || undefined,
        user_email: user.email || undefined,
      };
      if (title.trim()) payload.title = title.trim();
      if (productName.trim()) payload.product_name = productName.trim();
      if (role.trim()) payload.role = role.trim();

      await api.post("/reviews/", payload);
      toast.success("Review submitted successfully! 🎉");
      setShowForm(false);
      setRating(5);
      setTitle("");
      setText("");
      setProductName("");
      setRole("");
      setProductSearch("");
      fetchReviews();
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

  const isLoggedIn = !!localStorage.getItem("fittrack_token") && !!JSON.parse(localStorage.getItem("currentUser") || "null");

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <main className="rv-page ft-page">
      {/* Hero */}
      <section className="rv-hero">
        <div className="rv-hero__overlay" />
        <div className="rv-hero__content ft-container">
          <span className="rv-eyebrow">
            <MessageSquare size={16} /> Customer Reviews
          </span>
          <h1>Reviews & Ratings</h1>
          <p>See what our customers are saying about FitTrack Pro</p>
          <div className="rv-hero__stats">
            <div className="rv-hero__stat">
              <span className="rv-hero__stat-num">{avgRating}</span>
              <StarRating rating={Math.round(avgRating)} size={16} />
              <span className="rv-hero__stat-label">Average Rating</span>
            </div>
            <div className="rv-hero__stat-divider" />
            <div className="rv-hero__stat">
              <span className="rv-hero__stat-num">{totalReviews}</span>
              <span className="rv-hero__stat-label">Total Reviews</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ft-container rv-body">
        {/* Rating Breakdown + Write Review */}
        <div className="rv-top-row">
          <div className="rv-breakdown">
            <h3>Rating Breakdown</h3>
            {ratingCounts.map(({ stars, count }) => (
              <div className="rv-bar-row" key={stars}>
                <span className="rv-bar-label">{stars} ★</span>
                <div className="rv-bar-track">
                  <div
                    className="rv-bar-fill"
                    style={{ width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%" }}
                  />
                </div>
                <span className="rv-bar-count">{count}</span>
              </div>
            ))}
          </div>

          <div className="rv-write-box">
            <h3>Write a Review</h3>
            <p>Share your experience with FitTrack Pro products</p>
            {isLoggedIn ? (
              <button className="ft-btn ft-btn--primary rv-write-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "✍️ Write Review"}
              </button>
            ) : (
              <button className="ft-btn ft-btn--primary rv-write-btn" onClick={() => navigate("/login")}>
                Sign In to Review
              </button>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <form className="rv-form" onSubmit={handleSubmit}>
            <h3>Your Review</h3>

            <div className="rv-form__field">
              <label>Your Rating *</label>
              <div className="rv-form__rating">
                <StarRating rating={rating} onRate={setRating} interactive size={28} />
                <span className="rv-form__rating-label">{RATING_LABELS[rating]}</span>
              </div>
            </div>

            <div className="rv-form__field">
              <label>Review Title</label>
              <input type="text" placeholder="Summarize your experience" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
            </div>

            <div className="rv-form__field">
              <label>Your Review *</label>
              <textarea placeholder="Tell others about your experience..." value={text} onChange={(e) => setText(e.target.value)} rows={4} required />
            </div>

            <div className="rv-form__row">
              <div className="rv-form__field rv-form__field--half">
                <label>Product (Optional)</label>
                <div className="rv-product-select">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productName || productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setProductName(""); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="rv-product-dropdown">
                      {filteredProducts.map((p) => (
                        <button type="button" key={p.id} className="rv-product-option" onClick={() => { setProductName(p.name); setProductSearch(""); setShowProductDropdown(false); }}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="rv-form__field rv-form__field--half">
                <label>Your Role (Optional)</label>
                <input type="text" placeholder="e.g. Gym Owner, Fitness Trainer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="ft-btn ft-btn--primary rv-submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="rv-list-header">
          <h2>All Reviews ({totalReviews})</h2>
        </div>

        {loading ? (
          <div className="rv-loading">
            <div className="rv-spinner" />
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rv-empty">
            <MessageSquare size={48} />
            <h3>No Reviews Yet</h3>
            <p>Be the first to share your experience!</p>
            {isLoggedIn && (
              <button className="ft-btn ft-btn--primary" onClick={() => setShowForm(true)}>
                Write a Review
              </button>
            )}
          </div>
        ) : (
          <div className="rv-grid">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
