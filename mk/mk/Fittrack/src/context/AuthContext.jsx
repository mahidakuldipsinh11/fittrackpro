import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fittrack_token");
    if (!token) return;
    api
      .get("/auth/me/")
      .then((res) => {
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        setUser(res.data);
        // Auto-activate one-time welcome coupon on reload too
        const email = res.data?.email;
        if (email) {
          const normalizedEmail = email.toLowerCase().trim();
          let usedEmails = [];
          try { usedEmails = JSON.parse(localStorage.getItem("fittrack_coupon_used") || "[]"); } catch { usedEmails = []; }
          if (!usedEmails.includes(normalizedEmail)) {
            const couponData = { code: "WELCOME10", discount: 10, email: normalizedEmail, activatedAt: new Date().toISOString() };
            localStorage.setItem("fittrack_coupon", JSON.stringify(couponData));
            usedEmails.push(normalizedEmail);
            localStorage.setItem("fittrack_coupon_used", JSON.stringify(usedEmails));
            window.dispatchEvent(new Event("coupon:activated"));
            api.post("/api/coupon/activate/", { email: normalizedEmail, code: "WELCOME10" }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("fittrack_token", data.token);
    localStorage.setItem("fittrack_refresh", data.refresh);
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    localStorage.setItem("isLogin", "true");
    setUser(data.user);

    // Auto-activate one-time welcome 10% discount
    const email = data.user?.email;
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      let usedEmails = [];
      try { usedEmails = JSON.parse(localStorage.getItem("fittrack_coupon_used") || "[]"); } catch { usedEmails = []; }
      if (!usedEmails.includes(normalizedEmail)) {
        // First time — activate welcome coupon
        const couponData = {
          code: "WELCOME10",
          discount: 10,
          email: normalizedEmail,
          activatedAt: new Date().toISOString(),
        };
        localStorage.setItem("fittrack_coupon", JSON.stringify(couponData));
        usedEmails.push(normalizedEmail);
        localStorage.setItem("fittrack_coupon_used", JSON.stringify(usedEmails));
        // Notify CouponContext
        window.dispatchEvent(new Event("coupon:activated"));
        // Also try backend
        api.post("/api/coupon/activate/", { email: normalizedEmail, code: "WELCOME10" }).catch(() => {});
      }
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", { email, password });
      persistSession(res.data);
      return { success: true, data: res.data };
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.non_field_errors?.[0] || errData?.detail || "Invalid email or password";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register/", { name, email, password });
      persistSession(res.data);
      return { success: true, data: res.data };
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.email?.[0] || errData?.password?.[0] || errData?.name?.[0] || "Could not create account";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("fittrack_token");
    localStorage.removeItem("fittrack_refresh");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLogin");
    localStorage.removeItem("fittrack_cart");
    setUser(null);
    // Notify other contexts (Cart, Wishlist) in the same tab
    window.dispatchEvent(new Event("auth:logout"));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};