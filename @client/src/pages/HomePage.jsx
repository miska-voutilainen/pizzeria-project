// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { getAllProducts } from "../utils/fetchApi.js"; // correct
import { useNavigate } from "react-router-dom";
import "../styles/pages/HomePage.css";
import Hero from "../components/Hero/Hero.jsx";
import Footer from "../components/Footer/Footer.jsx";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllProducts().then(setProducts).catch(console.error);
  }, []);

  const displayed = products.slice(0, 8);

  return (
    <div>
      {/* Hero slider */}
      <Hero />

      <h1 className="page-title">─ Pizzat ─</h1>

      <div className="product-grid">
        {displayed.length > 0 ? (
          displayed.map((p) => (
            <div key={p.slug} className="product-card">
              <div className="product-image-container">
                <img src={p.imgUrl} alt={p.name} className="product-image" />
              </div>
              <div className="product-content">
                <h2 className="product-name">{p.name}</h2>
                <p className="product-description">{p.description}</p>
                <span className="product-price">{p.price} €</span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text">Loading...</p>
        )}
      </div>

      {/* TODO: View Full Menu button */}
      {products.length > 8 && (
        <div className="text-center">
          <button
            onClick={() => navigate("/menu")}
            className="view-menu-button"
          >
            View Full Menu
          </button>
        </div>
      )}

      {/* Why Choose Us section */}
      <h1 className="info-title">Why Choose Us?</h1>
      <div className="separator-line"></div>
      <div className="info-grid">
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame.png"
            alt="Fresh"
          />
          <h2 className="info-name">Fresh ingredients</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame2.png"
            alt="Fast"
          />
          <h2 className="info-name">Guaranteed fast delivery</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame3.png"
            alt="Pizza"
          />
          <h2 className="info-name">Delicious Pizza</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
