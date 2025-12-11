import makeYourOwnPizzaImage from "../../../assets/images/make-your-own-pizza.png";
import Button from "../../ui/Button/Button.jsx";
import "./MakeYourOwnPizza.css";
import { useState, useEffect } from "react";
import IngredientCard from "../../ui/IngredientCard/IngredientCard.jsx";
import RadioButton from "../../ui/RadioButton/RadioButton.jsx";
import CloseButton from "../../ui/CloseButton/CloseButton.jsx";

const MakeYourOwnPizza = ({ onClose }) => {
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
  const [loading, setLoading] = useState(true);

  // Fetch ingredients from your new API route
  useEffect(() => {
    fetch("http://localhost:3001/api/ingredients", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ingredients:", err);
        setLoading(false);
      });
  }, []);

  const changePrice = (newLength) => {
    setPrice((prev) => prev - lengths[length] + lengths[newLength]);
    setLength(newLength);
  };

  return (
    <div id="make-your-own-pizza-container">
      <CloseButton onClick={onClose} />

      <img
        id="pizza-image"
        src={makeYourOwnPizzaImage}
        alt="Make Your Own Pizza"
      />
      <img src="./make-your-own-pizza-line.svg" alt="Line" />

      <div id="make-your-own-pizza-right-side">
        <div id="make-your-own-pizza-text">
          <h1>Make Your Own Pizza</h1>
          <p id="make-your-own-pizza-description">
            Choose your favorite dough, pick the sauce that fits your taste, add
            cheese, and finish it with any toppings you love. Whether you prefer
            classic flavors or bold combinations — the choice is entirely yours.
            Craft it, bake it, enjoy it!
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
              {["Traditional", "Active"].map((doughType) => (
                <RadioButton
                  key={doughType}
                  text={doughType}
                  active={dough === doughType}
                  onClick={() => setDough(doughType)}
                />
              ))}
            </div>
          </div>
        </div>

        <div id="add-ingredients">
          <h2>Add Ingredients</h2>

          {loading ? (
            <p>Loading ingredients...</p>
          ) : ingredients.length === 0 ? (
            <p>No ingredients found.</p>
          ) : (
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
          )}

          <Button
            text={`Add to Cart ${price.toFixed(2)}€`}
            id="make-your-own-pizza-button"
            onClick={() => {
              alert(
                `Pizza added! Size: ${length}, Dough: ${dough}, Price: ${price.toFixed(
                  2
                )}€`
              );
              // Add your real cart logic here later
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MakeYourOwnPizza;
