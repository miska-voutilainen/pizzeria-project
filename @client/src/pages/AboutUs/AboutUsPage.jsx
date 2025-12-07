import React from "react";
import "./AboutUsPage.css";
import aboutUsLeft from "../../assets/images/about-us-left.png";
import aboutUsRight from "../../assets/images/about-us-right.png";
import mapPlaceholder from "../../assets/images/map-placeholder.jpg";

const AboutUsPage = () => {
  return (
    <>
      <section id="our-story">
        <img
          className="our-story-img-left"
          src={aboutUsLeft}
          alt="our-story-background"
        />
        <div className="our-story-wrapper">
          <h1>Tarinamme</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse.
            <br />
            <br />
            Cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
        <img
          className="our-story-img-right"
          src={aboutUsRight}
          alt="our-story-background"
        />
      </section>
      <section id="philosophy">
        <div className="philosophy-wrapper">
          <h1>Filosofiamme</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <ul>
            <li>ipsum dolor sit amet</li>
            <li>ad minim veniam, quis nostrud exe</li>
            <li>ore et dolore magna</li>
          </ul>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </section>
      <section id="contact-info">
        <div className="contact-info-wrapper">
          <div className="contact-info-content">
            <div>
              <h1>Yhteystiedot</h1>

              <ul>
                <li>Pizzakatu 6, 00170 Helsinki</li>
                <li>
                  <a href="tel:+358508353552">+358 50 8353 552</a>
                </li>
                <li>
                  <a href="mailto:hello@pizza-web.fi">hello@pizza-web.fi</a>
                </li>
              </ul>
            </div>

            <div className="contact-info-map">
              <img src={mapPlaceholder} alt="map placeholder" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;
