import { useCart } from "../../../context/CartContext";
import RaisedButtonWide from "../RaisedButtonWide/RaisedButtonWide";
import SquareButton from "../SquareButton/SquareButton";
import "./ProductCard.css";

const ProductCard = ({ pizza }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

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
          <RaisedButtonWide
            type="cart"
            product={pizza}
            onClick={handleAddToCart}
            text="Lisää"
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
