import React from "react";
import "./MapModal.css";
import CloseButton from "../../ui/CloseButton/CloseButton.jsx";

const MapModal = ({ onClose }) => {
  React.useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const initMap = () => {
      try {
        const mapEl = document.getElementById("map");
        if (mapEl && !mapEl._mapInitialized && window.google?.maps) {
          const map = new window.google.maps.Map(mapEl, {
            center: { lat: 60.1699, lng: 24.9384 }, // Helsinki
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            gestureHandling: "greedy",
          });

          new window.google.maps.Marker({
            position: { lat: 60.1699, lng: 24.9384 },
            map,
          });

          mapEl._mapInitialized = true;
        }
      } catch (e) {
        console.error("Map init error:", e);
      }
    };

    if (window.google?.maps) {
      initMap();
      return;
    }

    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not set.");
      return;
    }

    if (window._googleMapsLoading) {
      const checker = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checker);
          initMap();
        }
      }, 200);
      return () => clearInterval(checker);
    }

    window._googleMapsLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window._googleMapsLoading = false;
      initMap();
    };
    script.onerror = () => {
      window._googleMapsLoading = false;
      console.error("Failed to load Google Maps");
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div id="mapModalContent">
      <CloseButton onClick={onClose} className="map-modal-close" />
      <div className="map-modal-container">
        <div id="map" className="map-container" />
        <div className="list-panel" />
      </div>
    </div>
  );
};

export default MapModal;
