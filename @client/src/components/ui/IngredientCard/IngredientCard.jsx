import "./IngredientCard.css"

const IngredientCard = ({img, name, price, input}) => {
    return <div className="ingredient-card">
        <img src={img} alt={name} className="ingredient-image"/>
        <div className="ingredient-info">
            <h1 className="ingredient-header">{name}</h1>
            <p className="ingredient-price">{price}€</p>
        </div>
        <p>Hui</p>
    </div>;
}

export default IngredientCard;