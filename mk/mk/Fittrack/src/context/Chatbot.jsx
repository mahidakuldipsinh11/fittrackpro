import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Send, User } from "lucide-react";
import { useProducts } from "./ProductContext";
import { useAuth } from "./AuthContext";
import "./Chatbot.css";

const ChatbotMark = ({ size = 26, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="ft-bot-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C5A059" />
        <stop offset="100%" stopColor="#E8CE8F" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ft-bot-grad)"
      d="M24 6a4 4 0 0 0-4 4H9a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h3l2 5 6-5h4a4 4 0 0 0 4-4V14a4 4 0 0 0-4-4h-6z"
    />
    <path
      fill="#111111"
      d="M16.5 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm11 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5.5 5.6a2.4 2.4 0 0 1 3.4 0l-1.7 1.7-1.7-1.7z"
    />
    <rect x="12" y="27.5" width="18" height="3.4" rx="1.7" fill="#C5A059" />
    <g fill="#111111">
      <path d="M21 14h6v2h-6z" opacity=".55" />
      <path d="M19 10h2v8h-2z" />
      <path d="M27 10h2v8h-2z" />
      <path d="M17 11.5h2v5h-2z" transform="rotate(-18 18 14)" />
      <path d="M29 11.5h2v5h-2z" transform="rotate(18 30 14)" />
    </g>
  </svg>
);

const QUICK_REPLIES = ["Hi", "Show products", "Track order", "Delivery time", "Return policy", "Contact"];

const greeting = (name) =>
  `Namaste${name ? ` ${name.split(" ")[0]}` : ""}! 🙏 Welcome to FitTrack Pro.\n\nI'm your fitness assistant. I can help you with:\n\n🚚 Delivery & shipping\n📦 Products & pricing\n🔄 Returns & refunds\n💳 Payment & offers\n📞 Contact support\n\nType your question or tap a suggestion below!`;

const fallback =
  "I'm not sure I understood that. 🤔 Try asking about:\n\n• products / price\n• delivery time\n• return policy\n• order tracking\n• free delivery\n• contact support";

const intentRules = [
  {
    key: "greeting",
    words: ["hi", "hello", "hey", "namaste", "namaskar", "good morning", "good evening", "hola", "yo "],
    reply: (u) => greeting(u?.name),
  },
  {
    key: "products",
    words: ["product", "equipment", "shop", "buy", "purchase", "item", "stock", "available", "show"],
    reply: (u, ctx) => {
      const { products } = ctx;
      const n = products.length;
      const cats = [...new Set(products.map((p) => p.cat))].slice(0, 6).join(", ");
      return `We have ${n} products across categories like:\n\n${cats.split(", ").map((c) => `• ${c}`).join("\n")}\n\nWant me to find a specific product? Just type its name, e.g. "dumbbells" or "treadmill". 💪`;
    },
  },
  {
    key: "price",
    words: ["price", "cost", "rate", "how much", "cheap", "expensive", "kitna"],
    reply: (u, ctx) => {
      const { products } = ctx;
      const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
      const costly = [...products].sort((a, b) => b.price - a.price)[0];
      return `Products start from ₹${cheapest?.price?.toLocaleString("en-IN") ?? "1,999"} up to ₹${costly?.price?.toLocaleString("en-IN") ?? "50,000"}.\n\nTell me which product you're interested in and I'll give you its exact price! 🏷️`;
    },
  },
  {
    key: "productSearch",
    words: [],
    reply: (u, ctx, raw) => {
      const { products } = ctx;
      const q = raw.toLowerCase();
      const hits = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
      if (!hits.length)
        return `I couldn't find anything matching "${raw}" in our catalog. 🤷 Try "dumbbells", "rack", "bench", "treadmill", or "plates".`;
      const top3 = hits.slice(0, 3);
      return top3
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} — ₹${p.price.toLocaleString("en-IN")}${p.stock > 0 ? " (In stock ✅)" : " (Out of stock ⚠️)"}`
        )
        .join("\n\n") + `\n\nYou can view them in the shop. Tap "Open Shop" below if you'd like! 🛒`;
    },
  },
  {
    key: "delivery",
    words: ["delivery", "shipping", "shipping time", "deliver", "courier", "arrive", "dispatch", "shipping day", "shipping charge"],
    reply: (u, ctx) => {
      const { products } = ctx;
      const freebies = products.some((p) => p.is_deal || p.off);
      const avg = products.length ? "1-3 business days" : "1-3 business days";
      return `🚚 Delivery info:\n\n• Free delivery across India on all orders\n• Estimated dispatch: within 24-48 hours\n• Metro cities: 1-3 business days\n• Rest of India: 3-6 business days\n\n${freebies ? "Plus, several products have special offers right now! 🎉" : "Got a pincode in mind? I can confirm availability."}`;
    },
  },
  {
    key: "track",
    words: ["track", "order status", "where is my order", "my order", "order status", "shipped", "delivered yet"],
    reply: (u, ctx, raw, nav) => {
      if (!u?.email) return `To track an order, please login first, then visit the Order Tracking page.\n\nTap "Track Order" below to go there. 📦`;
      return `You can track your order in real-time on the Order Tracking page.\n\nTap "Track Order" below to open it. 📦`;
    },
  },
  {
    key: "return",
    words: ["return", "refund", "replacement", "exchange", "warranty", "defective", "broken", "damaged", "second hand", "replacement policy"],
    reply: () => `🔄 Returns & Refunds:\n\n• 7-day easy return window from delivery\n• Items must be unused & in original packaging\n• Full refund via original payment method within 5-7 days\n• Defective/damaged products: free pickup + replacement\n\nYou can read the full policy on the Return Policy page. 📋`,
  },
  {
    key: "payment",
    words: ["payment", "pay", "upi", "c od", "cod", "emi", "paytm", "gpay", "gp ay", "card", "credit", "debit", "netbanking", "net banking", "secure"],
    reply: () => `💳 Payment options:\n\n• UPI (GPay, PhonePe, Paytm)\n• Credit / Debit Cards\n• Net Banking\n• Cash on Delivery (COD)\n• EMI available on orders above ₹5,000\n\nAll payments are 100% secure with Razorpay. 🔒`,
  },
  {
    key: "coupon",
    words: ["coupon", "offer", "discount", "deal", "promo", "sale", "voucher", "freedelivery", "welcome"],
    reply: (u) =>
      u?.email
        ? `🎁 Great news! You already have a WELCOME10 coupon activated on your account — 10% off your first order!\n\nYou can also check the Deals page for ongoing discounts.`
        : `🎁 We have a WELCOME10 coupon — 10% off for new customers!\n\nSign up (create an account) and it will be activated automatically. You can also check the Deals page. 🛍️`,
  },
  {
    key: "contact",
    words: ["contact", "email", "phone", "call", "number", "support", "help", "complaint", "reach", "address", "whatsapp", "human", "agent", "ticket"],
    reply: () => `📞 Contact Support:\n\n• Email: fittrackpro.noreply@gmail.com\n• Phone: +91 98765 43210 (Mon-Sat, 9am-7pm)\n• Or fill the Contact form — we reply within 24 hours\n\nTap "Contact" below to go to the Contact page!`,
  },
  {
    key: "order",
    words: ["place order", "checkout", "how to order", "order kese", "buy process", "basket", "cart"],
    reply: () => `🛒 How to order:\n\n1. Browse the Shop and add items to your cart\n2. Go to Cart → Checkout\n3. Fill delivery details & pay securely\n4. Track your order in real-time\n\nIt takes less than 2 minutes! ⚡`,
  },
  {
    key: "how",
    words: ["how", "pare", "kese", "karu", "what is", "about", "trust"],
    reply: () =>
      `FitTrack Pro sells premium fitness equipment in India — racks, benches, dumbbells, cardio machines, and full gym setups.\n\nI can help with products, pricing, delivery, returns, and support. What do you need? 😊`,
  },
  {
    key: "thanks",
    words: ["thanks", "thank you", "thx", "shukriya", "dhanyawad", "great", "awesome", "nice"],
    reply: () => `You're very welcome! 😊 Anything else I can help with?`,
  },
];

const resolveIntent = (text, ctx, nav) => {
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1) exact/greeting etc from rules
  for (const rule of intentRules) {
    if (!rule.words.length) continue;
    if (rule.words.some((w) => lower.includes(w))) {
      return { text: rule.reply(ctx.user, ctx, raw, nav), intent: rule.key };
    }
  }

  // 2) product name search (single tokens >= 3 chars that aren't generic)
  const generic = ["the", "and", "for", "you", "your", "want", "need", "i", "me", "a", "an", "is", "are", "show", "tell", "give", "find", "price"];
  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !generic.includes(t));
  if (tokens.length) {
    const result = intentRules.find((r) => r.key === "productSearch").reply(ctx.user, ctx, tokens.join(" "));
    return { text: result, intent: "productSearch" };
  }

  // 3) fallback
  return { text: fallback + `\n\n💡 You can also tap a suggestion below.`, intent: "fallback" };
};

const Chatbot = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const bodyRef = useRef(null);

  const ctx = useMemo(() => ({ products, user }), [products, user]);

  const pushMessage = (msg) => setMessages((m) => [...m, msg]);

  const openBot = () => {
    setOpen((o) => !o);
    if (!hasOpened) {
      setHasOpened(true);
      setTimeout(() => pushMessage({ role: "bot", text: greeting(user?.name), quickReplies: [] }), 300);
    }
  };

  const handleSend = (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    setInput("");
    pushMessage({ role: "user", text });
    setTyping(true);
    setTimeout(() => {
      const reply = resolveIntent(text, ctx, navigate);
      pushMessage({ role: "bot", text: reply.text, quickReplies: [] });
      setTyping(false);
    }, 700);
  };

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  const renderLinks = (text) => {
    const parts = text.split(/(Tap "[^"]*" below)/g);
    return parts.map((part, i) => {
      const m = part.match(/^Tap "([^"]*)" below$/);
      if (!m) return <span key={i}>{part}</span>;
      const label = m[1].toLowerCase();
      return (
        <button
          key={i}
          className="chatbot-inline-link"
          onClick={() => {
            if (label.includes("track")) goTo("/orders");
            else if (label.includes("contact")) goTo("/contact");
            else if (label.includes("shop")) goTo("/shop?category=all");
            else if (label.includes("return")) goTo("/return-policy");
            else goTo("/shop");
          }}
        >
          {label === "open shop" ? "Open Shop 🛒" : `Open ${label} →`}
        </button>
      );
    });
  };

  const quickAction = (label) => {
    if (label === "Show products") return handleSend("show products");
    if (label === "Track order") return goTo("/orders");
    if (label === "Contact") return goTo("/contact");
    handleSend(label);
  };

  return (
    <>
      <div className={`chatbot-window ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="chatbot-header">
          <div className="chatbot-header__avatar">
            <ChatbotMark size={22} />
          </div>
          <div className="chatbot-header__info">
            <h4>FitTrack Assistant</h4>
            <span className="chatbot-header__status">
              <span className="chatbot-dot" /> Online — replies instantly
            </span>
          </div>
          <button className="chatbot-header__close" onClick={() => setOpen(false)} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="chatbot-body" ref={bodyRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-msg ${msg.role}`}>
              <div className="chatbot-msg__avatar">
                {msg.role === "bot" ? <ChatbotMark size={14} /> : <User size={14} />}
              </div>
              <div className="chatbot-bubble">{renderLinks(msg.text)}</div>
            </div>
          ))}
          {typing && (
            <div className="chatbot-msg bot">
              <div className="chatbot-msg__avatar">
                <ChatbotMark size={14} />
              </div>
              <div className="chatbot-bubble chatbot-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-suggestions">
          {QUICK_REPLIES.map((q) => (
            <button key={q} className="chatbot-chip" onClick={() => quickAction(q)}>
              {q}
            </button>
          ))}
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about products, delivery, returns..."
            aria-label="Chat message"
          />
          <button className="chatbot-send" onClick={() => handleSend()} aria-label="Send message">
            <Send size={18} />
          </button>
        </div>
      </div>

      <button
        className={`chatbot-fab ${open ? "open" : ""}`}
        onClick={openBot}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        <span className="chatbot-fab__icon">
          {open ? <X size={26} /> : <ChatbotMark size={26} />}
        </span>
        {!open && <span className="chatbot-fab__pulse" />}
        {!open && (
          <span className="chatbot-fab__tooltip">
            Need help? Chat with us! 👋
          </span>
        )}
      </button>
    </>
  );
};

export default Chatbot;