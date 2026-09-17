import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Shield, Truck, RotateCcw, Star, Dumbbell,
  Tag, Check, Users, Heart, Quote, MessageSquare, CreditCard
} from "lucide-react";
import api from "../api/client";
import "./About.css";

/* ═══════════ PROFESSIONAL ECOMMERCE ABOUT PAGE ═══════════ */

const VALUES = [
  { icon: "💎", title: "Quality First", desc: "Every product goes through rigorous quality testing. We only sell what we'd use ourselves — commercial-grade equipment built to last." },
  { icon: "🤝", title: "Customer Trust", desc: "Transparency in pricing, honest reviews, and no hidden charges. Your trust is our biggest asset." },
  { icon: "🚀", title: "Innovation", desc: "Constantly improving — from better products to faster delivery. We listen to our customers and evolve." },
  { icon: "🌱", title: "Sustainability", desc: "Eco-friendly packaging, efficient logistics, and products designed to last for years, not months." },
  { icon: "🇮🇳", title: "Made in India", desc: "Proudly supporting Indian manufacturers and craftsmanship. Building world-class fitness equipment right here." },
  { icon: "❤️", title: "Fitness for All", desc: "From beginners to pro athletes, from home gyms to commercial setups — equipment for every fitness journey." },
];

const JOURNEY = [
  { year: "2022", title: "The Beginning", desc: "FitTrack Pro started in a garage with a single mission — honest fitness equipment at fair prices for Indian homes." },
  { year: "2023", title: "Crossing 10,000 Orders", desc: "Home gyms across India started trusting us. Free delivery rollout across 200+ cities begins." },
  { year: "2024", title: "Full Product Range", desc: "Racks, benches, dumbbells, cardio machines & full gym setups — a complete catalogue under one roof." },
  { year: "2025", title: "Trusted Nationwide", desc: "500+ commercial gyms & trainers now source equipment from us. 4.8★ average rating across verified buyers." },
  { year: "2026", title: "Building the Future", desc: "Expanding categories, faster delivery network, and a community-first approach — this is just the start." },
];

const TEAM = [
  { name: "Kuldipsinh Mahida", role: "Founder & CEO", desc: "Fitness enthusiast turned entrepreneur, on a mission to make quality gym gear accessible to every Indian." },
  { name: "Priya Sharma", role: "Head of Customer Success", desc: "Ensures every order, return & query is handled with care — the voice our customers trust." },
  { name: "Rahul Desai", role: "Product & Sourcing Lead", desc: "Curates and quality-checks every piece of equipment before it reaches the catalogue." },
  { name: "Sneha Patel", role: "Logistics & Operations", desc: "Masters the supply chain so your order dispatches within 24 hours, anywhere in India." },
];

const TRUST_POINTS = [
  { icon: Shield, title: "Secure Payments", desc: "100% encrypted via Razorpay" },
  { icon: Truck, title: "Free Delivery", desc: "Across India on every order" },
  { icon: RotateCcw, title: "7-Day Returns", desc: "No questions asked" },
  { icon: Zap, title: "Fast Dispatch", desc: "Within 24–48 hours" },
  { icon: CreditCard, title: "EMI Available", desc: "On orders above ₹5,000" },
  { icon: Heart, title: "Customer First", desc: "24×7 expert support" },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.unobserve(e.target); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function About() {
  const [heroRef, heroInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [missionRef, missionInView] = useInView();
  const [valuesRef, valuesInView] = useInView();
  const [journeyRef, journeyInView] = useInView();
  const [teamRef, teamInView] = useInView();
  const [trustRef, trustInView] = useInView();
  const [testRef, testInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get("/reviews/")
      .then((res) => {
        if (!cancelled) setReviews(res.data?.results ?? res.data ?? []);
      })
      .catch(() => { if (!cancelled) setReviews([]); })
      .finally(() => { if (!cancelled) setReviewsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const productCount = 50;

  const STATS = [
    { icon: "🏋️", num: `${productCount}+`, label: "Products" },
    { icon: "👥", num: "10,000+", label: "Happy Customers" },
    { icon: "📍", num: "500+", label: "Cities Served" },
    { icon: "⭐", num: "4.8", label: "Average Rating" },
    { icon: "🚚", num: "24H", label: "Dispatch Time" },
    { icon: "🔄", num: "7-Day", label: "Easy Returns" },
  ];

  return (
    <main className="ft-page about-pro">

      {/* ═══ HERO — Brand Story ═══ */}
      <section className={`apro-hero ${heroInView ? "in-view" : ""}`} ref={heroRef}>
        <div className="apro-hero__bg">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=80" alt="Gym" className="apro-hero__bg-img" />
          <div className="apro-hero__overlay"></div>
        </div>
        <div className="ft-container apro-hero__content">
          <div className="apro-hero__badge">
            <span className="apro-hero__badge-dot"></span>
            India's Most Trusted Fitness Equipment Store
          </div>
          <h1 className="apro-hero__title">
            Our Story: <br/>
            <span className="apro-hero__accent">Making Fitness Accessible</span><br/>
            for Every Indian
          </h1>
          <p className="apro-hero__sub">
            FitTrack Pro was born from a simple belief — that every person in India deserves access to
            world-class fitness equipment without paying premium prices. We work directly with manufacturers,
            cutting out the middlemen, so you get commercial-grade quality at factory-direct prices.
          </p>
          <div className="apro-hero__actions">
            <Link to="/shop" className="ft-btn ft-btn--primary apro-hero__btn">
              <Dumbbell size={18} /> Explore Products
            </Link>
            <Link to="/deals" className="ft-btn ft-btn--ghost apro-hero__btn">
              <Tag size={16} /> View Deals
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS BANNER ═══ */}
      <section className={`apro-stats ${statsInView ? "in-view" : ""}`} ref={statsRef}>
        <div className="ft-container">
          <div className="apro-stats__grid">
            {STATS.map((s, i) => (
              <div className="apro-stats__item" key={s.label} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="apro-stats__icon">{s.icon}</span>
                <span className="apro-stats__num">{s.num}</span>
                <span className="apro-stats__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MISSION & VISION ═══ */}
      <section className={`apro-mission ${missionInView ? "in-view" : ""}`} ref={missionRef}>
        <div className="ft-container">
          <div className="apro-mission__grid">
            <div className="apro-mission__card apro-mission__card--mission">
              <div className="apro-mission__card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To make world-class fitness equipment accessible to every Indian — from home gym enthusiasts to commercial gym owners — at prices that don't break the bank. We believe fitness is a right, not a luxury.</p>
            </div>
            <div className="apro-mission__card apro-mission__card--vision">
              <div className="apro-mission__card-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>To become India's most trusted fitness equipment brand — known for quality, affordability, and customer service. We envision a fitter, stronger India powered by FitTrack Pro equipment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT WE OFFER ═══ */}
      <section className={`apro-values ${valuesInView ? "in-view" : ""}`} ref={valuesRef}>
        <div className="ft-container">
          <div className="apro-section-header">
            <span className="apro-eyebrow">🏆 What We Stand For</span>
            <h2>Our Core Values</h2>
            <p className="apro-section-sub">The principles that guide everything we do — from sourcing products to delivering them to your doorstep.</p>
          </div>
          <div className="apro-values__grid">
            {VALUES.map((v, i) => (
              <div className="apro-values__card" key={v.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="apro-values__card-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JOURNEY — TIMELINE ═══ */}
      <section className={`apro-journey ${journeyInView ? "in-view" : ""}`} ref={journeyRef}>
        <div className="ft-container">
          <div className="apro-section-header">
            <span className="apro-eyebrow">🚀 Our Journey</span>
            <h2>How We Got Here</h2>
            <p className="apro-section-sub">From a garage dream to India's trusted fitness equipment destination.</p>
          </div>
          <div className="apro-journey__timeline">
            <div className="apro-journey__line"></div>
            {JOURNEY.map((j, i) => (
              <div className={`apro-journey__item ${i % 2 === 0 ? "left" : "right"}`} key={j.year} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="apro-journey__dot"></div>
                <div className="apro-journey__card">
                  <span className="apro-journey__year">{j.year}</span>
                  <h3>{j.title}</h3>
                  <p>{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className={`apro-team ${teamInView ? "in-view" : ""}`} ref={teamRef}>
        <div className="ft-container">
          <div className="apro-section-header">
            <span className="apro-eyebrow"><Users size={14} /> The People Behind It</span>
            <h2>Meet Our Team</h2>
            <p className="apro-section-sub">A small, obsessed team working hard so you can train harder.</p>
          </div>
          <div className="apro-team__grid">
            {TEAM.map((m, i) => (
              <div className="apro-team__card" key={m.name} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="apro-team__avatar">{m.name.charAt(0)}</div>
                <h3>{m.name}</h3>
                <p className="apro-team__role">{m.role}</p>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className={`apro-test ${testInView ? "in-view" : ""}`} ref={testRef}>
        <div className="ft-container">
          <div className="apro-section-header">
            <span className="apro-eyebrow"><MessageSquare size={14} /> Customer Stories</span>
            <h2>What Our Customers Say About Us</h2>
            <p className="apro-section-sub">Real reviews from real buyers — verified purchases only.</p>
          </div>
          {reviewsLoading ? (
            <div className="apro-test__empty"><div className="rv-spinner" /><p>Loading reviews...</p></div>
          ) : reviews.length === 0 ? (
            <div className="apro-test__empty">
              <MessageSquare size={40} />
              <p>No reviews yet. Be the first to share your experience!</p>
              <Link to="/reviews" className="ft-btn ft-btn--primary">Write a Review</Link>
            </div>
          ) : (
            <div className="apro-test__grid">
              {reviews.map((r, i) => {
                const initial = r.user_name ? r.user_name.charAt(0).toUpperCase() : "U";
                const rating = Math.max(1, Math.min(5, Number(r.rating) || 5));
                return (
                  <div className="apro-test__card" key={r.id || i} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="apro-test__card-top">
                      <div className="apro-test__stars">
                        {Array.from({ length: rating }, (_, j) => <Star key={j} size={14} fill="#FFD60A" color="#FFD60A" />)}
                      </div>
                      <span className="apro-test__verified"><Check size={12} /> Verified</span>
                    </div>
                    <Quote size={20} className="apro-test__quote-icon" />
                    {r.title && <h4 className="apro-test__title">{r.title}</h4>}
                    <p className="apro-test__text">"{r.text}"</p>
                    {r.product_name && <span className="apro-test__product">🏷️ {r.product_name}</span>}
                    <div className="apro-test__author">
                      <div className="apro-test__avatar">{initial}</div>
                      <div>
                        <span className="apro-test__name">{r.user_name || "Anonymous"}</span>
                        {r.role && <span className="apro-test__role">{r.role}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="apro-test__more">
            <Link to="/reviews" className="ft-btn ft-btn--ghost">View All Reviews & Write Yours</Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section className={`apro-trust ${trustInView ? "in-view" : ""}`} ref={trustRef}>
        <div className="ft-container">
          <div className="apro-trust__grid">
            {TRUST_POINTS.map((t) => {
              const Icon = t.icon;
              return (
                <div className="apro-trust__item" key={t.title}>
                  <Icon size={26} />
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className={`apro-cta ${ctaInView ? "in-view" : ""}`} ref={ctaRef}>
        <div className="ft-container apro-cta__inner">
          <div className="apro-cta__content">
            <h2>Ready to Start Your Fitness Journey?</h2>
            <p>{productCount}+ products ready to ship. Join thousands of happy customers and get free delivery across India.</p>
            <div className="apro-cta__actions">
              <Link to="/shop" className="ft-btn ft-btn--primary apro-cta__btn">
                <Dumbbell size={18} /> Shop All Equipment
              </Link>
              <Link to="/deals" className="ft-btn ft-btn--ghost">
                <Tag size={16} /> Today's Deals
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}