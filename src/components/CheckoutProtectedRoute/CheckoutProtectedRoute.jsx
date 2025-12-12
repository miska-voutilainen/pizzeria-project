import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CheckoutProtectedRoute = ({ children }) => {
  const { cartItems, isInitialized } = useCart();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isInitialized && cartItems.length === 0) {
      setShouldRedirect(true);
    }
  }, [isInitialized, cartItems]);

  // While initializing, render nothing (or a loading state)
  if (!isInitialized) {
    return null;
  }

  // If cart is empty after initialization, redirect to home page
  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CheckoutProtectedRoute;
