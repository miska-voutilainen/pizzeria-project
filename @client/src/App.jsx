import React from "react";
import Navbar from "./components/navbar/Navbar.jsx"; // works if file is in src/components/
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
