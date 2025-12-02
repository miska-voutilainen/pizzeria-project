import { useEffect, useState } from "react";
import { getFoods } from "./fetchApi";

const MenuPage = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const loadFoods = async () => {
      const data = await getFoods();
      setFoods(data);
    };
    loadFoods();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      {/* Header with back button */}

      <div className="max-w-1200 mx-auto mb-8">
        <h1 className="page-title"> ─ Full Menu ─ </h1>
      </div>

      {/* Full Food Grid */}
      <div className="food-grid">
        {foods.length > 0 ? (
          foods.map((food) => (
            <div key={food._id} className="food-card">
              <div className="food-image-container">
                <img src={food.imgUrl} alt={food.name} className="food-image" />
              </div>
              <div className="food-content">
                <h2 className="food-name">{food.name}</h2>
                <p className="food-description">{food.description}</p>
                <span className="food-price">{food.price} €</span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text">Loading menu...</p>
        )}
      </div>
    </div>
  );
};
export default MenuPage;
