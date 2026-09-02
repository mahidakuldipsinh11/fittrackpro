import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, User, Package, Flame, Search, ChevronDown, LogOut, Home, ShoppingBag, Tag, Info, Headphones, X, Menu } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import "./Navbar.css";

const CATEGORIES = [
  "All Categories",
  "Gym Equipment",
  "Supplements",
  "Cardio Racks",
  "Apparel & Gear",
  "Accessories"
];

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/deals", label: "Deals", icon: Tag },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Headphones },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef();
  const searchTimer = useRef(null);
  const dropdownRef = useRef();
  const sidebarRef = useRef();

  const { cart, total } = useCart();
  const { wishlistCount } = useWishlist();
  const { user: authUser, logout } = useAuth();
  const isLoggedIn = !!authUser;
  const totalItems = isLoggedIn ? cart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0) : 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    setSidebarOpen(false);
    navigate("/");
  };

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(searchTimer.current);
    if (!q || q.length < 1) {
      setSearchResults({ products: [], categories: [] });
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const catQuery = selectedCategory !== "All Categories" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
        const res = await api.get(`/search/?q=${encodeURIComponent(q)}${catQuery}`);
        setSearchResults(res.data);
      } catch {
        // silent
      }
    }, 200);
  }, [selectedCategory]);

  useEffect(() => {
    fetchSuggestions(searchTerm);
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/shop?search=${encodeURIComponent(searchTerm.trim())}`;
    if (selectedCategory !== "All Categories") {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    navigate(url);
    setShowSuggestions(false);
    setSidebarOpen(false);
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    navigate(`/shop?search=${encodeURIComponent(name)}`);
    setShowSuggestions(false);
    setSidebarOpen(false);
  };

  const handleProductClick = (productId) => {
    setSearchTerm("");
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setSidebarOpen(false);
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header className={`ft-nav ${scrolled ? "scrolled" : ""}`}>
      {/* ─── MAIN NAV ─── */}
      <div className="ft-nav__main">
        <div className="ft-nav__container">
          {/* BRAND */}
          <NavLink to="/" className="ft-nav__brand">
            <div className="ft-nav__brand-icon">🏋️</div>
            <div className="ft-nav__brand-text">
              <span className="ft-nav__brand-name">FitTrack <i>PRO</i></span>
              <span className="ft-nav__brand-tagline">India's Premier Fitness Store</span>
            </div>
          </NavLink>

          {/* SEARCH — Right after logo */}
          <div className="ft-nav__search" ref={searchRef}>
            <form className="ft-nav__search-form" onSubmit={handleSearch}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search dumbbells, protein, racks..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" aria-label="Search">
                <Search size={18} />
              </button>
            </form>

            {showSuggestions && (searchResults.products.length > 0 || searchResults.categories.length > 0) && (
              <div className="ft-nav__suggestions">
                {searchResults.categories.length > 0 && (
                  <div className="ft-nav__sug-section">
                    <span className="ft-nav__sug-label">Categories</span>
                    {searchResults.categories.map((c) => (
                      <button key={c} className="ft-nav__sug-cat" onClick={() => { navigate(`/shop?category=${encodeURIComponent(c)}`); setShowSuggestions(false); setSearchTerm(""); }}>
                        <Search size={14} /> {c}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.products.length > 0 && (
                  <div className="ft-nav__sug-section">
                    <span className="ft-nav__sug-label">Products</span>
                    {searchResults.products.map((p) => (
                      <button key={p.id} className="ft-nav__sug-item" onClick={() => handleProductClick(p.id)}>
                        <img src={p.image} alt={p.name} className="ft-nav__sug-img" />
                        <div>
                          <span className="ft-nav__sug-name">{p.name}</span>
                          <span className="ft-nav__sug-price">₹{Number(p.price).toLocaleString("en-IN")}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button className="ft-nav__sug-viewall" onClick={() => handleSuggestionClick(searchTerm)}>
                  View all results for "{searchTerm}" →
                </button>
              </div>
            )}
          </div>

          {/* NAV LINKS (Desktop) */}
          <nav className="ft-nav__links-desktop">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `ft-nav__link ${isActive ? "active" : ""}`}
              >
                <l.icon size={16} />
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ACTIONS (Desktop + Mobile) */}
          <div className="ft-nav__actions">
            {/* Cart — always visible */}
            <NavLink to="/cart" className="ft-nav__action" title="Cart">
              <div className="ft-nav__icon-wrap">
                <ShoppingCart size={20} />
                {totalItems > 0 && <span className={`ft-nav__badge ${bounce ? "bounce" : ""}`}>{totalItems}</span>}
              </div>
              <span className="ft-nav__action-label">₹{Number(total || 0).toLocaleString("en-IN")}</span>
            </NavLink>

            {/* Logged IN — Desktop: user dropdown | Mobile: hamburger only */}
            {isLoggedIn ? (
              <>
                {/* Desktop user dropdown */}
                <div className="ft-nav__user" ref={dropdownRef}>
                  <button className="ft-nav__user-btn" onClick={() => setDropdown(!dropdown)}>
                    <div className="ft-nav__avatar">
                      {getInitial(authUser.name || authUser.email)}
                      {authUser.is_staff && <span className="ft-nav__verified">✓</span>}
                    </div>
                    <span className="ft-nav__user-name">Hi, {(authUser.name || "User").split(" ")[0]}</span>
                    <ChevronDown size={14} />
                  </button>

                  {dropdown && (
                    <div className="ft-nav__dropdown">
                      <div className="ft-nav__dropdown-header">
                        <div className="ft-nav__dropdown-avatar">{getInitial(authUser.name || authUser.email)}</div>
                        <div>
                          <p className="ft-nav__dropdown-name">{authUser.name}</p>
                          <p className="ft-nav__dropdown-email">{authUser.email}</p>
                          {authUser.is_staff && <span className="ft-nav__dropdown-badge">✓ Verified Account Member</span>}
                        </div>
                      </div>
                      <div className="ft-nav__dropdown-divider" />
                      <NavLink to="/profile" onClick={() => setDropdown(false)}><User size={16} /> My Profile</NavLink>
                      <NavLink to="/orders" onClick={() => setDropdown(false)}><Package size={16} /> My Orders</NavLink>
                      <NavLink to="/deals" onClick={() => setDropdown(false)}><Flame size={16} /> Member Deals</NavLink>
                      <button onClick={handleLogout} className="ft-nav__logout"><LogOut size={16} /> Sign Out</button>
                    </div>
                  )}
                </div>
                {/* Mobile hamburger for logged-in users */}
                <button
                  className="ft-nav__hamburger"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
              </>
            ) : (
              <>
                {/* Desktop sign in */}
                <NavLink to="/login" className="ft-nav__signin">
                  <User size={16} />
                  <span>Sign In</span>
                </NavLink>
                {/* Mobile hamburger for guests */}
                <button
                  className="ft-nav__hamburger"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── MOBILE NAV LINKS (visible when logged in on mobile) ─── */}
      {isLoggedIn && (
        <div className="ft-nav__mobile-links">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `ft-nav__mobile-link ${isActive ? "active" : ""}`}
            >
              <l.icon size={14} />
              {l.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* ─── MOBILE SIDEBAR ─── */}
      <div className={`ft-sidebar-overlay ${sidebarOpen ? "is-open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`ft-sidebar ${sidebarOpen ? "is-open" : ""}`} ref={sidebarRef}>
        {/* Sidebar Header */}
        <div className="ft-sidebar__header">
          <NavLink to="/" className="ft-sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <span className="ft-sidebar__brand-icon">🏋️</span>
            <span className="ft-sidebar__brand-name">FitTrack <i>PRO</i></span>
          </NavLink>
          <button className="ft-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* User Section */}
        <div className="ft-sidebar__user">
          {isLoggedIn ? (
            <>
              <div className="ft-sidebar__avatar">
                {getInitial(authUser.name || authUser.email)}
                {authUser.is_staff && <span className="ft-nav__verified">✓</span>}
              </div>
              <div className="ft-sidebar__user-info">
                <p className="ft-sidebar__user-name">{authUser.name}</p>
                <p className="ft-sidebar__user-email">{authUser.email}</p>
                {authUser.is_staff && <span className="ft-nav__dropdown-badge">✓ Verified Account Member</span>}
              </div>
            </>
          ) : (
            <NavLink to="/login" className="ft-sidebar__signin-btn" onClick={() => setSidebarOpen(false)}>
              <User size={18} />
              <span>Sign In / Sign Up</span>
            </NavLink>
          )}
        </div>

        <div className="ft-sidebar__divider" />

        {/* Navigation Links */}
        <nav className="ft-sidebar__nav">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `ft-sidebar__link ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <l.icon size={18} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ft-sidebar__divider" />

        {/* Quick Actions */}
        <nav className="ft-sidebar__nav">
          <NavLink to="/cart" className="ft-sidebar__link" onClick={() => setSidebarOpen(false)}>
            <ShoppingCart size={18} />
            <span>My Cart</span>
            {totalItems > 0 && <span className="ft-sidebar__count">{totalItems}</span>}
          </NavLink>
          <NavLink to="/deals" className="ft-sidebar__link" onClick={() => setSidebarOpen(false)}>
            <Flame size={18} />
            <span>Hot Deals</span>
          </NavLink>
        </nav>

        <div className="ft-sidebar__divider" />

        {/* Logout (if logged in) */}
        {isLoggedIn && (
          <button className="ft-sidebar__logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        )}
      </aside>
    </header>
  );
}
