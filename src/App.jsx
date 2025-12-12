import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "./components/layout/Navigation/NavigationBar/NavigationBar.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";

const App = () => {
  const location = useLocation();
  const isOrderConfirmation = location.pathname === "/order-confirmation";
  const isEmailConfirmation = location.pathname === "/email-confirmation";
  const isCheckout = location.pathname === "/checkout";

  return (
    <>
      {!isOrderConfirmation && !isEmailConfirmation && !isCheckout && (
        <NavigationBar />
      )}
      <main>
        <Outlet />
      </main>
      {!isOrderConfirmation && !isEmailConfirmation && !isCheckout && (
        <Footer />
      )}
    </>
  );
};

export default App;
