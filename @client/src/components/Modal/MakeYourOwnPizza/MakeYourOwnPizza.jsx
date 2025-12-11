import makeYourOwnPizzaImage from "../../../assets/images/make-your-own-pizza.png";
import Button from "../../ui/Button/Button.jsx";
import "./MakeYourOwnPizza.css"
import {useState} from "react";
import IngredientCard from "../../ui/IngredientCard/IngredientCard.jsx";
import RadioButton from "../../ui/RadioButton/RadioButton.jsx";
import CloseButton from "../../ui/CloseButton/CloseButton.jsx";
const MakeYourOwnPizza = ({onClose}) => {

    const lengths = {
        "20 cm": 10,
        "25 cm": 15,
        "30 cm": 20,
        "35 cm": 25
    }


    const [price, setPrice] = useState(20);
    const [lenght, setLength] = useState("20 cm");
    const [dough, setDough] = useState("Traditional");


    const changePrice = (cLength) => {
        setPrice(price - lengths[lenght] + lengths[cLength]); setLength(cLength);
    }


    return (
        <div id="make-your-own-pizza-container">
            <CloseButton onClick={onClose} />
            <img id="pizza-image" src={makeYourOwnPizzaImage} alt="Make Your Own Pizza"/>
            <img src="./make-your-own-pizza-line.svg" alt="Line"/>
            <div id="make-your-own-pizza-right-side">
                <div id="make-your-own-pizza-text">
                    <h1>Make Your Own Pizza</h1>
                    <p id="make-your-own-pizza-description">Choose your favorite dough, pick the sauce that fits your taste, add cheese, and finish it with any toppings you love.
                        Whether you prefer classic flavors or bold combinations — the choice is entirely yours.
                        Craft it, bake it, enjoy it!</p>
                    <div id="length-and-dough">
                        <div id="length">
                            {["20 cm", "25 cm", "30 cm", "35 cm"].map((len) => (
                                <RadioButton
                                    key={len}
                                    text={len}
                                    active={lenght === len}
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
                    <div id="ingredients-list">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <IngredientCard name="Bacon" img="./bacon.png" ingredientPrice={2.5} price={price} setPrice={setPrice} />
                        ))}
                    </div>
                    <Button text={`Add to Cart ${price}€`}  id="make-your-own-pizza-button" onClick/>
                </div>
            </div>
            </div>
        );
}

export default MakeYourOwnPizza;
