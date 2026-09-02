import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCoupon } from "../context/CouponContext";
import { useToast } from "../context/ToastContext";
import "./Footer.css";

const TRUST_ITEMS = [
  { icon: "🔒", text: "Secure Checkout" },
  { icon: "🚚", text: "Free Shipping" },
  { icon: "🔄", text: "7-Day Easy Returns" },
  { icon: "📞", text: "24/7 Support" },
];

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.16.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.9L4.4 22H1.3l8.1-9.3L1 2h7l4.9 6.3L18.9 2Zm-1.2 18h1.9L6.4 4H4.3l13.4 16Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { activateCoupon, isCouponActive } = useCoupon();
  const [email, setEmail] = useState("");
  const isLoggedIn = !!JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isLoggedIn) {
      toast.error("Please login first to subscribe!");
      navigate("/login");
      return;
    }
    if (isCouponActive) {
      toast.info("You already have the welcome 10% discount active!");
      setEmail("");
      return;
    }
    const success = await activateCoupon(email);
    if (success === true) toast.success("Subscribed! Welcome 10% discount activated!");
    else if (success === "already_used")
      toast.error("This email has already claimed the welcome discount.");
    else toast.error("Something went wrong. Please try again.");
    setEmail("");
  };

  return (
    <footer className={`ft-footer ${isVisible ? "footer-visible" : ""}`} ref={footerRef}>
      {/* Back to Top */}
      <button className="ft-footer__back-bar" onClick={scrollToTop}>
        Back to top
      </button>

      {/* Trust Strip */}
      <div className="ft-footer__trust">
        {TRUST_ITEMS.map((item) => (
          <div className="ft-footer__trust-item" key={item.text}>
            <span className="ft-footer__trust-icon">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="ft-footer__inner">
        {/* Brand + Subscribe */}
        <div className="ft-footer__col">
          <div className="ft-footer__brand">
            FitTrack <span>Pro</span>
          </div>
          <p>Equipment built for people who don't skip sets.</p>
          <div className="ft-footer__newsletter-wrap">
            <h3 className="ft-footer__newsletter-title">Subscribe</h3>
            <p className="ft-footer__newsletter-desc">Get exclusive deals, new arrivals, and fitness tips.</p>
            {isLoggedIn && isCouponActive ? (
              <div className="ft-footer__newsletter-active">
                <span>✅</span>
                <span>
                  Welcome <strong>10% discount</strong> is active!
                </span>
              </div>
            ) : (
              <form className="ft-footer__newsletter" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
                <button type="submit" aria-label="Subscribe">
                  Subscribe
                </button>
              </form>
            )}
            {!isLoggedIn ? (
              <span className="ft-footer__newsletter-note">
                Please <Link to="/login">login</Link> to subscribe
              </span>
            ) : (
              <span className="ft-footer__newsletter-note">No spam. Unsubscribe anytime.</span>
            )}
          </div>
          <div className="ft-footer__socials">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="ft-footer__col">
          <h3>Shop</h3>
          <Link to="/shop">All Equipment</Link>
          <Link to="/deals">Deals</Link>
          <Link to="/shop?category=Barbells+%26+Plates">Barbells & Plates</Link>
          <Link to="/shop?category=Dumbbells">Dumbbells</Link>
          <Link to="/shop?category=Racks+%26+Rigs">Racks & Rigs</Link>
        </div>

        {/* Company */}
        <div className="ft-footer__col">
          <h3>Company</h3>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/profile">My Account</Link>
          <p style={{ marginTop: "0.5rem" }}>fittrackpro.noreply@gmail.com</p>
          <p>+91 98765 43210</p>
        </div>

        {/* Policies */}
        <div className="ft-footer__col">
          <h3>Policies</h3>
          <Link to="/return-policy">Return Policy</Link>
          <Link to="/refund-policy">Refund Policy</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </div>
      </div>

      {/* Payment Badges */}
      <div className="ft-footer__payments">
        <span className="ft-footer__payments-label">Payment Methods:</span>
        <div className="ft-footer__payments-list">
          <span className="ft-footer__payment-badge">Razorpay</span>
          <span className="ft-footer__payment-badge">COD</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="ft-footer__bottom">
        <div className="ft-footer__bottom-left">
          <span>© {new Date().getFullYear()} FitTrack Pro. All rights reserved.</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
