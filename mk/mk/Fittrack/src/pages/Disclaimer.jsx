import React, { useEffect, useRef } from "react";
import "./Policy.css";

const SECTIONS = [
  {
    icon: "⚖️",
    title: "General Disclaimer",
    text: "The information provided on FitTrack Pro (www.fittrackpro.com) is for general informational and shopping purposes only. All content, product descriptions, specifications, and pricing are subject to change without notice. FitTrack Pro makes no warranties about the completeness, reliability, or accuracy of this information.",
  },
  {
    icon: "🏋️",
    title: "Product Disclaimer",
    points: [
      "Product images are for illustration purposes only. Actual products may vary slightly in color, design, or packaging.",
      "Weights and dimensions listed are approximate and may have minor manufacturing tolerances.",
      "Always consult a fitness professional before using new gym equipment, especially heavy lifting gear.",
      "Follow all safety instructions and guidelines provided with each product.",
      "Maximum weight capacities listed are absolute limits — do not exceed them under any circumstances.",
      "Improper use of gym equipment can result in serious injury. FitTrack Pro is not liable for injuries caused by misuse.",
    ],
  },
  {
    icon: "🏋️‍♂️",
    title: "Fitness Disclaimer",
    text: "The exercises, workouts, and fitness advice mentioned on this website or in any communications are for educational purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified fitness professional before beginning any exercise program, especially if you have any pre-existing health conditions, injuries, or concerns.",
  },
  {
    icon: "💰",
    title: "Pricing Disclaimer",
    points: [
      "All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.",
      "Prices are subject to change without prior notice. The price at the time of checkout is the final price.",
      "Discount percentages are calculated on the Maximum Retail Price (MRP) or original listed price.",
      "The Welcome 10% discount is valid for first-time subscribers only and cannot be combined with other offers.",
      "Product availability and pricing may vary by region and delivery location.",
      "Typographical errors in pricing are subject to correction. If a product is listed at an incorrect price, we reserve the right to cancel the order and issue a full refund.",
    ],
  },
  {
    icon: "🚚",
    title: "Delivery Disclaimer",
    text: "Delivery timelines are estimates and not guaranteed. Factors such as location, weather, holidays, and unforeseen circumstances may cause delays. FitTrack Pro is not responsible for delays caused by courier partners. Risk of loss and title for items pass to you upon delivery.",
  },
  {
    icon: "🔗",
    title: "Third-Party Links",
    text: "Our website may contain links to third-party websites or services that are not owned or controlled by FitTrack Pro. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites. We strongly advise you to read the terms and privacy policy of every site you visit.",
  },
  {
    icon: "📧",
    title: "Email & Communication Disclaimer",
    text: "Any emails, messages, or communications sent to or from FitTrack Pro are intended solely for the individual or entity to whom they are addressed. The content of these communications is confidential and may be privileged. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or use of this information is strictly prohibited.",
  },
  {
    icon: "🛡️",
    title: "Limitation of Liability",
    text: "FitTrack Pro, its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service. Our total liability shall not exceed the amount you paid for the product in question.",
  },
];

export default function Disclaimer() {
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
      <section className="policy-hero policy-hero--disclaimer">
        <div className="policy-hero__badge">⚖️ Disclaimer</div>
        <h1 className="policy-hero__title">Disclaimer</h1>
        <p className="policy-hero__subtitle">
          Important legal information about using FitTrack Pro. Please read carefully.
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
            <span className="policy-card__icon">⚖️</span>
            <h2>Legal Questions?</h2>
          </div>
          <p className="policy-card__text">
            If you have any questions about this disclaimer or need legal clarification, please contact us.
          </p>
          <div className="policy-card__contact">
            <a href="mailto:legal@fittrackpro.com" className="policy-btn">
              📧 legal@fittrackpro.com
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
