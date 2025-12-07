// src/components/ProtectedRoute.jsx — keep exactly this
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api";

export default function ProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    api
      .get("/auth/check")
      .then((res) =>
        setIsAdmin(
          res.data.authenticated && res.data.user.role === "administrator"
        )
      )
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
