// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { getAllProducts } from "../utils/fetchApi.js"; // correct
import { useNavigate } from "react-router-dom";
import "../styles/pages/HomePage.css";

// your images...
import cover from "../assets/cover.png";
import cover2 from "../assets/cover2.jpg";
import cover3 from "../assets/cover3.jpg";
import cover4 from "../assets/cover4.jpg";
import cover5 from "../assets/cover5.jpg";
import cover6 from "../assets/cover6.jpg";
import cover7 from "../assets/cover7.jpg";
import cover8 from "../assets/cover8.jpg";

const images = [cover, cover2, cover3, cover4, cover5, cover6, cover7, cover8];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getAllProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const displayed = products.slice(0, 8);

  return (
    <div>
      {/* Hero slider */}
      <div className="hero-slider-wrapper">
        <div className="hero-slider-container">
          <div className="hero-slider">
            <img src={images[current]} className="hero-image" alt="Promotion" />
          </div>
        </div>
        <div className="slider-indicators">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`slider-dot ${
                i === current ? "slider-dot-active" : ""
              }`}
            />
          ))}
        </div>
      </div>

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
    </div>
  );
};

export default HomePage;
