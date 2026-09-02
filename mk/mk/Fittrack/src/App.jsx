import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CouponProvider } from "./context/CouponContext";
import Navbar from "./context/Navbar";
import Footer from "./context/Footer";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import FitTrackAdmin from "./pages/Fittrackadmin";
import OrderTracking from "./pages/OrderTracking";
import ProductDetail from "./pages/ProductDetail";
import ReturnPolicy from "./pages/ReturnPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import CartDrawer from "./context/CartDrawer";
import "./index.css";
import "./App.css";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      id="scroll-to-top-btn"
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

const PageWrapper = ({ children }) => (
  <div className="page-transition">{children}</div>
);

function AppShell() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/deals" element={<PageWrapper><Deals /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><OrderTracking /></PageWrapper>} />
        <Route path="/orders/:orderId" element={<PageWrapper><OrderTracking /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
        <Route path="/return-policy" element={<PageWrapper><ReturnPolicy /></PageWrapper>} />
        <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
        <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
        <Route path="/disclaimer" element={<PageWrapper><Disclaimer /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/admin" element={<FitTrackAdmin />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <CouponProvider>
              <ToastProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </ToastProvider>
            </CouponProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}