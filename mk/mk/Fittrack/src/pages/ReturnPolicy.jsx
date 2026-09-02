import React, { useEffect, useRef } from "react";
import "./Policy.css";

const SECTIONS = [
  {
    icon: "📦",
    title: "7-Day Return Window",
    text: "You may return most items within 7 days of delivery. The return window begins on the date the product is delivered to your address. Items must be in their original packaging, unused, and in the same condition you received them.",
  },
  {
    icon: "✅",
    title: "Eligible Items",
    points: [
      "All gym equipment (barbells, dumbbells, racks, benches)",
      "Resistance bands, gloves, belts, and other accessories",
      "Protein powders and supplements (unopened sealed only)",
      "Gym clothing and apparel (tags attached, unworn)",
      "Water bottles, shakers, and small accessories",
    ],
  },
  {
    icon: "❌",
    title: "Non-Returnable Items",
    points: [
      "Custom-built or made-to-order equipment",
      "Opened or used protein powders and supplements",
      "Items damaged by the customer through misuse",
      "Products without original packaging or receipt",
      "Items marked as 'Final Sale' during clearance events",
    ],
  },
  {
    icon: "🔄",
    title: "How to Initiate a Return",
    points: [
      "Log in to your FitTrack Pro account and go to My Orders.",
      "Select the order containing the item you want to return.",
      "Click 'Return Item' and select your reason for return.",
      "You will receive a Return Authorization Number (RAN) via email.",
      "Pack the item securely in its original packaging.",
      "Our delivery partner will pick up the item within 2-3 business days.",
    ],
  },
  {
    icon: "🔍",
    title: "Return Inspection",
    text: "Once we receive the returned item, our quality team will inspect it within 2 business days. If the item passes inspection (unused, undamaged, original packaging), your refund will be processed. If the item is found damaged or used, we may offer a partial refund or reject the return.",
  },
  {
    icon: "🚚",
    title: "Return Shipping",
    text: "FitTrack Pro covers return shipping costs for defective or incorrectly shipped items. For other returns (changed mind, wrong size ordered), a flat ₹99 return shipping fee will be deducted from your refund. Free return pickup is available in all major cities.",
  },
];

export default function ReturnPolicy() {
  const sectionRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("policy-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero__badge">📦 Return Policy</div>
        <h1 className="policy-hero__title">Return Policy</h1>
        <p className="policy-hero__subtitle">
          We want you to love your gear. If something isn't right, we make returns simple and hassle-free.
        </p>
        <div className="policy-hero__meta">
          <span>Last updated: January 2025</span>
          <span>•</span>
          <span>Effective immediately</span>
        </div>
      </section>

      <section className="policy-content">
        {SECTIONS.map((section, i) => (
          <div
            className="policy-card"
            key={i}
            ref={(el) => (sectionRefs.current[i] = el)}
          >
            <div className="policy-card__header">
              <span className="policy-card__icon">{section.icon}</span>
              <h2>{section.title}</h2>
            </div>
            {section.text && <p className="policy-card__text">{section.text}</p>}
            {section.points && (
              <ul className="policy-card__list">
                {section.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="policy-card policy-card--highlight">
          <div className="policy-card__header">
            <span className="policy-card__icon">💬</span>
            <h2>Need Help with a Return?</h2>
          </div>
          <p className="policy-card__text">
            Our support team is available Monday to Saturday, 10 AM – 7 PM IST.
          </p>
          <div className="policy-card__contact">
            <a href="mailto:support@fittrackpro.com" className="policy-btn">
              📧 Email Support
            </a>
            <a href="tel:+919876543210" className="policy-btn policy-btn--outline">
              📞 Call Us: +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
