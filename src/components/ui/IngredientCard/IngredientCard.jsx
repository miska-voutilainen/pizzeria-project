import "./IngredientCard.css";
import QuantityInput from "../QuantityInput/QuantityInput.jsx";
import { useState } from "react";

const IngredientCard = ({ img, name, ingredientPrice, price, setPrice }) => {
  const [quantity, setQuantity] = useState(0);

  const onIncrease = () => {
    setQuantity((q) => q + 1);
    setPrice((prev) => prev + ingredientPrice);
  };

  const onDecrease = () => {
    if (quantity > 0) {
      setQuantity((q) => q - 1);
      setPrice((prev) => prev - ingredientPrice);
    }
  };

  return (
    <div
      className="ingredient-card"
      data-ingredient-name={name}
      data-quantity={quantity}
    >
        <div className="image-container">
      <img src={img} alt={name} className="ingredient-image" />
        </div>
      <div className="ingredient-info">
        <h1 className="ingredient-header">{name}</h1>
        <p className="ingredient-price">+{ingredientPrice.toFixed(2)}€</p>
      </div>
      <div className="quantity-input-container">
        <QuantityInput
          quantity={quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />
      </div>
    </div>
  );
};

export default IngredientCard;
