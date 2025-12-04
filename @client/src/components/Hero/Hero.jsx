import React from "react";
import { useEffect, useState } from "react";

import cover from "../../assets/cover.png";
import cover2 from "../../assets/cover2.jpg";
import cover4 from "../../assets/cover4.jpg";
import cover5 from "../../assets/cover5.jpg";
import cover6 from "../../assets/cover6.jpg";
import cover7 from "../../assets/cover7.jpg";
import cover8 from "../../assets/cover8.jpg";

import "./Hero.css";

const images = [cover, cover2, cover4, cover5, cover6, cover7, cover8];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero-slider">
      <div className="hero-slider-container">
        <div className="hero-slider">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              className={`hero-image ${index === current ? "active" : ""}`}
              alt="Promotion"
            />
          ))}
        </div>
      </div>
      <div className="slider-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`slider-dot ${i === current ? "slider-dot-active" : ""}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
