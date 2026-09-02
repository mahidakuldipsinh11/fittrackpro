import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart } from "lucide-react";
import "./Shop.css";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { useCoupon } from "../context/CouponContext";

const SORTS = ["Featured", "Price: Low to High", "Price: High to Low"];

const getProductBrand = (product) => product.brand || "FitTrack Pro";
const getProductRating = (product) => Number(product.rating || 4);

function ProductCard({ p, index, onViewDetails }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const productRating = getProductRating(p);
  const wishlisted = isInWishlist(p.id);
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  const handleAdd = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!loggedInUser) {
      toast.error("Please login or register before adding items to your cart.");
      navigate("/login");
      return;
    }

    addToCart(p);
    toast.success(`${p.name} added to cart!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";
  };

  const handleWishlist = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!loggedInUser) {
      toast.error("Please login to add items to your wishlist.");
      navigate("/login");
      return;
    }
    const result = await toggleWishlist(p);
    if (result.action === "added") {
      toast.success(`${p.name} added to wishlist! ❤️`);
    } else if (result.action === "removed") {
      toast.info(`${p.name} removed from wishlist.`);
    }
  };

  return (
    <div className="shop-card" style={{ animationDelay: `${index * 60}ms` }}>
      <button type="button" className="shop-card__thumb" onClick={() => onViewDetails(p)} aria-label={`View details for ${p.name}`}>
        {p.tag && <span className="shop-card__badge-tag">{p.tag}</span>}
        <span className={`shop-card__wishlist-btn ${wishlisted ? "is-wishlisted" : ""}`} onClick={(e) => { e.stopPropagation(); handleWishlist(); }} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart size={20} fill={wishlisted ? "#ef4444" : "none"} />
        </span>
        <img
          src={p.image}
          alt={p.name}
          className="shop-card__img"
          loading="lazy"
          onError={handleImageError}
        />
      </button>
      <div className="shop-card__content">
        <span className="shop-card__cat">{p.cat}</span>
        <span className="shop-card__rating" aria-label={`${productRating} out of 5 stars`}>
          ★ {productRating}.0
        </span>
        <h3>{p.name}</h3>
        <p className="shop-card__description">{p.description}</p>

        <div className="shop-card__foot">
          <div className="shop-card__price-box">
            {/* ─── Original price if deal exists ─── */}
            {p.was && (
              <span className="shop-card__original">
                ₹{Number(p.was).toLocaleString("en-IN")}
              </span>
            )}
            {p.was && (
              <span className="shop-card__deal-badge">
                -{Math.round(((p.was - p.price) / p.was) * 100)}% OFF
              </span>
            )}
            <span className="shop-card__price">
              ₹{Number(p.price).toLocaleString("en-IN")}
            </span>
            {/* ─── Additional 10% coupon discount ─── */}
            {showDiscount && (
              <>
                <span className="shop-card__coupon-divider">→</span>
                <span className="shop-card__coupon-badge">🏷️ {couponCode} -{discountPercent}%</span>
                <span className="shop-card__final-price">
                  ₹{applyCoupon(Number(p.price)).finalTotal.toLocaleString("en-IN")}
                </span>
                {p.was && (
                  <span className="shop-card__total-save">
                    Total Save: ₹{(p.was - applyCoupon(Number(p.price)).finalTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            className={`ft-btn ft-btn--primary shop-card__btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={added}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailsModal({ product, relatedProducts, onSelectProduct, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();
  const navigate = useNavigate();
  const rating = getProductRating(product);
  const wishlisted = isInWishlist(product.id);
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  const handleAdd = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!loggedInUser) {
      toast.error("Please login or register before adding items to your cart.");
      onClose();
      navigate("/login");
      return;
    }

    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="product-modal-backdrop" onMouseDown={onClose}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="product-modal__close" onClick={onClose} aria-label="Close product details">×</button>
        <div className="product-modal__top">
          <div className="product-modal__image-wrap"><img src={product.image} alt={product.name} /></div>
          <div className="product-modal__content">
            <p className="product-modal__meta">{product.cat} · {getProductBrand(product)}</p>
            <h2 id="product-details-title">{product.name}</h2>
            <p className="product-modal__rating">★ {rating}.0 out of 5</p>
            <div className="product-modal__price-row">
              {showDiscount ? (
                <>
                  <strong className="shop-card__price--discounted">₹{applyCoupon(Number(product.price)).finalTotal.toLocaleString("en-IN")}</strong>
                  <del>₹{Number(product.price).toLocaleString("en-IN")}</del>
                  <span className="shop-card__coupon-badge">🏷️ {couponCode} -{discountPercent}%</span>
                </>
              ) : (
                <><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>{product.was && <del>₹{Number(product.was).toLocaleString("en-IN")}</del>}</>
              )}
            </div>
            <p className="product-modal__description">{product.description}</p>
            <ul className="product-modal__features"><li>Brand: {getProductBrand(product)}</li><li>Category: {product.cat}</li><li>Secure checkout and downloadable invoice available</li></ul>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button type="button" className="ft-btn ft-btn--primary product-modal__add" onClick={handleAdd}>Add to Cart</button>
              <button
                type="button"
                className="ft-btn ft-btn--ghost product-modal__wishlist"
                style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: wishlisted ? '#ef4444' : undefined, color: wishlisted ? '#ef4444' : undefined }}
                onClick={async () => {
                  const loggedInUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                  if (!loggedInUser) { toast.error('Please login to use wishlist.'); navigate('/login'); return; }
                  const result = await toggleWishlist(product);
                  if (result.action === 'added') toast.success(`${product.name} added to wishlist!`);
                  else if (result.action === 'removed') toast.info(`${product.name} removed from wishlist.`);
                }}
              >
                <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} />
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && <div className="product-modal__related"><h3>Related Equipment</h3><div className="related-products">{relatedProducts.map((item) => <button type="button" className="related-product" key={item.id} onClick={() => onSelectProduct(item)}><img src={item.image} alt="" /><span>{item.name}</span><strong>₹{Number(item.price).toLocaleString("en-IN")}</strong></button>)}</div></div>}
      </section>
    </div>
  );
}

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";
  const [cat, setCat] = useState(initialCat);
  const [brand, setBrand] = useState("All");
  const [rating, setRating] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (p) => {
    setSelectedProduct(p);
  };

  useEffect(() => {
    if (isFiltersOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isFiltersOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setIsFiltersOpen(false); setSelectedProduct(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) {
      setCat(urlCat);
    } else if (!searchParams.has("category") && cat !== "All") {
      setCat("All");
    }
  }, [searchParams]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.cat).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products
      .filter((p) => (cat === "All" ? true : p.cat === cat))
      .filter((p) => (brand === "All" ? true : getProductBrand(p) === brand))
      .filter((p) => (rating === "All" ? true : getProductRating(p) === Number(rating)))
      .filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );

    if (sort === "Price: Low to High")
      list = [...list].sort((a, b) => a.price - b.price);

    if (sort === "Price: High to Low")
      list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [cat, brand, rating, sort, query, products]);

  const brands = useMemo(
    () => [...new Set(products.map(getProductBrand))].sort(),
    [products]
  );
 const relatedProducts = useMemo(() => selectedProduct ? products.filter((item) => item.id !== selectedProduct.id && item.cat === selectedProduct.cat).slice(0, 4) : [], [products, selectedProduct]);

  return (
    <main className="ft-page shop">
      <div className="shop-hero-bg">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80" alt="Gym Equipment" />
        <div className="shop-hero-bg__overlay" />
        <section className="shop-hero ft-container">
          <span className="ft-eyebrow">Full catalogue</span>
          <h1>{cat === "All" ? `Shop All Equipment (${products.length})` : `${cat} (${filtered.length})`}</h1>
          <p>{filtered.length} items found{cat !== "All" ? ` in ${cat}` : ""} — {products.length} total products</p>
          {cat !== "All" && (
            <button className="ft-btn ft-btn--ghost" style={{ marginTop: '1rem', fontSize: '0.82rem', padding: '0.5rem 1rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => { setCat('All'); searchParams.delete('category'); setSearchParams(searchParams, { replace: true }); }}>
              ← View All Equipment
            </button>
          )}
        </section>
      </div>

      <section className="ft-container shop-layout">
        <div className={`filters-backdrop ${isFiltersOpen ? 'is-active' : ''}`} onClick={() => setIsFiltersOpen(false)} />
        <aside className={`shop-filters ${isFiltersOpen ? 'is-open' : ''}`}>
          <button className="filters-close" onClick={() => setIsFiltersOpen(false)} aria-label="Close filters">×</button>
          <div className="shop-filters__block">
            <label htmlFor="search">Search Equipment</label>
            <input
              id="search"
              type="text"
              placeholder="e.g. Barbell, Treadmill, Bench..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="shop-filters__block">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={cat}
              onChange={(e) => { const val = e.target.value; setCat(val); if (val === 'All') { searchParams.delete('category'); } else { searchParams.set('category', val); } setSearchParams(searchParams, { replace: true }); setIsFiltersOpen(false); }}
            >
              <option value="All">All Gym Equipment</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="shop-filters__block">
            <label htmlFor="brand-filter">Brand</label>
            <select
              id="brand-filter"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="All">All Brands</option>
              {brands.map((itemBrand) => <option key={itemBrand} value={itemBrand}>{itemBrand}</option>)}
            </select>
          </div>

          <div className="shop-filters__block">
            <label htmlFor="review-filter">Reviews</label>
            <select
              id="review-filter"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="All">All Equipment</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
        </aside>

        <div className="shop-results">
          <div className="shop-results__bar">
            <button className="filters-toggle" onClick={() => setIsFiltersOpen(true)} aria-expanded={isFiltersOpen} aria-label="Open filters">⚙ Filters</button>
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="shop-grid">
            {filtered.map((p, index) => (
              <ProductCard key={p.id} p={p} index={index} onViewDetails={handleViewDetails} />
            ))}

            {filtered.length === 0 && (
              <div className="shop-empty">
                <p>No equipment matches your search query.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {selectedProduct && <ProductDetailsModal product={selectedProduct} relatedProducts={relatedProducts} onSelectProduct={setSelectedProduct} onClose={() => setSelectedProduct(null)} />}
    </main>
  );
}