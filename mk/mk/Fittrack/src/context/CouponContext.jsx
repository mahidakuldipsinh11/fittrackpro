import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api/client";

const CouponContext = createContext();
export const useCoupon = () => useContext(CouponContext);

const COUPON_CODE = "WELCOME10";
const DISCOUNT_PERCENT = 10;

export const CouponProvider = ({ children }) => {
  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("fittrack_coupon") || "null");
      return saved;
    } catch {
      return null;
    }
  });

  const applyCoupon = useCallback((subtotal) => {
    if (!coupon) return { discount: 0, finalTotal: subtotal, couponApplied: false };
    const discount = Math.round((subtotal * DISCOUNT_PERCENT) / 100);
    const finalTotal = subtotal - discount;
    return { discount, finalTotal, couponApplied: true };
  }, [coupon]);

  // Check with backend if this email has already used the coupon
  const validateCoupon = useCallback(async (email) => {
    try {
      const res = await api.post("/api/coupon/validate/", {
        email,
        code: COUPON_CODE,
      });
      return res.data;
    } catch {
      return { valid: false, reason: "error" };
    }
  }, []);

  const activateCoupon = useCallback(async (email) => {
    if (!email || !email.includes("@")) return false;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Validate with backend
    const validation = await validateCoupon(normalizedEmail);
    if (!validation.valid) {
      if (validation.reason === "already_used") {
        let usedEmails = [];
        try { usedEmails = JSON.parse(localStorage.getItem("fittrack_coupon_used") || "[]"); } catch { usedEmails = []; }
        if (!usedEmails.includes(normalizedEmail)) {
          usedEmails.push(normalizedEmail);
          localStorage.setItem("fittrack_coupon_used", JSON.stringify(usedEmails));
        }
        return "already_used";
      }
      return false;
    }

    // 2. Activate on backend
    try {
      await api.post("/api/coupon/activate/", {
        email: normalizedEmail,
        code: COUPON_CODE,
      });
    } catch {
      // Continue even if backend fails
    }

    // 3. Mark locally
    let usedEmails = [];
    try { usedEmails = JSON.parse(localStorage.getItem("fittrack_coupon_used") || "[]"); } catch { usedEmails = []; }
    if (!usedEmails.includes(normalizedEmail)) {
      usedEmails.push(normalizedEmail);
      localStorage.setItem("fittrack_coupon_used", JSON.stringify(usedEmails));
    }

    const couponData = {
      code: COUPON_CODE,
      discount: DISCOUNT_PERCENT,
      email: normalizedEmail,
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem("fittrack_coupon", JSON.stringify(couponData));
    setCoupon(couponData);
    return true;
  }, [validateCoupon]);

  const removeCoupon = useCallback(() => {
    localStorage.removeItem("fittrack_coupon");
    setCoupon(null);
  }, []);

  // Listen for auto-activation from AuthContext
  useEffect(() => {
    const handleActivated = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("fittrack_coupon") || "null");
        if (saved) setCoupon(saved);
      } catch {}
    };
    window.addEventListener("coupon:activated", handleActivated);
    return () => window.removeEventListener("coupon:activated", handleActivated);
  }, []);

  const isCouponActive = !!coupon;

  return (
    <CouponContext.Provider
      value={{
        coupon,
        couponCode: COUPON_CODE,
        discountPercent: DISCOUNT_PERCENT,
        isCouponActive,
        applyCoupon,
        activateCoupon,
        validateCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};
