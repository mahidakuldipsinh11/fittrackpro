import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, ShoppingBag, Home, CircleCheck, PackageCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import "./OrderTracking.css";

const STEPS = [
  { key: "Confirmed", label: "Order Confirmed", icon: <CircleCheck size={22} />, desc: "Your order has been placed successfully" },
  { key: "Processing", label: "Processing", icon: <Package size={22} />, desc: "We are preparing your items" },
  { key: "Shipped", label: "Shipped", icon: <Truck size={22} />, desc: "Your package is on its way" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: <Truck size={22} />, desc: "Your package is out for delivery today" },
  { key: "Delivered", label: "Delivered", icon: <PackageCheck size={22} />, desc: "Your package has been delivered" },
];  const STATUS_INDEX = {
  Confirmed: 0,
  Processing: 1,
  Shipped: 2,
  "Out for Delivery": 3,
  Delivered: 4,
  Cancelled: -1,
  Returned: -1,
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchTracking(orderId);
    } else {
      fetchOrders();
    }
  }, [orderId]);

  const fetchTracking = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}/tracking/`);
      setData(res.data);
    } catch (err) {
      setError("Order not found or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/");
      const allOrders = res.data.results || res.data || [];
      setOrders(allOrders.filter(o => o.status !== 'Returned'));
    } catch {
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  // Orders list view
  if (!orderId) {
    return (
      <main className="ot-page">
        <div className="ot-container">
          <Link to="/profile" className="ot-back"><ArrowLeft size={18} /> Back to Profile</Link>
          <h1>My Orders</h1>
          {loading && <p className="ot-loading">Loading orders...</p>}
          {error && <p className="ot-error">{error}</p>}
          {!loading && orders.length === 0 && (
            <div className="ot-empty">
              <ShoppingBag size={56} />
              <h2>No Orders Yet</h2>
              <p>Start shopping to see your orders here</p>
              <Link to="/shop" className="ot-btn">Start Shopping</Link>
            </div>
          )}
          <div className="ot-orders-list">
            {orders.map((o) => (
              <Link to={`/orders/${o.order_id}`} key={o.order_id} className="ot-order-card">
                <div className="ot-order-left">
                  <div className={`ot-order-status-dot ot-order-status-dot--${o.status.toLowerCase().replace(/\s/g, "-")}`} />
                  <div className="ot-order-info">
                    <strong>Order Placed</strong>
                    <span className="ot-order-date">{o.date}</span>
                    <span className="ot-order-items">{o.total_items} item{o.total_items > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="ot-order-right">
                  <span className={`ot-status ot-status--${o.status.toLowerCase().replace(/\s/g, "-")}`}>
                    {o.status}
                  </span>
                  <span className="ot-total">₹{Number(o.total).toLocaleString("en-IN")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Single order tracking view
  const currentIdx = data ? STATUS_INDEX[data.status] ?? -1 : -1;
  const progress = currentIdx >= 0 ? ((currentIdx + 1) / STEPS.length) * 100 : 0;

  return (
    <main className="ot-page">
      <div className="ot-container">
        <Link to="/orders" className="ot-back"><ArrowLeft size={18} /> All Orders</Link>
        {loading && <p className="ot-loading">Loading tracking...</p>}
        {error && <p className="ot-error">{error}</p>}

        {data && (
          <>
            {/* Order Header */}
            <div className="ot-header">
              <div className="ot-header-left">
                <h1>Order #{data.order_id}</h1>
                <p className="ot-order-date-big">{data.date || "Recently placed"}</p>
              </div>
              <div className="ot-header-right">
                <span className={`ot-status ot-status--${data.status.toLowerCase().replace(/\s/g, "-")} ot-status--large`}>
                  {data.status}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {data.status !== "Cancelled" && (
              <div className="ot-progress-card">
                <div className="ot-progress-header">
                  <span className="ot-progress-title">
                    {currentIdx < 4 ? `Estimated Delivery: 3-5 business days` : `Delivered successfully!`}
                  </span>
                  <span className="ot-progress-pct">{Math.round(progress)}%</span>
                </div>
                <div className="ot-progress-bar-wrap">
                  <div className="ot-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Timeline Steps */}
            {data.status !== "Cancelled" && (
              <div className="ot-timeline-card">
                <div className="ot-timeline">
                  {STEPS.map((step, i) => {
                    const isDone = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    const isLast = i === STEPS.length - 1;
                    // Find the tracking entry for this step
                    const trackingEntry = (data.tracking || []).find(t => t.status === step.key);

                    return (
                      <div key={step.key} className={`ot-step ${isDone ? "ot-step--done" : ""} ${isCurrent ? "ot-step--current" : ""}`}>
                        <div className="ot-step-connector">
                          <div className="ot-step-icon-wrap">
                            <div className="ot-step-icon">{step.icon}</div>
                            {isCurrent && <div className="ot-step-pulse" />}
                          </div>
                          {!isLast && <div className={`ot-step-line ${i < currentIdx ? "ot-step-line--done" : ""}`} />}
                        </div>
                        <div className="ot-step-info">
                          <span className="ot-step-label">{step.label}</span>
                          <span className="ot-step-desc">{step.desc}</span>
                          {trackingEntry && (
                            <span className="ot-step-time">
                              {new Date(trackingEntry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                          {trackingEntry?.location && (
                            <span className="ot-step-location"><MapPin size={12} /> {trackingEntry.location}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.status === "Cancelled" && (
              <div className="ot-cancelled-banner">
                <Clock size={24} />
                <div>
                  <strong>Order Cancelled</strong>
                  <p>This order has been cancelled.</p>
                </div>
              </div>
            )}

            {/* Tracking History */}
            <div className="ot-history-card">
              <h2>Tracking History</h2>
              {data.tracking.length === 0 && (
                <div className="ot-history-empty">
                  <Package size={32} />
                  <p>No tracking updates yet. Your order is being processed.</p>
                </div>
              )}
              <div className="ot-history-list">
                {data.tracking.map((t, i) => (
                  <div key={i} className={`ot-history-item ${i === 0 ? "ot-history-item--latest" : ""}`}>
                    <div className="ot-history-line-wrap">
                      <div className={`ot-history-dot ${i === 0 ? "ot-history-dot--active" : ""}`} />
                      {i < data.tracking.length - 1 && <div className="ot-history-connector" />}
                    </div>
                    <div className="ot-history-content">
                      <div className="ot-history-top">
                        <strong>{t.status}</strong>
                        {i === 0 && <span className="ot-history-latest-badge">Latest</span>}
                      </div>
                      {t.message && <p>{t.message}</p>}
                      {t.location && (
                        <span className="ot-location"><MapPin size={14} /> {t.location}</span>
                      )}
                      <time>{new Date(t.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
