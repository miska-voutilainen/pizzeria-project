import { useEffect, useState } from "react";

const HomePage = () => {
  const [foods] = useState([]);

  useEffect(() => {
    const loadFoods = async () => {
      //const data = await getFoods();
      //setFoods(data);
    };
    loadFoods();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-4xl font-bold text-center text-red-600 mb-8">
        🍕 Our Menu
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {foods.length > 0 ? (
          foods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
            >
              <img
                src={food.imgUrl}
                alt={food.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4 text-left">
                <h2 className="text-xl font-bold">{food.name}</h2>
                <p className="text-gray-600 text-sm">{food.description}</p>
                <span className="block mt-2 text-red-600 font-semibold">
                  {food.price} $
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Loading foods...</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
