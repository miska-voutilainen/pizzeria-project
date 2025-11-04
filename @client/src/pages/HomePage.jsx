const HomePage = () => {
  const foods = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Classic delight with fresh tomatoes, mozzarella & basil.",
      price: "$10.99",
      image: "https://lejos.fi/wp-content/uploads/2019/05/theme-pizza-hero.jpg",
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      description: "Loaded with pepperoni and gooey cheese goodness.",
      price: "$12.99",
      image:
        "https://st3.depositphotos.com/1319768/36223/v/1600/depositphotos_362236708-stock-illustration-pizza-vector-illustration-hand-drawn.jpg",
    },
    {
      id: 3,
      name: "Veggie Supreme",
      description: "Packed with bell peppers, olives, onions, and mushrooms.",
      price: "$11.99",
      image:
        "https://pienipunainenkeittio.com/wp-content/uploads/Retro-grillipizza-scaled.jpg",
    },
    {
      id: 4,
      name: "BBQ Chicken Pizza",
      description: "Smoky BBQ sauce, grilled chicken, and red onions.",
      price: "$13.99",
      image: "https://assets.lily.fi/uploads/sites/7990/DSC_0261-scaled.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white py-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">🍕 Bella Pizza</h1>
          <ul className="flex space-x-6">
            <li>
              <a href="#home" className="hover:text-yellow-300">
                Home
              </a>
            </li>
            <li>
              <a href="#menu" className="hover:text-yellow-300">
                Menu
              </a>
            </li>
            <li>
              <a href="Toimipisteet" className="hover:text-yellow-300">
                Contact
              </a>
            </li>
            <li>
              <a href="profile" className="hover:text-yellow-300">
                Profile
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-start flex-grow text-center">
        <h1 className="text-5xl font-extrabold text-red-600 mt-10">
          🍕 Our Menu
        </h1>

        {/* Container for food items */}
        <div className="bg-white rounded-2xl shadow-xl p-6 w-11/12 md:w-3/4 lg:w-2/3 max-h-[50vh] overflow-y-auto mt-10 mb-10">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-yellow-100 rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    {food.name}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {food.description}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-semibold text-red-600">
                      {food.price}
                    </span>
                    <button className="bg-red-600 text-white px-3 py-1 rounded-full text-xs hover:bg-red-700 transition">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
