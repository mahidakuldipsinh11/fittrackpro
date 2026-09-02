import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Truck, RotateCcw, IndianRupee, Zap, ChevronRight, ChevronLeft,
  Quote, Star, Clock, Award, Users, Package, Headphones, ArrowRight,
  Heart, ShoppingCart, Timer, Trophy, Target, Dumbbell, Home as HomeIcon,
  Building2, Swords, Flame, TrendingUp, Gift, Eye, CheckCircle, Phone
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { useCoupon } from "../context/CouponContext";
import api from "../api/client";
import "./Home.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80";

/* ═══════════ HERO BANNER SLIDES ═══════════ */
const HERO_SLIDES = [
  {
    title: "Build Your Dream Gym",
    sub: "Premium fitness equipment at factory-direct prices. 200+ products. Free Pan-India delivery.",
    cta: "Shop Now",
    link: "/shop",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=85",
    badge: "UP TO 40% OFF"
  },
  {
    title: "Commercial-Grade Racks",
    sub: "Heavy-duty power racks, squat stands & cable machines built for 100+ daily users.",
    cta: "Explore Racks",
    link: "/shop?category=Racks+%26+Rigs",
    img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&auto=format&fit=crop&q=85",
    badge: "NEW ARRIVAL"
  },
  {
    title: "Home Gym Starter Kits",
    sub: "Everything you need to start training at home. Complete setups from ₹9,999.",
    cta: "View Kits",
    link: "/shop",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&auto=format&fit=crop&q=85",
    badge: "BEST SELLER"
  }
];

/* ═══════════ CATEGORIES ═══════════ */
const CATEGORIES = [
  { name: "Barbells & Plates", icon: "🏋️", color: "#FF6B35", desc: "Olympic & Bumper Plates", count: "25+" },
  { name: "Racks & Rigs", icon: "🏗️", color: "#4A90D9", desc: "Cages & Power Racks", count: "15+" },
  { name: "Dumbbells", icon: "💪", color: "#2ECC71", desc: "Fixed & Adjustable", count: "30+" },
  { name: "Benches", icon: "🪑", color: "#9B59B6", desc: "Flat & Adjustable", count: "12+" },
  { name: "Cardio", icon: "🏃", color: "#E74C3C", desc: "Treadmills & Bikes", count: "10+" },
];

/* ═══════════ FLASH DEALS BANNER ═══════════ */
const FLASH_DEALS = [
  { name: "Gym Gloves Half Finger", price: 599, was: 899, img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80", discount: 33 },
  { name: "Resistance Band Set", price: 799, was: 1499, img: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300&auto=format&fit=crop&q=80", discount: 47 },
  { name: "Foam Roller 45cm", price: 799, was: 1299, img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&auto=format&fit=crop&q=80", discount: 38 },
  { name: "Wrist Wraps Pro", price: 399, was: 599, img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300&auto=format&fit=crop&q=80", discount: 33 },
  { name: "Jump Rope Speed", price: 399, was: 599, img: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&auto=format&fit=crop&q=80", discount: 33 },
];

/* ═══════════ SHOP BY GOAL ═══════════ */
const GOALS = [
  { title: "Home Gym Starter", desc: "Build your dream home gym with budget-friendly equipment from ₹9,999. Free delivery across India.", icon: HomeIcon, color: "#FF6B35", link: "/shop" },
  { title: "Commercial Gym Setup", desc: "Heavy-duty racks, benches & machines built for 100+ daily users. Professional grade steel.", icon: Building2, color: "#4A90D9", link: "/shop" },
  { title: "CrossFit & HIIT Training", desc: "Bumper plates, pull-up rigs, wall balls, sleds & plyo boxes. Built for intense WODs.", icon: Swords, color: "#2ECC71", link: "/shop" },
  { title: "Powerlifting Gear", desc: "Competition-spec barbells, calibrated plates, deadlift platforms & monolift attachments.", icon: Trophy, color: "#9B59B6", link: "/shop" },
  { title: "Yoga & Recovery", desc: "Premium yoga mats, foam rollers, resistance bands & stretching equipment for recovery.", icon: Target, color: "#E91E63", link: "/shop" },
  { title: "Cardio & Endurance", desc: "Motorized treadmills, exercise bikes, rowing machines & skipping ropes for cardio.", icon: TrendingUp, color: "#E74C3C", link: "/shop" },
];

/* ═══════════ HOW IT WORKS ═══════════ */
const STEPS = [
  { num: "01", title: "Browse & Choose", desc: "Explore 200+ products. Filter by category, price, or rating.", icon: Package },
  { num: "02", title: "Order & Pay", desc: "Secure checkout with Razorpay. UPI, Cards, COD available.", icon: IndianRupee },
  { num: "03", title: "Fast Delivery", desc: "Free Pan-India delivery. Heavy equipment handled with care.", icon: Truck },
  { num: "04", title: "Train & Grow", desc: "1-year warranty. 24/7 support. Your fitness journey starts here.", icon: Dumbbell },
];

/* ═══════════ TESTIMONIALS ═══════════ */
const REVIEWS = [
  { text: "Opened my gym with FitTrack Pro equipment. Saved ₹3 lakhs vs imported brands. Quality is commercial-grade.", author: "Rajesh Kumar", role: "Gym Owner, Mumbai", rating: 5 },
  { text: "Home gym delivered in 3 days. The power rack is bulletproof. Best investment I've made.", author: "Priya Sharma", role: "Fitness Enthusiast, Delhi", rating: 5 },
  { text: "Compared 5 brands. Same steel, same capacity, 40% cheaper. Best decision ever.", author: "Vikram Mehta", role: "Powerlifter, Bangalore", rating: 5 },
  { text: "Excellent customer support. Helped me choose the right equipment. Fast delivery.", author: "Anita Desai", role: "Yoga Instructor, Pune", rating: 5 },
];

/* ═══════════ HOOKS ═══════════ */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return [ref, inView];
}

/* ═══════════ HERO CAROUSEL ═══════════ */
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(p => (p + 1) % HERO_SLIDES.length), 5000);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section className="home-hero-carousel">
      <div className="home-hero-carousel__bg">
        <img src={slide.img} alt={slide.title} key={current} />
        <div className="home-hero-carousel__overlay"></div>
      </div>
      <div className="ft-container home-hero-carousel__content">
        <span className="home-hero-carousel__badge">{slide.badge}</span>
        <h1 className="home-hero-carousel__title">{slide.title}</h1>
        <p className="home-hero-carousel__sub">{slide.sub}</p>
        <Link to={slide.link} className="ft-btn ft-btn--primary home-hero-carousel__btn">
          {slide.cta} <ArrowRight size={18} />
        </Link>
      </div>
      <div className="home-hero-carousel__nav">
        <button onClick={() => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="home-hero-carousel__arrow">
          <ChevronLeft size={24} />
        </button>
        <div className="home-hero-carousel__dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`home-hero-carousel__dot ${i === current ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
        <button onClick={() => goTo((current + 1) % HERO_SLIDES.length)} className="home-hero-carousel__arrow">
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

/* ═══════════ MAIN HOME ═══════════ */
export default function Home() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const toast = useToast();
  const navigate = useNavigate();
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");
  const showDiscount = isLoggedIn && isCouponActive;

  const [catRef, catInView] = useInView();
  const [dealRef, dealInView] = useInView();
  const [bestRef, bestInView] = useInView();
  const [newRef, newInView] = useInView();
  const [goalRef, goalInView] = useInView();
  const [howRef, howInView] = useInView();

  // Horizontal scroll refs
  const catScrollRef = useRef(null);
  const dealScrollRef = useRef(null);
  const bestScrollRef = useRef(null);
  const newScrollRef = useRef(null);

  const scrollLeft = (ref) => { if (ref.current) ref.current.scrollBy({ left: -300, behavior: "smooth" }); };
  const scrollRight = (ref) => { if (ref.current) ref.current.scrollBy({ left: 300, behavior: "smooth" }); };

  const handleImageError = (e) => { e.target.src = FALLBACK_IMAGE; };

  const handleAddToCart = (p) => {
    if (!isLoggedIn) { toast.error("Please login to add items to cart."); navigate("/login"); return; }
    addToCart(p);
    toast.success(`${p.name} added to cart!`);
  };

  const handleToggleWishlist = async (p) => {
    if (!isLoggedIn) { toast.error("Please login to add to wishlist."); navigate("/login"); return; }
    const result = await toggleWishlist(p);
    if (result.action === "added") toast.success(`${p.name} added to wishlist! ❤️`);
    else if (result.action === "removed") toast.info(`${p.name} removed from wishlist.`);
  };

  // Derived product lists
  const dealProducts = useMemo(() => products.filter(p => p.was && Number(p.was) > Number(p.price)).slice(0, 8), [products]);
  const bestSellers = useMemo(() => [...products].sort((a, b) => (b.claimed || 0) - (a.claimed || 0)).slice(0, 8), [products]);
  const newArrivals = useMemo(() => [...products].reverse().slice(0, 8), [products]);
  const trendingProducts = useMemo(() => [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8), [products]);

  return (
    <main className="ft-page home-ecom">

      {/* ═══ HERO CAROUSEL ═══ */}
      <HeroCarousel />

      {/* ═══ CATEGORY GRID ═══ */}
      <section className={`home-categories ${catInView ? "in-view" : ""}`} ref={catRef}>
        <div className="ft-container">
          <div className="home-section-head">
            <div>
              <span className="ft-eyebrow">🎯 Categories</span>
              <h2>Shop by Category</h2>
            </div>
          </div>
          <div className="home-categories__grid">
            {CATEGORIES.map((cat, i) => (
              <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="home-cat-card" key={cat.name} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="home-cat-card__icon" style={{ background: `${cat.color}12`, color: cat.color }}>
                  <span>{cat.icon}</span>
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="home-cat-card__count">{cat.count} Products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOP BY GOAL ═══ */}
      <section className={`home-goals ${goalInView ? "in-view" : ""}`} ref={goalRef}>
        <div className="ft-container">
          <div className="home-section-head">
            <div>
              <span className="ft-eyebrow"><Target size={14} /> Goals</span>
              <h2>Shop by Goal</h2>
            </div>
          </div>
          <div className="home-goals__grid">
            {GOALS.map((g, i) => (
              <Link to={g.link} className="home-goal-card" key={g.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="home-goal-card__icon" style={{ background: `${g.color}12`, color: g.color }}>
                  <g.icon size={28} />
                </div>
                <div>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                </div>
                <ArrowRight size={18} className="home-goal-card__arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className={`home-how ${howInView ? "in-view" : ""}`} ref={howRef}>
        <div className="ft-container">
          <div className="home-section-head">
            <div>
              <span className="ft-eyebrow"><Zap size={14} /> Simple Process</span>
              <h2>How It Works</h2>
            </div>
          </div>
          <div className="home-how__grid">
            {STEPS.map((s, i) => (
              <div className="home-how-card" key={s.num} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="home-how-card__num">{s.num}</div>
                <div className="home-how-card__icon"><s.icon size={28} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && <div className="home-how-card__arrow"><ArrowRight size={18} /></div>}
              </div>
            ))}
          </div>
          <div className="home-how__cta">
            <Link to="/shop" className="ft-btn ft-btn--primary"><Zap size={18} /> Start Shopping</Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="home-testimonials">
        <div className="ft-container">
          <div className="home-section-head">
            <div>
              <span className="ft-eyebrow"><Quote size={14} /> Testimonials</span>
              <h2>What Our Customers Say</h2>
            </div>
          </div>
          <div className="home-testimonials__grid">
            {REVIEWS.map((r, i) => (
              <div className="home-test-card" key={r.author} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="home-test-card__stars">
                  {Array.from({ length: r.rating }, (_, j) => <Star key={j} size={14} fill="#FFD60A" color="#FFD60A" />)}
                </div>
                <p className="home-test-card__text">"{r.text}"</p>
                <div className="home-test-card__author">
                  <div className="home-test-card__avatar">{r.author.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                  <div>
                    <span className="home-test-card__name">{r.author}</span>
                    <span className="home-test-card__role">{r.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="home-final-cta">
        <div className="ft-container home-final-cta__inner">
          <h2>Ready to Build Your Dream Gym?</h2>
          <p>Join 50+ athletes who trust FitTrack Pro. Shop now and get free delivery across India.</p>
          <div className="home-final-cta__actions">
            <Link to="/shop" className="ft-btn ft-btn--primary"><Dumbbell size={18} /> Shop All Equipment</Link>
            <Link to="/deals" className="ft-btn ft-btn--ghost"><Flame size={16} /> Today's Deals</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
