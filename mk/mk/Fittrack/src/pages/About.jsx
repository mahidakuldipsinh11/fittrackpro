import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Shield, Truck, RotateCcw, Star, Dumbbell,
  Tag, Check, Phone, ArrowUpRight, Award, Users,
  Package, Heart, Globe, Clock, ChevronRight, Quote
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

const TESTIMONIALS = [
  { text: "Opened my gym with FitTrack Pro equipment. Saved ₹3 lakhs vs imported brands. Quality is commercial-grade — members love it.", author: "Rajesh Kumar", role: "Gym Owner, Mumbai", initials: "RK", rating: 5 },
  { text: "Home gym delivered in 3 days. The power rack is bulletproof. Best investment I've made for my fitness journey.", author: "Priya Sharma", role: "Fitness Enthusiast, Delhi", initials: "PS", rating: 5 },
  { text: "Compared 5 brands. Same steel, same capacity, 40% cheaper. Switched my entire gym to FitTrack Pro. Best decision ever.", author: "Vikram Mehta", role: "Powerlifter, Bangalore", initials: "VM", rating: 5 },
  { text: "Excellent customer support. They helped me choose the right equipment for my home gym. Delivery was fast and hassle-free.", author: "Anita Desai", role: "Yoga Instructor, Pune", initials: "AD", rating: 5 },
  { text: "The quality of dumbbells and barbells is outstanding. At this price point, nothing else comes close in India.", author: "Suresh Patel", role: "CrossFit Box Owner, Ahmedabad", initials: "SP", rating: 5 },
  { text: "Bought a complete gym setup for my society. FitTrack Pro gave us bulk pricing and free installation. Amazing service!", author: "Meena Iyer", role: "Apartment Complex, Chennai", initials: "MI", rating: 5 },
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
            <span className="apro-eyebrow">💬 Customer Stories</span>
            <h2>What Our Customers Say About Us</h2>
            <p className="apro-section-sub">Real reviews from real buyers — verified purchases only.</p>
          </div>
          <div className="apro-test__grid">
            {TESTIMONIALS.map((r, i) => (
              <div className="apro-test__card" key={r.author} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="apro-test__card-top">
                  <div className="apro-test__stars">
                    {Array.from({ length: r.rating }, (_, j) => <Star key={j} size={14} fill="#FFD60A" color="#FFD60A" />)}
                  </div>
                  <span className="apro-test__verified">✓ Verified Purchase</span>
                </div>
                <Quote size={20} className="apro-test__quote-icon" />
                <p className="apro-test__text">{r.text}</p>
                <div className="apro-test__author">
                  <div className="apro-test__avatar">{r.initials}</div>
                  <div>
                    <span className="apro-test__name">{r.author}</span>
                    <span className="apro-test__role">{r.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className={`apro-cta ${ctaInView ? "in-view" : ""}`} ref={ctaRef}>
        <div className="ft-container apro-cta__inner">
          <div className="apro-cta__content">
            <h2>Ready to Start Your Fitness Journey?</h2>
            <p>Join 50,000+ athletes who trust FitTrack Pro for their gym equipment needs. Shop now and get free delivery across India.</p>
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
