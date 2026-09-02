import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import "./Contact.css";
import api from "../api/client";

export default function Contact() {
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      await api.post("/contact/", form);
      setSent(true);
      toast.success("Message sent successfully!");

      // Reset after success animation plays out
      setTimeout(() => {
        setSent(false);
        setForm({ name: "", email: "", message: "" });
      }, 4000);
    } catch (err) {
      toast.error("Could not send message. Please try again.");
      console.error(err.response?.data || err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="ft-page contact">
      <section className="contact-hero">
        <div className="ft-container text-center">
          <span className="ft-eyebrow">Get in touch</span>
          <h1>Contact FitTrack Pro</h1>
          <p>Questions about a bulk order, installation, or a product spec? We reply within one business day.</p>
        </div>
      </section>

      <section className="ft-container contact-layout">
        <div className="contact-info">
          <div className="contact-info__item hover-glow">
            <div className="info-icon">📍</div>
            <div>
              <h3>Showroom</h3>
              <p>FitTrack Pro, GIDC Industrial Estate, Junagadh, Gujarat 362001</p>
            </div>
          </div>

          <div className="contact-info__item hover-glow">
            <div className="info-icon">📞</div>
            <div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="contact-info__item hover-glow">
            <div className="info-icon">✉️</div>
            <div>
              <h3>Email</h3>
              <p>support@fittrackpro.com</p>
            </div>
          </div>

          <div className="contact-info__item hover-glow">
            <div className="info-icon">⏰</div>
            <div>
              <h3>Hours</h3>
              <p>Mon – Sat: 10:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          {sent ? (
            <div className="success-state-container">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
              <h3>Message Sent!</h3>
              <p>We'll get back to you shortly.</p>
            </div>
          ) : (
            <form className="contact-form fade-in-up" onSubmit={handleSubmit}>
              <div className="form-title">
                <h2>Send us a Message</h2>
              </div>

              <div className="floating-input-group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="name">Full Name</label>
              </div>

              <div className="floating-input-group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="floating-input-group">
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="message">How can we help?</label>
              </div>

              <button
                type="submit"
                className={`ft-btn contact-btn ${isSending ? 'sending' : ''}`}
                disabled={isSending}
              >
                <span className="btn-text">{isSending ? 'Sending...' : 'Send Message'}</span>
                <span className="btn-icon paper-plane">✈️</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}