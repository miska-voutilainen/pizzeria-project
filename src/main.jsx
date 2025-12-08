import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import AdminNavBar from "./components/AdminNavigationBar/AdminNavBar";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminNavBar />
      <App />
    </BrowserRouter>
  </StrictMode>
);
