// src/pages/MenuPage.jsx
import { useEffect, useState } from "react";
import { getPizzas, getDrinks } from "../utils/fetchApi";
//import "../styles/pages/MenuPage.css";

const categories = [
  { id: "pizza", label: "Pizzas", fetch: getPizzas },
  { id: "drinks", label: "Drinks", fetch: getDrinks },
];

const MenuPage = () => {
  const [activeTab, setActiveTab] = useState("pizza");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = categories.find((c) => c.id === activeTab);

  useEffect(() => {
    setLoading(true);
    currentCategory
      .fetch()
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="menu-page">
      <h1 className="page-title">─ Menu ─</h1>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`category-tab ${activeTab === cat.id ? "active" : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {loading ? (
          <p className="loading-text">
            Loading {currentCategory.label.toLowerCase()}...
          </p>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.tag} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-content">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <span className="product-price">{product.price} €</span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text">No items available.</p>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
