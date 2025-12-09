import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Products from "./pages/Products/Products";
import Users from "./pages/Users/Users";
import Orders from "./pages/Orders";
import Coupons from "./pages/Coupons/Coupons";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/coupons" element={<Coupons />} />
      </Route>
    </Routes>
  );
}
