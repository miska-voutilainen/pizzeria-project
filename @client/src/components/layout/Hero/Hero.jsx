import React, { useEffect, useState } from "react";
import cover1 from "../../../assets/images/cover1.png";
import cover2 from "../../../assets/images/cover2.jpg";
import cover4 from "../../../assets/images/cover4.jpg";
import cover5 from "../../../assets/images/cover5.jpg";
import cover6 from "../../../assets/images/cover6.jpg";
import cover7 from "../../../assets/images/cover7.jpg";
import cover8 from "../../../assets/images/cover8.jpg";
import "./Hero.css";

const images = [cover1, cover2, cover4, cover5, cover6, cover7, cover8];

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
