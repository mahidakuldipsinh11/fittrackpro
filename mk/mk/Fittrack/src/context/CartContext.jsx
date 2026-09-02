import { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const isLoggedIn = () => !!JSON.parse(localStorage.getItem("currentUser") || "null");

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    if (!isLoggedIn()) return [];
    try {
      const savedCart = JSON.parse(localStorage.getItem("fittrack_cart") || "[]");
      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      return [];
    }
  });

  // 👇 NEW: controls whether the slide-in cart drawer is visible
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Clear cart when user logs out
  useEffect(() => {
    const handleLogout = () => setCart([]);
    const handleStorage = () => {
      if (!isLoggedIn()) setCart([]);
    };
    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("fittrack_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (!isLoggedIn()) return false;
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);

      if (exist) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });

    // 👇 NEW: open the drawer the instant something is added
    setIsDrawerOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return total + price * qty;
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // 👇 NEW: drawer controls exposed to any component
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        total: getTotal(),
        getTotal,
        clearCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};