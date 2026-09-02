import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";

const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";

const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  cat: p.category?.name || "Accessories",
  brand: p.brand || "FitTrack Pro",
  price: Number(p.price),
  was: p.was_price ? Number(p.was_price) : undefined,
  off: p.off_percent || undefined,
  description: p.description || "",
  image: p.image || FALLBACK_IMAGE,
  tag: p.tag || null,
  is_deal: !!p.is_deal,
  claimed: p.claimed || 0,
  endsInHours: p.ends_in_hours || 48,
  stock: p.stock ?? 0,
});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      const list = res.data.results || res.data;
      setProducts(list.map(mapProduct));
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const buildProductPayload = (data) => ({
    name: data.name,
    cat: data.cat,
    price: Number(data.price),
    was_price: data.was === "" || data.was === undefined ? null : Number(data.was),
    off_percent: data.was
      ? Math.max(0, Math.round(((Number(data.was) - Number(data.price)) / Number(data.was)) * 100))
      : 0,
    description: data.description || "",
    image: data.image || "",
    tag: data.tag || null,
    is_deal: !!data.is_deal,
    is_featured: !!data.tag,
    stock: data.stock !== undefined ? Number(data.stock) : 0,
  });

  const withImageFile = (payload, file) => {
    if (!file) return payload;
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    fd.append("image_upload", file);
    return fd;
  };

  const addProduct = useCallback(
    async (data) => {
      await api.post("/products/create/", withImageFile(buildProductPayload(data), data.imageFile));
      await fetchProducts();
    },
    [fetchProducts]
  );

  const editProduct = useCallback(
    async (id, data) => {
      const payload = {};

      // Har field explicitly check karo — undefined skip karo, baaki sab bhejo
      if (data.name !== undefined) payload.name = data.name;
      if (data.cat !== undefined) payload.cat = data.cat;
      if (data.price !== undefined) payload.price = Number(data.price);

      // was_price: empty string ya undefined → null, warna number
      if (data.was !== undefined) {
        payload.was_price = (data.was === "" || data.was === null || data.was === undefined)
          ? null
          : Number(data.was);
      }

      // off_percent auto-calculate karo agar was_price aur price dono hain
      if (data.was && data.price && Number(data.was) > 0) {
        payload.off_percent = Math.max(
          0,
          Math.round(((Number(data.was) - Number(data.price)) / Number(data.was)) * 100)
        );
      } else if (data.was === "" || data.was === null) {
        payload.off_percent = 0;
      }

      if (data.description !== undefined) payload.description = data.description || "";
      if (data.tag !== undefined) payload.tag = data.tag || null;
      if (data.is_deal !== undefined) payload.is_deal = !!data.is_deal;
      if (data.is_featured !== undefined) payload.is_featured = !!data.is_featured;
      if (data.stock !== undefined) payload.stock = Number(data.stock) || 0;

      // Image URL — sirf tab bhejo jab imageFile na ho (file upload priority lega)
      if (data.image !== undefined && !data.imageFile) payload.image = data.image || "";

      const finalPayload = withImageFile(payload, data.imageFile);
      await api.patch(`/products/${id}/`, finalPayload);
      await fetchProducts();
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(async (id) => {
    await api.delete(`/products/${id}/`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, loading, fetchProducts, addProduct, editProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};