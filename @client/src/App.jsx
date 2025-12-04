import React from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/layout/Navigation/NavigationBar.jsx";

const App = () => {
  return (
    <>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default App;
