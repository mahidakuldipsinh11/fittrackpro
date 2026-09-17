export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const BACKEND_ORIGIN = API_BASE.startsWith("http") ? API_BASE.replace(/\/api\/?$/, "") : "";

export const resolveImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  if (BACKEND_ORIGIN) {
    return `${BACKEND_ORIGIN}${path}`;
  }
  if (path.startsWith("/product_images/")) {
    return `http://localhost:8000${path}`;
  }
  return path;
};

export const onImageError = (e) => {
  e.target.src = FALLBACK_IMAGE;
};