import React, { useEffect, useRef } from "react";
import "./AboutUsPage.css";
import aboutUsLeft from "../../assets/images/about-us-left.png";
import aboutUsRight from "../../assets/images/about-us-right.png";
import SquareButton from "../../components/ui/SquareButton/SquareButton";

const AboutUsPage = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps API dynamically
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!window.google && apiKey) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = false;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else if (window.google) {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const location = { lat: 60.1665, lng: 24.9355 };
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: location,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });

      new window.google.maps.Marker({
        position: location,
        map: map,
        title: "Pizzeria - Lönnrotinkatu",
      });
    }
  };
  return (
    <>
      <section id="our-story">
        <img
          className="our-story-img-left"
          src={aboutUsLeft}
          alt="our-story-background"
        />
        <div className="our-story-wrapper">
          <h1>Our story</h1>
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
          <h1>Our philosophy</h1>
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
              <h1>Contact us</h1>

              <ul>
                <li>Kalevankatu 2, 00100 Helsinki</li>
                <br />
                <li>
                  Open:<br></br> Mon - Fri 10:00 - 18:00<br></br>Sat - Sun 12:00
                  - 16:00
                </li>
                <br />
                <li>
                  <a href="mailto:support@pizzeria-web.com">
                    support@pizzeria-web.com
                  </a>
                </li>
              </ul>
            </div>

            <div
              className="contact-info-map"
              ref={mapRef}
              style={{ width: "550px", height: "400px", borderRadius: "8px" }}
            ></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;
