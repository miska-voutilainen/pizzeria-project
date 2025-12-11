import "./WhyUs.css";
import useLanguage from "../../../context/useLanguage.jsx";

const WhyUs = () => {
  const { t } = useLanguage();

  return (
    <section className="info-section">
      <h2 className="info-title">{t("whyUs.title")}</h2>
      <div className="separator-line"></div>

      <div className="info-grid">
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame.png"
            alt={t("whyUs.freshIngredients")}
          />
          <h3 className="info-name">{t("whyUs.freshIngredients")}</h3>
          <p className="info-description">{t("whyUs.description")}</p>
        </div>

        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame2.png"
            alt={t("whyUs.fastDelivery")}
          />
          <h3 className="info-name">{t("whyUs.fastDelivery")}</h3>
          <p className="info-description">{t("whyUs.description")}</p>
        </div>

        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame3.png"
            alt={t("whyUs.quality")}
          />
          <h3 className="info-name">{t("whyUs.quality")}</h3>
          <p className="info-description">{t("whyUs.description")}</p>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
