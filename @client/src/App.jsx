import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "./components/layout/Navigation/NavigationBar.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";

const App = () => {
  const location = useLocation();
  const isOrderConfirmation = location.pathname === "/order-confirmation";
  const isCheckout = location.pathname === "/checkout";

  return (
    <>
      {!isOrderConfirmation && !isCheckout && <NavigationBar />}
      <main>
        <Outlet />
      </main>
      {!isOrderConfirmation && !isCheckout && <Footer />}
    </>
  );
};

export default App;
