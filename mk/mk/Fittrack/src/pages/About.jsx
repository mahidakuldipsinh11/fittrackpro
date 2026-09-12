import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Shield, Truck, RotateCcw, Star, Dumbbell,
  Tag, Check, Phone, ArrowUpRight, Award, Users,
  Package, Heart, Globe, Clock, ChevronRight, Quote, MessageSquare
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
  const [missionRef, missionInView] = useInView();
  const [valuesRef, valuesInView] = useInView();
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

      {/* ═══ FINAL CTA ═══ */}
      <section className={`apro-cta ${ctaInView ? "in-view" : ""}`} ref={ctaRef}>
        <div className="ft-container apro-cta__inner">
          <div className="apro-cta__content">
            <h2>Ready to Start Your Fitness Journey?</h2>
            <p>Join 45+ products who trust FitTrack Pro for their gym equipment needs. Shop now and get free delivery across India.</p>
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
