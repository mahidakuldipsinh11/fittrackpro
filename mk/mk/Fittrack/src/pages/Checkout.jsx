import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useCoupon } from "../context/CouponContext";
import api from "../api/client";
import jsPDF from "jspdf";
import "./Checkout.css";

// Razorpay Key — fetched from backend at runtime
let RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY || "";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Fetch Razorpay key from backend if not set via env
async function ensureRazorpayKey() {
  if (RAZORPAY_KEY_ID) return RAZORPAY_KEY_ID;
  try {
    const res = await api.get("/payment/key/");
    RAZORPAY_KEY_ID = res.data.key_id;
    return RAZORPAY_KEY_ID;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { coupon, isCouponActive, applyCoupon, couponCode, discountPercent } = useCoupon();
  const { discount, finalTotal, couponApplied } = applyCoupon(total);

  const totalWas = cart.reduce(
    (sum, item) => sum + (Number(item.was) || Number(item.price)) * (item.qty || item.quantity || 1),
    0
  );
  const dealSavings = totalWas > total ? totalWas - total : 0;
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay"); // Razorpay is default
  const [errors, setErrors] = useState({});
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [codCaptchaInput, setCodCaptchaInput] = useState("");
  const [codCaptchaCode, setCodCaptchaCode] = useState("7489");
  // Save order data for invoice (before cart is cleared)
  const [orderData, setOrderData] = useState({ items: [], total: 0, totalWas: 0, dealSavings: 0, discount: 0, finalTotal: 0, couponApplied: false, couponCode: "", discountPercent: 0 });

  const customerRef = useRef({ name: "", address: "", phone: "" });
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "" });

  const audioRef = useRef(null);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio("/freesound_community-success-48018.mp3");
    audio.preload = "auto";
    audio.volume = 1;
    audio.load();
    audioRef.current = audio;

    audio.addEventListener("error", () => {
      console.warn("Success sound failed to load.");
    });

    setCodCaptchaCode(String(Math.floor(1000 + Math.random() * 9000)));

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const playSound = () => {
    if (soundPlayedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => { soundPlayedRef.current = true; })
        .catch((err) => console.warn("Could not play success sound:", err));
    } else {
      soundPlayedRef.current = true;
    }
  };

  useEffect(() => {
    if (step === 2 && paymentSuccess) {
      playSound();
    }
  }, [step, paymentSuccess]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    customerRef.current[e.target.name] = e.target.value;
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!customer.name.trim()) newErrors.name = "Name is required";
    if (!customer.address.trim()) newErrors.address = "Address is required";
    if (!customer.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (customer.phone.length < 10) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the billing errors before proceeding.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep2Payment()) setStep(2);
    }
  };

  const validateStep2Payment = () => {
    if (paymentMethod === "Cash on Delivery") {
      if (codCaptchaInput !== codCaptchaCode) {
        toast.error("Captcha code does not match. Please enter correct code.");
        return false;
      }
    }
    // Razorpay validation happens when user clicks Pay in the modal
    return true;
  };

  /* ─── Place order directly (COD or after Razorpay success) ─── */
  const placeOrder = async (paymentLabel) => {
    const orderPayload = {
      subtotal: totalWas,
      dealSavings: dealSavings,
      couponDiscount: couponApplied ? discount : 0,
      gst: 0,
      total: finalTotal,
      paymentMethod: paymentLabel,
      customer: { ...customer },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        was: Number(item.was) || 0,
        qty: Number(item.qty || item.quantity || 1),
        image: item.image || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        cat: item.cat || "Equipment",
      })),
    };

    // Save order data BEFORE clearing cart (for invoice)
    setOrderData({
      items: [...cart],
      total: total,
      totalWas: totalWas,
      dealSavings: dealSavings,
      discount: discount,
      finalTotal: finalTotal,
      couponApplied: couponApplied,
      couponCode: couponCode,
      discountPercent: discountPercent,
    });

    const res = await api.post("/orders/", orderPayload);
    setCurrentOrderId(res.data.order_id);
    toast.success(`Payment Successful! Order #${res.data.order_id} confirmed.`);
    setPaymentSuccess(true);
    setStep(2);
    // Clear cart immediately after order is placed
    if (clearCart) clearCart();
  };

  /* ─── Razorpay Payment ─── */
  const handleRazorpayPayment = async () => {
    if (placingOrder) return;

    // Get Razorpay key from backend
    const key = await ensureRazorpayKey();
    if (!key) {
      toast.error("Payment system not configured. Please try Cash on Delivery.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay SDK. Please try again.");
      return;
    }

    setPlacingOrder(true);
    soundPlayedRef.current = false;

    // Step 1: Create order on backend
    let razorpayOrderId;
    try {
      const orderRes = await api.post("/payment/create-order/", {
        amount: finalTotal,
        currency: "INR",
        receipt: `ORD-${Date.now()}`,
      });
      razorpayOrderId = orderRes.data.order_id;
    } catch (err) {
      console.error("Failed to create Razorpay order:", err);
      toast.error("Failed to initialize payment. Please try again.");
      setPlacingOrder(false);
      return;
    }

    // Step 2: Open Razorpay checkout
    const options = {
      key: key,
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      name: "FitTrack Pro",
      description: `Order — ₹${finalTotal.toLocaleString("en-IN")}`,
      image: "/vite.svg",
      order_id: razorpayOrderId,
      handler: async function (response) {
        // Step 3: Verify payment on backend
        try {
          const verifyRes = await api.post("/payment/verify/", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.data.verified) {
            playSound();
            await placeOrder(`Razorpay (${response.razorpay_payment_id})`);
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Payment received but verification failed. Contact support.");
        } finally {
          setPlacingOrder(false);
        }
      },
      prefill: {
        name: customer.name,
        contact: customer.phone,
        email: "",
      },
      theme: {
        color: "#131921",
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled. You can try again.");
          setPlacingOrder(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      toast.error(`Payment failed: ${response.error.description}`);
      setPlacingOrder(false);
    });
    rzp.open();
  };

  /* ─── Main Handle Payment ─── */
  const handlePayment = async () => {
    if (!validateStep1()) return;
    if (placingOrder) return;

    soundPlayedRef.current = false;

    if (paymentMethod === "Razorpay") {
      // Razorpay opens modal asynchronously — placingOrder managed inside
      await handleRazorpayPayment();
    } else {
      // COD
      setPlacingOrder(true);
      try {
        playSound();
        await placeOrder("Cash on Delivery");
      } catch (err) {
        console.error(err.response?.data || err);
        toast.error("Could not place order. Please try again.");
      } finally {
        setPlacingOrder(false);
      }
    }
  };

  /* ─── Invoice PDF (Amazon-Style Professional) ─── */
  const downloadInvoice = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const orderId = currentOrderId || "FIT" + Date.now();
    const orderDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const invoiceNo = `INV-${orderId.replace(/[^A-Z0-9]/gi, "").slice(-8)}`;
    const pageW = 210, margin = 15, contentW = pageW - margin * 2;
    const rightX = pageW - margin;
    let y = 10;

    // Use saved orderData if cart is empty (after payment)
    const invItems = orderData.items.length > 0 ? orderData.items : cart;
    const invTotalWas = orderData.totalWas || totalWas;
    const invDealSavings = orderData.dealSavings || dealSavings;
    const invTotal = orderData.total || total;
    const invDiscount = orderData.discount || discount;
    const invFinalTotal = orderData.finalTotal || finalTotal;
    const invCouponApplied = orderData.couponApplied || couponApplied;
    const invCouponCode = orderData.couponCode || couponCode;
    const invDiscountPercent = orderData.discountPercent || discountPercent;

    /* ── HEADER BAR (Amazon-style dark header) ── */
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, pageW, 32, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 153, 0);
    doc.setFont("helvetica", "bold");
    doc.text("FITTRACK PRO", margin, 18);
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("India's Premier Fitness Equipment Store", margin, 25);
    // Invoice badge on right
    doc.setFillColor(255, 153, 0);
    doc.roundedRect(rightX - 48, 8, 48, 16, 3, 3, "F");
    doc.setFontSize(13);
    doc.setTextColor(13, 17, 23);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", rightX - 44, 18);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Original for Buyer", rightX - 38, 23);

    y = 40;

    /* ── INVOICE META (left: seller, right: invoice details) ── */
    // Seller info (left)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("SOLD BY:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text("FitTrack Pro", margin, y + 6);
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Fitness Equipment & Accessories", margin, y + 12);
    doc.text("Plot No. 42, Junagadh GIDC, Junagadh, Gujarat - 362001", margin, y + 17);
    doc.text("GSTIN: 24AABCF1234M1Z5", margin, y + 22);
    doc.text("State: Gujarat (24)", margin, y + 27);
    doc.text("PAN: AABCF1234M", margin, y + 32);
    doc.text("CIN: U51109GJ2020PTC123456", margin, y + 37);

    // Invoice details (right)
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(rightX - 75, y - 4, 75, 44, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice No:", rightX - 71, y + 2);
    doc.text("Invoice Date:", rightX - 71, y + 10);
    doc.text("Order ID:", rightX - 71, y + 18);
    doc.text("Payment Method:", rightX - 71, y + 26);
    doc.text("Place of Supply:", rightX - 71, y + 34);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(invoiceNo, rightX - 28, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(orderDate, rightX - 28, y + 10);
    doc.text(`#${orderId}`, rightX - 28, y + 18);
    doc.text(paymentMethod, rightX - 28, y + 26);
    doc.text("Gujarat (24)", rightX - 28, y + 34);

    y += 48;

    /* ── SHIPPING ADDRESS ── */
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("SHIP TO:", margin + 4, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(customer.name, margin + 4, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(customer.address, margin + 4, y + 20);
    doc.text(`Phone: ${customer.phone}`, margin + 4, y + 25);

    y += 34;

    /* ── PRODUCT TABLE ── */
    const col = [margin, margin + 4, margin + 72, margin + 88, margin + 108, margin + 126, margin + 148, rightX - 4];
    doc.setFillColor(13, 17, 23);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("#", col[0] + 2, y + 5.5);
    doc.text("Product Description", col[1] + 2, y + 5.5);
    doc.text("HSN", col[2] + 2, y + 5.5);
    doc.text("Unit Price", col[3] + 2, y + 5.5);
    doc.text("Qty", col[4] + 2, y + 5.5);
    doc.text("Discount", col[5] + 2, y + 5.5);
    doc.text("Taxable Amt", col[6] + 2, y + 5.5);
    doc.text("Total", col[7] - 12, y + 5.5);
    y += 8;

    // Table rows
    doc.setFont("helvetica", "normal");
    let grandSubtotal = 0;

    invItems.forEach((item, idx) => {
      const q = item.qty || item.quantity || 1;
      const orig = Number(item.was) || 0;
      const dealP = Number(item.price);
      const hasDeal = orig > 0 && orig > dealP;
      const dealDisc = hasDeal ? orig - dealP : 0;
      const welcomeDisc = invCouponApplied ? Math.round((dealP * invDiscountPercent) / 100) : 0;
      const itemDiscount = dealDisc + welcomeDisc;
      const taxable = dealP * q - welcomeDisc * q;
      grandSubtotal += taxable;

      // Alternate row background
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 1, contentW, 14, "F");
      }

      // Row border bottom
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + 13, rightX, y + 13);

      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`${idx + 1}`, col[0] + 2, y + 5);
      // Product name (truncate if long)
      const nameTrunc = item.name.length > 28 ? item.name.substring(0, 28) + "..." : item.name;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(nameTrunc, col[1] + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(6.5);
      doc.text(`${item.cat || "Fitness"} | SKU: FT${String(item.id).padStart(4, "0")}`, col[1] + 2, y + 10);

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7.5);
      doc.text("9506", col[2] + 2, y + 7);

      doc.setTextColor(40, 40, 40);
      doc.text(`Rs.${dealP.toLocaleString("en-IN")}`, col[3] + 2, y + 7);

      doc.text(`${q}`, col[4] + 2, y + 7);

      // Discount in red
      if (itemDiscount > 0) {
        doc.setTextColor(220, 50, 50);
        doc.text(`-Rs.${(itemDiscount * q).toLocaleString("en-IN")}`, col[5] + 2, y + 7);
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text("-", col[5] + 2, y + 7);
      }

      doc.setTextColor(40, 40, 40);
      doc.text(`Rs.${taxable.toLocaleString("en-IN")}`, col[6] + 2, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 17, 23);
      doc.text(`Rs.${taxable.toLocaleString("en-IN")}`, col[7] - 12, y + 7);
      doc.setFont("helvetica", "normal");

      y += 14;
    });

    // Table bottom border
    doc.setDrawColor(13, 17, 23);
    doc.setLineWidth(0.5);
    doc.line(margin, y, rightX, y);
    doc.setLineWidth(0.2);

    y += 6;

    /* ── SUMMARY SECTION (Labels LEFT, Amounts RIGHT — Amazon style) ── */
    const sumX = margin + 2;
    const valX = rightX - 2;

    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin - 2, y - 2, contentW + 4, invDealSavings > 0 || invCouponApplied ? 62 : 48, 2, 2, "F");

    doc.setFontSize(8);
    const summaryLine = (label, value, color = [60, 60, 60], isBold = false) => {
      doc.setTextColor(...color);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.text(label, sumX, y + 4);
      doc.text(value, valX, y + 4, { align: "right" });
      y += 7;
    };

    summaryLine("Subtotal (MRP):", `Rs.${invTotalWas.toLocaleString("en-IN")}`, [100, 100, 100]);

    if (invDealSavings > 0) {
      summaryLine("Product Discount:", `-Rs.${invDealSavings.toLocaleString("en-IN")}`, [220, 50, 50]);
    }

    summaryLine("Price After Deals:", `Rs.${invTotal.toLocaleString("en-IN")}`, [60, 60, 60]);

    if (invCouponApplied) {
      summaryLine(`Welcome Bonus (${invCouponCode}):`, `-Rs.${invDiscount.toLocaleString("en-IN")}`, [220, 50, 50]);
    }

    summaryLine("Shipping:", "FREE", [34, 197, 94]);
    summaryLine("Tax (GST 0%):", "Rs.0", [100, 100, 100]);

    y += 1;
    doc.setDrawColor(13, 17, 23);
    doc.setLineWidth(0.8);
    doc.line(sumX - 5, y, rightX, y);
    doc.setLineWidth(0.2);
    y += 3;

    // Grand Total
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 17, 23);
    doc.text("Grand Total:", sumX, y + 4);
    doc.text(`Rs.${invFinalTotal.toLocaleString("en-IN")}`, valX, y + 4, { align: "right" });
    y += 8;

    // Savings badge
    if (invDealSavings + invDiscount > 0) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.roundedRect(margin - 2, y, contentW + 4, 8, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(`You saved Rs.${(invDealSavings + invDiscount).toLocaleString("en-IN")} on this order!`, sumX, y + 5.5);
      y += 12;
    }

    y += 8;

    /* ── PAYMENT INFO BOX ── */
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(255, 191, 0);
    doc.roundedRect(margin, y, contentW, 14, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("PAYMENT INFORMATION", margin + 4, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7.5);
    doc.text(`Method: ${paymentMethod}`, margin + 4, y + 11);
    doc.text(`Status: PAID`, margin + 90, y + 11);
    doc.text(`Amount: Rs.${invFinalTotal.toLocaleString("en-IN")}`, margin + 140, y + 11);
    y += 20;

    /* ── TERMS & CONDITIONS ── */
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, rightX, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Terms & Conditions:", margin, y + 4);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    const terms = [
      "1. This is a computer-generated invoice and does not require a physical signature.",
      "2. Goods once sold will be accepted as per the return policy available at www.fittrackpro.com.",
      "3. Any dispute arising shall be subject to Junagadh, Gujarat jurisdiction.",
      "4. E&OE (Errors and Omissions Excepted).",
      "5. For returns/refunds, visit www.fittrackpro.com/return-policy or contact support@fittrackpro.com.",
    ];
    terms.forEach((t) => {
      doc.text(t, margin, y);
      y += 4.5;
    });

    y += 4;

    /* ── FOOTER ── */
    doc.setFillColor(13, 17, 23);
    doc.rect(0, y, pageW, 18, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 153, 0);
    doc.setFont("helvetica", "bold");
    doc.text("FITTRACK PRO", margin, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text("www.fittrackpro.com | support@fittrackpro.com | +91 98765 43210", margin, y + 12);
    doc.text("Thank you for shopping with us!", rightX - 2, y + 12, { align: "right" });
    doc.text("Generated by FitTrack Pro System", margin, y + 16);

    doc.save(`FitTrack-Invoice-${orderId}.pdf`);
  };

  const paymentMethodsList = [
    { id: "Razorpay", icon: "💳", label: "Razorpay (Card / UPI / Wallet / Netbanking)" },
    { id: "Cash on Delivery", icon: "💵", label: "COD" },
  ];

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="progress-steps">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <div className="step-circle">1</div>
            <span>Checkout</span>
          </div>
          <div className={`step-line ${step >= 2 ? "active-line" : ""}`}></div>
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <span>Success</span>
          </div>
        </div>

        <div className="checkout-content-wrapper">
          {step === 1 && (
            <div className="step-content slide-left">
              {/* ─── PAYMENT METHOD ─── */}
              <h2>Select Payment Method</h2>

              <div className="payment-options">
                {paymentMethodsList.map((pm) => (
                  <button
                    key={pm.id}
                    className={`payment-btn ${paymentMethod === pm.id ? "active-method" : ""}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <span className="pm-icon">{pm.icon}</span>
                    <span className="pm-label">{pm.label}</span>
                  </button>
                ))}
              </div>

              <div className="payment-details-panel">
                {paymentMethod === "Razorpay" && (
                  <div className="sub-panel fade-in razorpay-panel">
                    <div className="razorpay-info-card">
                      <div className="razorpay-logo">
                        <span className="razorpay-icon">💳</span>
                        <span className="razorpay-brand">Razorpay</span>
                      </div>
                      <p className="razorpay-desc">
                        Pay securely using <strong>UPI, Credit/Debit Card, Wallets, or Netbanking</strong> via
                        Razorpay.
                      </p>
                      <div className="razorpay-features">
                        <div className="razorpay-feature">
                          <span>🔒</span> 256-bit SSL Encrypted
                        </div>
                        <div className="razorpay-feature">
                          <span>⚡</span> Instant Payment Confirmation
                        </div>
                        <div className="razorpay-feature">
                          <span>🏦</span> All Banks Supported
                        </div>
                        <div className="razorpay-feature">
                          <span>📱</span> UPI, Cards, Wallets, Netbanking
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "Cash on Delivery" && (
                  <div className="sub-panel fade-in cod-panel">
                    <div className="cod-info-card">
                      <span className="cod-icon font-large">💵</span>
                      <div>
                        <h4>Cash on Delivery</h4>
                        <p>Pay with Cash at the time of delivery.</p>
                      </div>
                    </div>

                    <div className="cod-captcha-box">
                      <label>Enter Security Captcha to Confirm</label>
                      <div className="captcha-row">
                        <span className="captcha-display">{codCaptchaCode}</span>
                        <input
                          type="text"
                          placeholder="Enter 4-digit code"
                          value={codCaptchaInput}
                          onChange={(e) => setCodCaptchaInput(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── BILLING DETAILS ─── */}
              <h2 style={{ marginTop: '24px' }}>Billing Details</h2>
              <div className="customer-form">
                <div className="input-group">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder=" "
                    value={customer.name}
                    onChange={handleChange}
                    className={errors.name ? "error-input" : ""}
                  />
                  <label htmlFor="name">Full Name</label>
                  {errors.name && <span className="inline-error">{errors.name}</span>}
                </div>
                <div className="input-group">
                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder=" "
                    value={customer.address}
                    onChange={handleChange}
                    className={errors.address ? "error-input" : ""}
                  />
                  <label htmlFor="address">Address</label>
                  {errors.address && <span className="inline-error">{errors.address}</span>}
                </div>
                <div className="input-group">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder=" "
                    value={customer.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error-input" : ""}
                  />
                  <label htmlFor="phone">Phone Number</label>
                  {errors.phone && <span className="inline-error">{errors.phone}</span>}
                </div>
              </div>

              {/* ─── ORDER SUMMARY ─── */}
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map((item) => {
                    const q = item.qty || item.quantity || 1;
                    const orig = Number(item.was) || 0;
                    const dealP = Number(item.price);
                    const hasDeal = orig > 0 && orig > dealP;
                    const dealPct = hasDeal ? Math.round(((orig - dealP) / orig) * 100) : 0;
                    const finalP = couponApplied ? applyCoupon(dealP).finalTotal : dealP;
                    return (
                      <div key={item.id} className="summary-item">
                        <div className="summary-item__info">
                          <span className="summary-item__name">
                            {item.name} × {q}
                          </span>
                          <div className="summary-item__prices">
                            {hasDeal && (
                              <span className="summary-item__original">
                                ₹{orig.toLocaleString("en-IN")}
                              </span>
                            )}
                            {hasDeal && (
                              <span className="summary-item__deal-badge">-{dealPct}% OFF</span>
                            )}
                            <span className="summary-item__deal">
                              ₹{dealP.toLocaleString("en-IN")}
                            </span>
                            {couponApplied && (
                              <>
                                <span className="summary-item__arrow">→</span>
                                <span className="summary-item__coupon">
                                  🏷️ -{discountPercent}%
                                </span>
                                <span className="summary-item__final">
                                  ₹{finalP.toLocaleString("en-IN")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="summary-item__total">
                          ₹{(finalP * q).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal (Original)</span>
                    <span style={{ textDecoration: "line-through", color: "var(--steel)" }}>
                      ₹{totalWas.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {dealSavings > 0 && (
                    <div className="summary-row" style={{ color: "var(--success)" }}>
                      <span>🎉 Deal Savings</span>
                      <span>-₹{dealSavings.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>After Deals</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  {couponApplied && (
                    <div className="summary-row" style={{ color: "var(--success)" }}>
                      <span>
                        🏷️ {couponCode} ({discountPercent}% OFF)
                      </span>
                      <span>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="summary-row grand-total animated-total">
                    <span>Total Payable</span>
                    <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div
                    className="summary-row"
                    style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 700 }}
                  >
                    <span>Total You Save</span>
                    <span>₹{(dealSavings + discount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* ─── PAY BUTTON ─── */}
              <button className="next-btn razorpay-pay-btn" onClick={handlePayment} disabled={placingOrder}>
                {placingOrder
                  ? "Processing…"
                  : paymentMethod === "Razorpay"
                  ? `💳 Pay ₹${finalTotal.toLocaleString("en-IN")} via Razorpay`
                  : "💵 Place Order — COD"}
              </button>
            </div>
          )}

          {step === 2 && paymentSuccess && (
            <div className="step-content scale-in success-state">
              <div className="confetti-container">
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
              </div>
              <div className="success-icon-animated">🎉</div>
              <h1>Order Confirmed!</h1>
              <p className="thank-you-msg">
                Thank you for your purchase, <b>{customer.name}</b>.
              </p>

              <div className="final-receipt glassmorphism">
                <p>
                  <strong>Order ID:</strong> #{currentOrderId}
                </p>
                <p>
                  <strong>Address:</strong> {customer.address}
                </p>
                <p>
                  <strong>Phone:</strong> {customer.phone}
                </p>
                <p>
                  <strong>Payment:</strong> {paymentMethod}
                </p>
                <div className="receipt-items">
                  {orderData.items.map((item) => {
                    const q = item.qty || item.quantity || 1;
                    const orig = Number(item.was) || 0;
                    const dealP = Number(item.price);
                    const hasDeal = orig > 0 && orig > dealP;
                    const dealPct = hasDeal ? Math.round(((orig - dealP) / orig) * 100) : 0;
                    const welcomeDisc = orderData.couponApplied ? Math.round((dealP * orderData.discountPercent) / 100) : 0;
                    const finalP = orderData.couponApplied ? dealP - welcomeDisc : dealP;
                    return (
                      <div key={item.id} className="r-item">
                        <div className="r-item__header">
                          <span className="r-item__name">
                            {item.name} × {q}
                          </span>
                          <span className="r-item__total">
                            ₹{(finalP * q).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="r-item__prices">
                          {hasDeal && (
                            <span className="r-item__was">
                              MRP: ₹{(orig * q).toLocaleString("en-IN")}
                            </span>
                          )}
                          {hasDeal && (
                            <span className="r-item__deal">
                              Deal (-{dealPct}%): -₹{((orig - dealP) * q).toLocaleString("en-IN")}
                            </span>
                          )}
                          {orderData.couponApplied && (
                            <span className="r-item__coupon">
                              {orderData.couponCode} (-{orderData.discountPercent}%): -
                              ₹{(welcomeDisc * q).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="receipt-totals">
                  {orderData.dealSavings > 0 && (
                    <p style={{ color: "#10b981", fontSize: "0.8rem" }}>
                      🎉 Deal Savings: -₹{orderData.dealSavings.toLocaleString("en-IN")}
                    </p>
                  )}
                  {orderData.couponApplied && (
                    <p style={{ color: "#10b981", fontSize: "0.8rem" }}>
                      🏷️ {orderData.couponCode}: -₹{orderData.discount.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
                    💰 Total Saved: ₹{(orderData.dealSavings + orderData.discount).toLocaleString("en-IN")}
                  </p>
                </div>
                <h3>Total Paid: ₹{orderData.finalTotal.toLocaleString("en-IN")}</h3>
              </div>

              <div className="action-buttons">
                <button className="invoice-btn" onClick={downloadInvoice}>
                  📄 Download Invoice
                </button>
                <button
                  className="continue-btn"
                  onClick={() => {
                    clearCart && clearCart();
                    window.location.href = "/profile";
                  }}
                >
                  Go to My Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
