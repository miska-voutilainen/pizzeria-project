import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // No flicker

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
