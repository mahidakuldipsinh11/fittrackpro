import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Shield, Truck, RotateCcw, Dumbbell,
  Tag, Users, Heart, CreditCard
} from "lucide-react";
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
  const [teamRef, teamInView] = useInView();
  const [trustRef, trustInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const productCount = 50;

  const STATS = [
    { icon: "🏋️", num: `${productCount}+`, label: "Products" },
    { icon: "👥", num: "10", label: "Happy Customers" },
    { icon: "📍", num: "5", label: "Cities Served" },
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