import "./IngredientCard.css"
import QuantityInput from "../QuantityInput/QuantityInput.jsx";
import {useState} from "react";

const IngredientCard = ({img, name, ingredientPrice, price, setPrice, }) => {

    const ingredientOnIncrease = () => {
        setPrice(price + ingredientPrice);
        setQuantity(quantity+1);
    }

    const ingredientOnDecrease = () => {
        if (quantity > 0) {
            setQuantity(quantity - 1);
            setPrice(price - ingredientPrice);
        }
    }

    const [quantity, setQuantity] = useState(0);

    return (<div className="ingredient-card">
        <img src={img} alt={name} className="ingredient-image"/>
        <div className="ingredient-info">
            <h1 className="ingredient-header">{name}</h1>
            <p className="ingredient-price">{ingredientPrice}€</p>
        </div>
        <div className="quantity-input-container">
        <QuantityInput quantity={quantity} onIncrease={ingredientOnIncrease} onDecrease={ingredientOnDecrease} />
        </div>
    </div>);
}

export default IngredientCard;