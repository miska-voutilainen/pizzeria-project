import { useEffect, useState } from "react";
import { getFoods } from "./fetchApi";
import { useNavigate } from "react-router-dom";
import "../styles/pages/HomePage.css";
import cover from "../assets/cover.png";
import cover2 from "../assets/cover2.jpg";
import cover3 from "../assets/cover3.jpg";
import cover4 from "../assets/cover4.jpg";
import cover5 from "../assets/cover5.jpg";
import cover6 from "../assets/cover6.jpg";
import cover7 from "../assets/cover7.jpg";
import cover8 from "../assets/cover8.jpg";

const images = [cover, cover2, cover3, cover4, cover5, cover6, cover7, cover8];
//const sides = [side1, side2, side3, side4];

const HomePage = () => {
  const [foods, setFoods] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFoods = async () => {
      const data = await getFoods();
      setFoods(data);
    };
    loadFoods();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Function to handle navigation to menu page
  const handleRouteMenu = () => {
    navigate("/menu");
  };

  // Always show only first 8 items on home page
  const displayedFoods = foods.slice(0, 8);

  return (
    <div className="min-h-screen bg-yellow-50 p-6 relative">
      {/* Multiple Small Left Side Images 
      <div className="left-side-images-container">
        <div className="side-image side-image-top side-image-rotate">
          <img src={sides[0]} alt="Decorative element 1" />
        </div>
        <div className="side-image side-image-bottom side-image-pulse">
          <img src={sides[1]} alt="Decorative element 2" />
        </div>
      </div>


      {/*
      {/* Multiple Small Right Side Images 
      <div className="right-side-images-container">
        <div className="side-image side-image-top side-image-bounce">
          <img src={sides[2]} alt="Decorative element 3" />
        </div>
        <div className="side-image side-image-bottom side-image-spin">
          <img src={sides[3]} alt="Decorative element 4" />
        </div>
      </div>

      */}

      {/* 📌 Hero Slider - Standard Fixed Container */}
      <div className="hero-slider-wrapper">
        <div className="hero-slider-container">
          <div className="hero-slider">
            <img src={images[current]} className="hero-image" alt="promo" />
          </div>
        </div>

        {/* Navigation dots - outside the container */}
        <div className="slider-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`slider-dot ${
                index === current ? "slider-dot-active" : ""
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 🍕 Title */}
      <h1 className="page-title"> ─ Pizzat ─</h1>

      {/* 🍽 Food Grid - Only shows 8 items */}
      <div className="food-grid">
        {displayedFoods.length > 0 ? (
          displayedFoods.map((food) => (
            <div key={food._id} className="food-card">
              <div className="food-image-container">
                <img src={food.imgUrl} alt={food.name} className="food-image" />
              </div>
              <div className="food-content">
                <h2 className="food-name">{food.name}</h2>
                <p className="food-description">{food.description}</p>
                <span className="food-price">{food.price} €</span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text">Loading foods...</p>
        )}
      </div>

      {/* View Full Menu Button - Shows if there are more than 8 items With Drinks */}
      {foods.length > 8 && (
        <div className="text-center mt-8">
          <button
            onClick={handleRouteMenu}
            className="view-menu-button bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            View Full Menu {/*({foods.length - 8} more items)*/}
          </button>
        </div>
      )}

      {/* Title */}
      <h1 className="info-title">Why Choose Us?</h1>

      {/* Separator Line */}
      <div className="separator-line"></div>

      {/* Why us Grid */}
      <div className="info-grid">
        {/* Item 1 */}
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame.png"
            alt="Fresh ingredients"
          />
          <h2 className="info-name">Fresh ingredients</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>

        {/* Item 2 */}
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame2.png"
            alt="Fast delivery"
          />
          <h2 className="info-name">Guaranteed fast delivery</h2>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>

        {/* Item 3 */}
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame3.png"
            alt="Delicious pizza"
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
