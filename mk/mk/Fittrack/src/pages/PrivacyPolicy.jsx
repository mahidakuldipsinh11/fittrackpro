import React, { useEffect, useRef } from "react";
import "./Policy.css";

const SECTIONS = [
  {
    icon: "📋",
    title: "Information We Collect",
    points: [
      "Name, email address, phone number, and delivery address when you create an account.",
      "Payment information (card number, UPI ID) — processed securely through our payment partners. We never store your full card details.",
      "Order history, browsing behavior, and product interactions to personalize your experience.",
      "Device information (browser type, IP address) for security and fraud prevention.",
      "Communications you send us (support tickets, reviews, feedback).",
    ],
  },
  {
    icon: "🎯",
    title: "How We Use Your Information",
    points: [
      "To process and fulfill your orders, including delivery and payment processing.",
      "To send order confirmations, shipping updates, and delivery notifications via email.",
      "To provide customer support and respond to your queries.",
      "To personalize your shopping experience and recommend relevant products.",
      "To detect and prevent fraud, unauthorized access, and other security threats.",
      "To improve our website, products, and services based on usage patterns.",
      "To send promotional emails and offers (only if you opt in — you can unsubscribe anytime).",
    ],
  },
  {
    icon: "🤝",
    title: "Information Sharing",
    text: "We do not sell or rent your personal information to third parties. We may share your information only in these limited circumstances:",
    points: [
      "With delivery partners (name, phone, address) to fulfill your orders.",
      "With payment processors to handle transactions securely.",
      "With analytics tools (Google Analytics) to understand website usage — all data is anonymized.",
      "When required by law, court order, or government regulation.",
      "In the event of a business merger or acquisition (you will be notified).",
    ],
  },
  {
    icon: "🔒",
    title: "Data Security",
    text: "We take your data security seriously. All data is encrypted in transit (SSL/TLS) and at rest. Our payment processing is PCI DSS compliant. We use industry-standard security measures to protect your personal information from unauthorized access, alteration, or deletion.",
  },
  {
    icon: "🍪",
    title: "Cookies & Tracking",
    points: [
      "Essential cookies: Required for the website to function (login, cart, checkout).",
      "Analytics cookies: Help us understand how you use our site (Google Analytics).",
      "Marketing cookies: Used for personalized ads (only if you consent).",
      "You can manage cookie preferences through your browser settings.",
      "Disabling essential cookies may affect website functionality.",
    ],
  },
  {
    icon: "👤",
    title: "Your Rights",
    points: [
      "Access: Request a copy of all personal data we hold about you.",
      "Correction: Request correction of any inaccurate or incomplete data.",
      "Deletion: Request deletion of your account and personal data.",
      "Opt-out: Unsubscribe from marketing emails at any time.",
      "Data Portability: Request your data in a structured, machine-readable format.",
      "To exercise these rights, email us at privacy@fittrackpro.com.",
    ],
  },
  {
    icon: "👶",
    title: "Children's Privacy",
    text: "FitTrack Pro is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will delete it.",
  },
  {
    icon: "📝",
    title: "Policy Changes",
    text: "We may update this Privacy Policy from time to time. Significant changes will be notified via email or a prominent notice on our website. Your continued use of FitTrack Pro after changes constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPolicy() {
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
      <section className="policy-hero policy-hero--privacy">
        <div className="policy-hero__badge">🔒 Privacy Policy</div>
        <h1 className="policy-hero__title">Privacy Policy</h1>
        <p className="policy-hero__subtitle">
          Your privacy matters. We protect your data with the same intensity we build our equipment.
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
            <span className="policy-card__icon">📧</span>
            <h2>Privacy Concerns?</h2>
          </div>
          <p className="policy-card__text">
            If you have questions about how your data is handled, or want to exercise any of your rights, contact our privacy team.
          </p>
          <div className="policy-card__contact">
            <a href="mailto:privacy@fittrackpro.com" className="policy-btn">
              📧 privacy@fittrackpro.com
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
