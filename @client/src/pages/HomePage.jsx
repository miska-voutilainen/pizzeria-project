import { useEffect, useState } from "react";
import { getPizzas } from "../lib/api/products.js";
import { useNavigate } from "react-router-dom";

import Hero from "../components/layout/Hero/Hero.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";

import "../styles/pages/HomePage.css";
import Newsletter from "../components/layout/Newsletter/Newsletter.jsx";
import PromoSlide from "../components/layout/PromoSlide/PromoSlide.jsx";
import WhyUs from "../components/layout/WhyUs/WhyUs.jsx";

const HomePage = () => {
  const [pizzas, setPizzas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPizzas()
      .then(setPizzas)
      .catch((err) => console.error("Failed to load pizzas:", err));
  }, []);

  const displayedPizzas = pizzas.slice(0, 8);

  return (
    <div>
      <Hero />

      <h1 className="page-title">─ Pizzat ─</h1>

      <div className="product-grid">
        {displayedPizzas.length > 0 ? (
          displayedPizzas.map((pizza) => (
            <article key={pizza.slug} className="product-card">
              <div className="product-image-container">
                <img
                  src={pizza.imgUrl}
                  alt={pizza.name}
                  className="product-image"
                  loading="lazy"
                />
              </div>
              <div className="product-content">
                <h2 className="product-name">{pizza.name}</h2>
                <p className="product-description">{pizza.description}</p>
                <span className="product-price">{pizza.price} €</span>
              </div>
            </article>
          ))
        ) : (
          <p className="loading-text">Loading pizzas...</p>
        )}
      </div>

      {pizzas.length > 8 && (
        <div className="text-center">
          <button
            onClick={() => navigate("/menu")}
            className="view-menu-button"
          >
            View Full Menu
          </button>
        </div>
      )}

      <WhyUs />
      <Newsletter />
      <PromoSlide />
    </div>
  );
};

export default HomePage;
