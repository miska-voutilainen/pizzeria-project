import { useEffect, useState } from "react";
import { getPizzas } from "../lib/api/products.js";
import { useNavigate } from "react-router-dom";

import Hero from "../components/layout/Hero/Hero.jsx";
import Footer from "../components/Footer/Footer.jsx";

import "../styles/pages/HomePage.css";
import {SignIn} from "../components/modal/signIn/SignIn.jsx";

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
      <SignIn />
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
          <button onClick={() => navigate("/menu")} className="view-menu-button">
            View Full Menu
          </button>
        </div>
      )}

      <section className="info-section">
        <h2 className="info-title">Why Choose Us?</h2>
        <div className="separator-line"></div>

        <div className="info-grid">
          <div className="info-item">
            <img
              src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame.png"
              alt="Fresh ingredients"
            />
            <h3 className="info-name">Fresh ingredients</h3>
            <p className="info-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>
          </div>

          <div className="info-item">
            <img
              src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame2.png"
              alt="Fast delivery"
            />
            <h3 className="info-name">Guaranteed fast delivery</h3>
            <p className="info-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>
          </div>

          <div className="info-item">
            <img
              src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame3.png"
              alt="Delicious pizza"
            />
            <h3 className="info-name">Delicious Pizza</h3>
            <p className="info-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
