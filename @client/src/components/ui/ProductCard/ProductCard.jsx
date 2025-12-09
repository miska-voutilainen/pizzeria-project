import SquareButton from "../SquareButton/SquareButton";
import "./ProductCard.css";

const ProductCard = ({ pizza }) => {
  return (
    <article key={pizza.slug} className="product-card">
      <div className="product-image-container">
        <img
          src={pizza.imgUrl}
          alt={pizza.name}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="product-content">
        <h2 className="product-name">{pizza.name}</h2>
        <p className="product-description">{pizza.description}</p>
        <div className="product-card-price-row">
          <span className="product-price">{pizza.price} €</span>
          <SquareButton
            type="add"
            onClick={() => console.log(`Added ${pizza.name} to cart`)}
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
