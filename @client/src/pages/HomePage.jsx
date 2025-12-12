import { useEffect, useState } from "react";
import { getPizzas } from "../lib/api/products.js";
import { useNavigate } from "react-router-dom";
import useLanguage from "../context/useLanguage.jsx";

import Hero from "../components/layout/Hero/Hero.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";

import "../styles/pages/HomePage.css";
import Newsletter from "../components/layout/Newsletter/Newsletter.jsx";
import PromoSlide from "../components/layout/PromoSlide/PromoSlide.jsx";
import WhyUs from "../components/layout/WhyUs/WhyUs.jsx";
import ProductCard from "../components/ui/ProductCard/ProductCard.jsx";
import SquareButton from "../components/ui/SquareButton/SquareButton.jsx";
import Button from "../components/ui/Button/Button.jsx";

const HomePage = () => {
  const [pizzas, setPizzas] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    getPizzas()
      .then(setPizzas)
      .catch((err) => console.error("Failed to load pizzas:", err));
  }, []);

  const displayedPizzas = pizzas.slice(0, 8);

  return (
    <div>
      {/* <SignIn /> */}
      <Hero />

      <section id="home-products">
        <h1 className="page-title">─ {t("products.pizza")} ─</h1>
        <div className="product-grid">
          {displayedPizzas.length > 0 ? (
            displayedPizzas.map((pizza) => (
              <ProductCard key={pizza.slug} pizza={pizza} />
            ))
          ) : (
            <p className="loading-text">{t("common.loading")}</p>
          )}
        </div>

        <div className="products-view-all-btn-container">
          <Button url="/menu" text={t("navigation.menu")} />
        </div>
      </section>

      <WhyUs />
      <Newsletter />
      <PromoSlide />
    </div>
  );
};

export default HomePage;
