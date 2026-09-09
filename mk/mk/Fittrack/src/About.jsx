import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useReviews } from "./context/ReviewsContext";
import { useNavigate } from "react-router-dom";
import {
  Users, Star, Target, MapPin, Phone, Mail, Clock,
  Award, CheckCircle, Truck, RotateCcw, Shield,
  ArrowRight, ChevronRight, Facebook, Twitter, Instagram, Youtube
} from "lucide-react";
import "./About.css";

const TABS = [
  { id: "_team-tab", label: "Meet the Team", icon: Users },
  { id: "_review-tab", label: "Testimonials", icon: Star },
  { id: "_mission-tab", label: "Our Mission", icon: Target },
];

export default function About() {
  const { panel, setPanel } = useState("_team-tab");
  const [openFaq, setOpenFaq] = useState(null);
  const reviews = useReviews();
  const [sectionRef, setSectionRef] = useState(null);
  const aboutViewer = window.__FITTRACK_ABOUT__;
  const dispatch = useNavigate();
  const isViewer = !!aboutViewer;

  useEffect(() => {
    if (isViewer && aboutViewer.fragment) {
      const el = document.querySelector(aboutViewer.fragment);
      if (el) el.scrollIntoView();
    }
  }, [isViewer, aboutViewer.fragment]);

  useEffect(() => {
    if (isViewer) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.body.style.width = "100vw";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.boxShadow = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.width = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.boxShadow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.width = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.boxShadow = "";
    };
  }, [isViewer]);

  useEffect(() => {
    if (isViewer) {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach((a) => {
        a.setAttribute("target", "_self");
      });
    }
  }, [isViewer]);

  return (
    <>
      <div
        id="about"
        ref={(node) => { if (node) setSectionRef(node); }}
        className={"about-page" + (isViewer ? " about-page--viewer" : "")}
      >
        {/* ─── HERO ─── */}
        <section className="about-hero">
          <div className="about-hero__bg">
            <div className="shape shape--1" />
            <div className="shape shape--2" />
            <div className="shape shape--3" />
          </div>

          {isViewer && <div className="about-hero__viewer-tag">FitTrack PRO — Shop Analytics</div>}

          <div className="about-hero__content">
            <div className="container">
              <div className="about-hero__text">
                <span className="badge badge--gold badge--sm">
                  <Award size={12} /> India's Trusted Fitness Store
                </span>
                <h1 className="about-hero__title">
                  About <span className="gradient-text">FitTrack PRO</span>
                </h1>
                <p className="about-hero__sub">
                  Your one-stop destination for premium gym equipment, supplements,
                  apparel & accessories — engineered for performance, priced for everyone.
                </p>
                <div className="about-hero__cta">
                  <a href="#_team-tab" className="btn btn--primary btn--lg">
                    Our Story <ArrowRight size={18} />
                  </a>
                  <a href="#_mission-tab" className="btn btn--outline btn--lg">
                    Our Mission <ChevronRight size={18} />
                  </a>
                </div>
              </div>
              <div className="about-hero__stats">
                <div className="stat">
                  <span className="stat__num">200+</span>
                  <span className="stat__label">Products</span>
                </div>
                <div className="stat">
                  <span className="stat__num">50K+</span>
                  <span className="stat__label">Happy Customers</span>
                </div>
                <div className="stat">
                  <span className="stat__num">26</span>
                  <span className="stat__label">States Covered</span>
                </div>
                <div className="stat">
                  <span className="stat__num">4.9★</span>
                  <span className="stat__label">Avg. Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STORY ─── */}
        <section className="about-story" id="our-story">
          <div className="container">
            <div className="about-story__grid">
              <div className="about-story__vis">
                <div className="about-story__img">
                  <div className="about-story__img-placeholder">
                    <img
                      src="/assets/team-hero.jpg"
                      alt="FitTrack PRO team"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="about-story__img-fallback">
                      <Target size={48} />
                      <span>FitTrack PRO</span>
                    </div>
                  </div>
                </div>
                <div className="about-story__counter">
                  <span className="badge badge--black badge--sm">Est. 2023</span>
                  <p className="about-story__counter-text">
                    Built by fitness enthusiasts for fitness enthusiasts.
                  </p>
                </div>
              </div>
              <div className="about-story__copy">
                <span className="section-sub">Who We Are</span>
                <h2 className="section-title">
                  Built on Passion. Powered by People.
                </h2>
                <p className="section-text">
                  FitTrack PRO started as a small effort to bring genuine, high-quality fitness
                  equipment and supplements to Indian athletes, home gym builders, and fitness
                  lovers — at honest prices. What began as a single warehouse has grown into a
                  trusted fitness destination trusted by thousands.
                </p>
                <p className="section-text">
                  We work directly with manufacturers, quality-check every product before it
                  reaches you, and offer India-wide delivery with reliable after-sales support.
                </p>
                <div className="about-story__values">
                  {[
                    { icon: Truck, title: "Fast Delivery", desc: "Pan-India shipping with tracking" },
                    { icon: Shield, title: "Quality First", desc: "Every product tested & verified" },
                    { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free replacement policy" },
                    { icon: Award, title: "Expert Support", desc: "Real fitness advice, not bots" },
                  ].map((v) => (
                    <div key={v.title} className="value-card">
                      <div className="value-card__icon">
                        <v.icon size={22} />
                      </div>
                      <div>
                        <h4 className="value-card__title">{v.title}</h4>
                        <p className="value-card__desc">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TABS ─── */}
        <section className="about-tabs">
          <div className="container">
            <div className="about-tabs__nav">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`about-tabs__tab ${panel === t.id ? "active" : ""}`}
                  onClick={() => setPanel(t.id)}
                >
                  <t.icon size={18} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="about-tabs__content">
              {/* Team */}
              {panel === "_team-tab" && (
                <div className="otab">
                  <div className="otab__story">
                    <div className="otab__story-head">
                      <Users className="icon--tl" />
                      <h3>Meet the Team</h3>
                    </div>
                    <p className="otab__story-sub">
                      The people behind FitTrack PRO.
                    </p>

                    <div className="team-grid">
                      {[
                        {
                          name: "Rajesh Kumar",
                          role: "Founder & CEO",
                          bio: "Former athlete. 10+ years in fitness retail.",
                          img: "/assets/team-1.jpg",
                        },
                        {
                          name: "Priya Sharma",
                          role: "Head of Operations",
                          bio: "Supply chain expert. Ensures every order reaches you.",
                          img: "/assets/team-2.jpg",
                        },
                        {
                          name: "Amit Verma",
                          role: "Fitness Advisor",
                          bio: "Certified personal trainer. Helps you choose the right gear.",
                          img: "/assets/team-3.jpg",
                        },
                        {
                          name: "Sneha Patel",
                          role: "Customer Care Lead",
                          bio: "Quick responses, real solutions, zero runaround.",
                          img: "/assets/team-4.jpg",
                        },
                      ].map((m) => (
                        <div key={m.name} className="team-card">
                          <div className="team-card__img">
                            <img
                              src={m.img}
                              alt={m.name}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <div className="team-card__img-fallback">
                              <Users size={32} />
                            </div>
                          </div>
                          <div className="team-card__info">
                            <h4 className="team-card__name">{m.name}</h4>
                            <p className="team-card__role">{m.role}</p>
                            <p className="team-card__bio">{m.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {panel === "_review-tab" && (
                <div className="otab">
                  <div className="otab__story">
                    <div className="otab__story-head">
                      <Star className="icon--tl" />
                      <h3>What Our Customers Say</h3>
                    </div>
                    <p className="otab__story-sub">
                      Real reviews from real buyers.
                    </p>

                    {reviews.length === 0 ? (
                      <div className="otab__empty">
                        <Star className="icon--xl icon--gold" />
                        <p>No reviews yet. Be the first to review a product!</p>
                        <a href="/reviews" className="btn btn--primary btn--sm">
                          Write a Review <ArrowRight size={16} />
                        </a>
                      </div>
                    ) : (
                      <div className="review-grid">
                        {reviews.slice(0, 6).map((r) => (
                          <div key={r.id} className="review-card">
                            <div className="review-card__top">
                              <div className="review-card__avatar">
                                {(r.user?.name || r.user?.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="review-card__meta">
                                <p className="review-card__name">{r.user?.name || r.user?.email || "Anonymous"}</p>
                                <div className="review-card__stars">
                                  {Array.from({ length: r.rating || 5 }).map((_, i) => (
                                    <Star key={i} size={14} className="star--gold" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="review-card__title">{r.title}</p>
                            <p className="review-card__text">{r.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mission */}
              {panel === "_mission-tab" && (
                <div className="otab">
                  <div className="otab__story">
                    <div className="otab__story-head">
                      <Target className="icon--tl" />
                      <h3>Our Mission</h3>
                    </div>
                    <p className="otab__story-sub">
                      Why FitTrack PRO exists.
                    </p>
                    <div className="mission-grid">
                      {[
                        {
                          icon: Target,
                          title: "Quality for All",
                          text: "Every athlete deserves real equipment — not cheap imitations. We source the best and keep prices fair.",
                        },
                        {
                          icon: Truck,
                          title: "India-Wide Reach",
                          text: "From Kashmir to Kanyakumari — fitness gear should be accessible to everyone, everywhere.",
                        },
                        {
                          icon: Shield,
                          title: "Trust & Transparency",
                          text: "No hidden charges, no fake reviews, no shortcuts. Just honest products and honest service.",
                        },
                        {
                          icon: Award,
                          title: "Build Better Bodies",
                          text: "We don't just sell gear — we help you build better routines, better form, better results.",
                        },
                      ].map((m) => (
                        <div key={m.title} className="mission-card">
                          <div className="mission-card__icon">
                            <m.icon size={24} />
                          </div>
                          <h4>{m.title}</h4>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section className="about-contact" id="contact-us">
          <div className="container">
            <div className="about-contact__grid">
              <div className="about-contact__info">
                <span className="section-sub">Get In Touch</span>
                <h2 className="section-title">
                  Have a Question? We're Here.
                </h2>
                <p className="section-text">
                  Reach out to us for product queries, bulk orders, or anything else.
                </p>
                <div className="contact-list">
                  {[
                    { icon: MapPin, label: "Address", value: "FitTrack PRO, Industrial Area, Delhi, India" },
                    { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                    { icon: Mail, label: "Email", value: "support@fittrackpro.com" },
                    { icon: Clock, label: "Hours", value: "Mon–Sat: 9 AM – 8 PM" },
                  ].map((c) => (
                    <div key={c.label} className="contact-item">
                      <div className="contact-item__icon">
                        <c.icon size={18} />
                      </div>
                      <div>
                        <p className="contact-item__label">{c.label}</p>
                        <p className="contact-item__value">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="about-contact__social">
                  <a href="#" className="social-link" aria-label="Facebook"><Facebook size={20} /></a>
                  <a href="#" className="social-link" aria-label="Twitter"><Twitter size={20} /></a>
                  <a href="#" className="social-link" aria-label="Instagram"><Instagram size={20} /></a>
                  <a href="#" className="social-link" aria-label="YouTube"><Youtube size={20} /></a>
                </div>
              </div>
              <div className="about-contact__form">
                <h3 className="about-contact__form-title">Send Us a Message</h3>
                <form className="contact-form" action="/contact" method="POST">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cf-name">Full Name</label>
                      <input id="cf-name" type="text" name="name" required placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cf-email">Email Address</label>
                      <input id="cf-email" type="email" name="email" required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-subject">Subject</label>
                    <input id="cf-subject" type="text" name="subject" placeholder="How can we help?" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-message">Message</label>
                    <textarea id="cf-message" name="message" rows={4} required placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className="btn btn--primary btn--lg btn--full">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="about-faq" id="faq">
          <div className="container">
            <div className="about-faq__header">
              <span className="section-sub">FAQ</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <div className="faq-list">
              {[
                {
                  q: "How long does delivery take?",
                  a: "Most orders are delivered in 3–7 business days across India. Remote areas may take up to 10 days. You'll receive tracking details once your order ships.",
                },
                {
                  q: "Do you offer cash on delivery?",
                  a: "Yes. We offer COD for select pin codes. Choose COD at checkout if available for your area.",
                },
                {
                  q: "What is your return policy?",
                  a: "Unopened, undamaged products can be returned within 7 days of delivery. Opened products are eligible for replacement in case of manufacturing defects.",
                },
                {
                  q: "Are your supplements genuine?",
                  a: "Absolutely. We source directly from manufacturers and brands. Every batch is quality-checked before it reaches you.",
                },
                {
                  q: "Can I track my order?",
                  a: "Yes. Once your order ships, you'll receive a tracking link via SMS and email. You can also check status in My Orders.",
                },
                {
                  q: "Do you ship internationally?",
                  a: "Currently we ship only within India. International shipping is coming soon.",
                },
              ].map((f, i) => (
                <div key={i} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{f.q}</span>
                    <ChevronRight
                      size={18}
                      className={`faq-icon ${openFaq === i ? "rotate" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BOTTOM CTA ─── */}
        <section className="about-cta">
          <div className="container">
            <div className="about-cta__inner">
              <div className="about-cta__text">
                <h2 className="about-cta__title">Ready to Upgrade Your Gym?</h2>
                <p className="about-cta__sub">
                  Thousands of athletes already trust FitTrack PRO. Join them today.
                </p>
                <a href="/shop" className="btn btn--primary btn--lg">
                  Shop Now <ArrowRight size={18} />
                </a>
              </div>
              <div className="about-cta__num">
                <span className="about-cta__big-num">200+</span>
                <p className="about-cta__caption">Products to choose from</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
