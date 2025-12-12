const API_BASE = import.meta.env.VITE_API_URL;

const fetchJson = async (url) => {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const getAllProducts = () => fetchJson("/api/products");
export const getPizzas = () => fetchJson("/api/products/pizza");
export const getDrinks = () => fetchJson("/api/products/drinks");
export const getProductBySlug = (slug) => fetchJson(`/api/products/${slug}`);
