import "./WhyUs.css";

const WhyUs = () => {
  return (
    <section className="info-section">
      <h2 className="info-title">Why Choose Us?</h2>
      <div className="separator-line"></div>

      <div className="info-grid">
        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame.png"
            alt="Fresh ingredients"
          />
          <h3 className="info-name">Fresh ingredients</h3>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>

        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame2.png"
            alt="Fast delivery"
          />
          <h3 className="info-name">Guaranteed fast delivery</h3>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>

        <div className="info-item">
          <img
            src="https://s3.eu-north-1.amazonaws.com/mahalna.images/Frame3.png"
            alt="Delicious pizza"
          />
          <h3 className="info-name">Delicious Pizza</h3>
          <p className="info-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
