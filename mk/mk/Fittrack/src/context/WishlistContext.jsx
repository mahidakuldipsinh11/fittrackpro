import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/wishlist/");
      const list = res.data.results || res.data;
      setWishlist(list);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item.product?.id === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!user) return { success: false, error: "login" };

      try {
        if (isInWishlist(product.id)) {
          await api.delete(`/wishlist/${product.id}/remove/`);
          setWishlist((prev) =>
            prev.filter((item) => item.product?.id !== product.id)
          );
          return { success: true, action: "removed" };
        } else {
          const res = await api.post("/wishlist/", { product_id: product.id });
          // Re-fetch to get full product data
          await fetchWishlist();
          return { success: true, action: "added" };
        }
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.error || "Something went wrong",
        };
      }
    },
    [user, isInWishlist, fetchWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
