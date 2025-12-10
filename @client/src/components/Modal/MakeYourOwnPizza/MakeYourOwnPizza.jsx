import makeYourOwnPizzaImage from "../../../assets/images/make-your-own-pizza.png";
import Button from "../../ui/Button/Button.jsx";
import "./MakeYourOwnPizza.css"
import {useState} from "react";
import IngredientCard from "../../ui/IngredientCard/IngredientCard.jsx";

const MakeYourOwnPizza = () => {

    const [price, setPrice] = useState(0);
    return (
        <div id="make-your-own-pizza-container">
            <img id="pizza-image" src={makeYourOwnPizzaImage} alt="Make Your Own Pizza"/>
            <img src="./make-your-own-pizza-line.svg" alt="Line"/>
            <div id="make-your-own-pizza-right-side">
                <div id="make-your-own-pizza-text">
                    <h1>Make Your Own Pizza</h1>
                    <p id="make-your-own-pizza-description">Choose your favorite dough, pick the sauce that fits your taste, add cheese, and finish it with any toppings you love.
                        Whether you prefer classic flavors or bold combinations — the choice is entirely yours.
                        Craft it, bake it, enjoy it!</p>
                    <div id="length-and-dough">
                        <div id="length"></div>
                        <div id="dougth"></div>
                    </div>
                </div>
                <div id="add-ingredients">
                    <h2>Add Ingredients</h2>
                    <div id="ingredients-list">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <IngredientCard name="Bacon" img="./bacon.png" price={2.5}/>
                        ))}
                    </div>
                    <Button text={`Add to Cart ${price}€`}  id="make-your-own-pizza-button" />
                </div>
            </div>
            </div>
        );
}

export default MakeYourOwnPizza;
