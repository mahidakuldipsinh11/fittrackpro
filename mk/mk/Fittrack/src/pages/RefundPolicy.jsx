import React, { useEffect, useRef } from "react";
import "./Policy.css";

const SECTIONS = [
  {
    icon: "💰",
    title: "Refund Overview",
    text: "At FitTrack Pro, we process refunds promptly once a return is approved. Refunds are issued to the original payment method used during checkout. The timeline depends on your payment method and bank processing times.",
  },
  {
    icon: "💳",
    title: "Refund Timelines",
    points: [
      "UPI Payments: Refund within 3-5 business days after approval.",
      "Credit/Debit Card: Refund within 5-7 business days after approval.",
      "Net Banking: Refund within 5-7 business days after approval.",
      "Cash on Delivery (COD): Refund via bank transfer within 7-10 business days. You will need to provide your bank details.",
      "Wallet Payments: Refund within 2-3 business days after approval.",
    ],
  },
  {
    icon: "🔄",
    title: "Order Cancellation Refunds",
    text: "If you cancel an order before it is shipped, you will receive a full refund within 3-5 business days. If you cancel after the order has shipped, the item must be returned first. Once we receive and inspect the returned item, your refund will be processed within 2 business days.",
  },
  {
    icon: "⚠️",
    title: "Deductions & Conditions",
    points: [
      "Original shipping charges are non-refundable unless the return is due to our error.",
      "A return shipping fee of ₹99 applies for returns where the customer changed their mind.",
      "Items returned in damaged or used condition may have a deduction of up to 30% from the refund amount.",
      "Gift wrapping charges are non-refundable.",
      "COD orders: A processing fee of ₹49 will be deducted from the refund.",
    ],
  },
  {
    icon: "🛡️",
    title: "Defective or Wrong Items",
    text: "If you received a defective, damaged, or incorrect item, you are eligible for a full refund with no deductions. We will also arrange a free return pickup from your address. Please report the issue within 48 hours of delivery with photos as proof.",
  },
  {
    icon: "📊",
    title: "Partial Refunds",
    points: [
      "Items returned after the 7-day window (up to 14 days): 70% refund.",
      "Items with missing original packaging: 85% refund.",
      "Items with minor cosmetic damage: 70-85% refund based on condition.",
      "Items used or installed: No refund (warranty claim may apply).",
    ],
  },
  {
    icon: "📞",
    title: "How to Request a Refund",
    points: [
      "Log in to your FitTrack Pro account.",
      "Go to My Orders and select the relevant order.",
      "Click 'Request Refund' and select your reason.",
      "Upload photos if the item is defective or damaged.",
      "Submit the request — our team will review within 24 hours.",
      "Once approved, the refund will be initiated to your original payment method.",
    ],
  },
];

export default function RefundPolicy() {
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
      <section className="policy-hero policy-hero--refund">
        <div className="policy-hero__badge">💰 Refund Policy</div>
        <h1 className="policy-hero__title">Refund Policy</h1>
        <p className="policy-hero__subtitle">
          Transparent refund process. No hidden charges. Your money is safe with us.
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
            <h2>Refund Questions?</h2>
          </div>
          <p className="policy-card__text">
            If your refund hasn't arrived within the stated timeline, reach out to us and we'll investigate immediately.
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
