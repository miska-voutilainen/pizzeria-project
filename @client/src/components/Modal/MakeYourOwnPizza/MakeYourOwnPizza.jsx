import makeYourOwnPizzaImage from "../../../assets/images/make-your-own-pizza.png";
import Button from "../../ui/Button/Button.jsx";
import "./MakeYourOwnPizza.css";
import { useState, useEffect } from "react";
import IngredientCard from "../../ui/IngredientCard/IngredientCard.jsx";
import RadioButton from "../../ui/RadioButton/RadioButton.jsx";
import CloseButton from "../../ui/CloseButton/CloseButton.jsx";
import { useCart } from "../../../context/CartContext.jsx"; // ← ADD THIS

const MakeYourOwnPizza = ({ onClose }) => {
  const { addToCart } = useCart(); // ← GET addToCart

  const lengths = {
    "20 cm": 10,
    "25 cm": 15,
    "30 cm": 20,
    "35 cm": 25,
  };

  const [price, setPrice] = useState(20);
  const [length, setLength] = useState("20 cm");
  const [dough, setDough] = useState("Traditional");
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ingredients`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error(err));
  }, []);

  const changePrice = (newLength) => {
    setPrice((prev) => prev - lengths[length] + lengths[newLength]);
    setLength(newLength);
  };

  const handleAddToCart = () => {
    // Get selected ingredients from your IngredientCard (it adds .selected = true when clicked)
    const selected =
      ingredients
        .filter((ing) => ing.selected)
        .map((ing) => ing.name)
        .join(", ") || "Plain";

    const customPizza = {
      id: `custom-${Date.now()}`,
      slug: `custom-${Date.now()}`,
      name: `Custom Pizza (${length})`,
      price: price,
      image: makeYourOwnPizzaImage,
      ingredients: selected,
      isCustom: true,
      quantity: 1,
    };

    addToCart(customPizza); // ← Adds to real cart
    onClose(); // ← Closes modal
  };

  return (
    <div id="make-your-own-pizza-container">
      <CloseButton onClick={onClose} />
      <img
        id="pizza-image"
        src={makeYourOwnPizzaImage}
        alt="Make Your Own Pizza"
      />
      <img
        src="./make-your-own-pizza-line.svg"
        alt="Line"
        className="image-line"
      />

      <div id="make-your-own-pizza-right-side">
        <div id="make-your-own-pizza-text">
          <h1>Make Your Own Pizza</h1>
          <p id="make-your-own-pizza-description">
            Choose your favorite dough, pick the sauce that fits your taste, add
            cheese, and finish it with any toppings you love.
          </p>

          <div id="length-and-dough">
            <div id="length">
              {["20 cm", "25 cm", "30 cm", "35 cm"].map((len) => (
                <RadioButton
                  key={len}
                  text={len}
                  active={length === len}
                  onClick={() => changePrice(len)}
                />
              ))}
            </div>
            <div id="dough">
              {["Traditional", "Active"].map((d) => (
                <RadioButton
                  key={d}
                  text={d}
                  active={dough === d}
                  onClick={() => setDough(d)}
                />
              ))}
            </div>
          </div>
        </div>

        <div id="add-ingredients">
          <h2>Add Ingredients</h2>
          <div id="ingredients-list">
            {ingredients.map((ing) => (
              <IngredientCard
                key={ing.id}
                name={ing.name}
                img={ing.imgUrl}
                ingredientPrice={parseFloat(ing.price)}
                price={price}
                setPrice={setPrice}
              />
            ))}
          </div>

          <Button
            text={`Add to Cart ${price.toFixed(2)}€`}
            id="make-your-own-pizza-button"
            onClick={() => {
              // Get only topping names (no quantities)
              const selectedToppings = Array.from(
                document.querySelectorAll(".ingredient-card")
              )
                .map((card) => {
                  const name = card.dataset.ingredientName;
                  const qty = Number(card.dataset.quantity || 0);
                  return qty > 0 ? name : null;
                })
                .filter(Boolean);

              const toppingsText =
                selectedToppings.length > 0
                  ? selectedToppings.join(", ")
                  : "N/A";

              const customPizza = {
                id: `custom-${Date.now()}`,
                slug: `custom-pizza-${Date.now()}`,
                name: "Custom pizza",
                price: Number(price.toFixed(2)),
                image: makeYourOwnPizzaImage,
                size: length, // e.g. "30 cm"
                base: dough, // e.g. "Traditional" or "Active"
                ingredients: toppingsText,
                isCustom: true,
                quantity: 1,
              };

              addToCart(customPizza);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MakeYourOwnPizza;
