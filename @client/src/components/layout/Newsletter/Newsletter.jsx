import React from "react";
import "./Newsletter.css";

import image from "../../../assets/images/newsletter-image.jpg";

import "./Newsletter.css";

const Newsletter = () => {
  return (
    <section id="newsletter">
      <div className="newsletter-wrapper">
        <div className="newsletter-image-container">
          <img
            src="src/assets/images/newsletter-sale-vector.svg"
            alt="save-vector"
            className="newsletter-sale-vector"
          />
          <img
            className="newsletter-image"
            src={image}
            alt="newsletter-image"
          />
        </div>

        <div className="newsletter-inputs-container">
          <h1>Subscribe and get 10% off!*</h1>
          <ul>
            <li>
              <span>10% alennus ensimmäisestä tilauksesta!</span>
            </li>
            <li>
              <span>Viikottaisia alennuksia</span>
            </li>
          </ul>
          <div className="newsletter-inputs">
            <label htmlFor="email">*T & Cs apply</label>
            <div className="newsletter-inputs-email">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john.smith@gmail.com"
              />
              <input type="submit" value="Submit" />
            </div>
            <div className="newsletter-inputs-accept-terms">
              <input
                type="checkbox"
                id="accept-terms"
                name="accept-terms"
                value="accept-terms"
              />
              <label for="accept-terms">Accept terms</label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
