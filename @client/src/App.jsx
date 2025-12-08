import React from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/layout/Navigation/NavigationBar.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";

const App = () => {
  return (
    <>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default App;
