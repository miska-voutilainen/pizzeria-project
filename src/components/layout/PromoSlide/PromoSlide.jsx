import "./PromoSlide.css";
import { useEffect, useRef, useState } from "react";
import pizzaIcon from "../../../assets/images/ticker-slider-pizza.svg";
import slicerIcon from "../../../assets/images/ticker-slider-slicer.svg";

const PromoSlide = () => {
  const messages = ["ALWAYS FRESH", "FAST DELIVERY", "IT'S ALWAYS PIZZA TIME!"];
  const separators = [pizzaIcon, slicerIcon];
  const containerRef = useRef(null);
  const [elements, setElements] = useState([]);

  const createElements = (count) => {
    const result = [];
    for (let rep = 0; rep < count; rep++) {
      for (let i = 0; i < messages.length; i++) {
        result.push(
          <span key={`msg-${rep}-${i}`} className="ticker-message">
            {messages[i]}
          </span>
        );
        if (rep < count - 1 || i < messages.length - 1) {
          const sepIndex = (rep * messages.length + i) % separators.length;
          result.push(
            <img
              key={`sep-${rep}-${i}`}
              className="ticker-separator"
              src={separators[sepIndex]}
              alt="slider separator"
            />
          );
        }
      }
    }
    return result;
  };

  useEffect(() => {
    const updateContent = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const avgLength =
        messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length;
      const groupWidth = avgLength * 15 * 1.8;
      const count = Math.min(
        Math.max(Math.ceil((width * 3) / groupWidth), 3),
        20
      );

      setElements(createElements(count));
    };

    const timer = setTimeout(updateContent, 100);
    window.addEventListener("resize", updateContent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateContent);
    };
  }, []);

  return (
    <div className="ticker-wrapper" ref={containerRef}>
      <div className="ticker">
        <span className="ticker-content">{elements}</span>
        <span className="ticker-content">{elements}</span>
      </div>
    </div>
  );
};

export default PromoSlide;
