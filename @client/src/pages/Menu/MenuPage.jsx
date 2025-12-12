import { useEffect, useState } from "react";
import { getPizzas, getDrinks } from "../../lib/api/products.js";
import ProductCard from "../../components/ui/ProductCard/ProductCard.jsx";
import "./MenuPage.css";
import Newsletter from "../../components/layout/Newsletter/Newsletter.jsx";
import PromoSlide from "../../components/layout/PromoSlide/PromoSlide.jsx";
import RadioButton from "../../components/ui/RadioButton/RadioButton.jsx";
import useLanguage from "../../context/useLanguage.jsx";

const MenuPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("pizza");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "pizza", label: t("products.pizza"), fetch: getPizzas },
    { id: "drinks", label: t("products.drinks"), fetch: getDrinks },
  ];

  const currentCategory = categories.find((c) => c.id === activeTab);

  useEffect(() => {
    setLoading(true);
    currentCategory
      .fetch()
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load ${activeTab}:`, err);
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <>
      <section id="menu-page">
        <div className="category-tabs">
          {categories.map((cat) => (
            <RadioButton
              text={cat.label}
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              active={activeTab === cat.id}
            />
          ))}
        </div>

        <div className="product-grid">
          {loading ? (
            <p className="loading-text">{t("common.loading")}</p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.slug} pizza={product} />
            ))
          ) : (
            <p className="loading-text">{t("menu.noItems")}</p>
          )}
        </div>
      </section>
      <Newsletter />
      <PromoSlide />
    </>
  );
};

export default MenuPage;
