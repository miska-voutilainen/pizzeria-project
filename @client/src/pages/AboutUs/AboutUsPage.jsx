import React, { useEffect, useRef } from "react";
import "./AboutUsPage.css";
import aboutUsLeft from "../../assets/images/about-us-left.png";
import aboutUsRight from "../../assets/images/about-us-right.png";
import SquareButton from "../../components/ui/SquareButton/SquareButton";
import useLanguage from "../../context/useLanguage.jsx";

const AboutUsPage = () => {
  const { t } = useLanguage();
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
        title: t("about.mapMarkerTitle"),
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
          <h1>{t("about.ourStory")}</h1>
          <p>{t("about.storyP1")}</p>
          <p>{t("about.storyP2")}</p>
        </div>
        <img
          className="our-story-img-right"
          src={aboutUsRight}
          alt="our-story-background"
        />
      </section>
      <section id="philosophy">
        <div className="philosophy-wrapper">
          <h1>{t("about.philosophyTitle")}</h1>
          <p>{t("about.philosophyP")}</p>
          <ul>
            <li>{t("about.philosophyLi1")}</li>
            <li>{t("about.philosophyLi2")}</li>
            <li>{t("about.philosophyLi3")}</li>
          </ul>
          <p>{t("about.philosophyP2")}</p>
        </div>
      </section>
      <section id="contact-info">
        <div className="contact-info-wrapper">
          <div className="contact-info-content">
            <div>
              <h1>{t("about.contactUs")}</h1>

              <ul>
                <li>{t("about.address")}</li>
                <br />
                <li>
                  {t("about.openingLabel")}
                  <br></br>
                  {t("about.openingHours")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </li>
                <br />
                <li>
                  <a href={`mailto:${t("about.supportEmail")}`}>
                    {t("about.supportEmail")}
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
