const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const fetchJson = async (url) => {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const getAllProducts = () => fetchJson("/");
export const getPizzas = () => fetchJson("/pizza");
export const getDrinks = () => fetchJson("/drinks");
export const getProductByTag = (tag) => fetchJson(`/${tag}`);
