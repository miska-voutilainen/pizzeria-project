// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import LanguageProvider from "./context/LanguageContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";

import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import MenuPage from "./pages/Menu/MenuPage.jsx";
import UserPage from "./pages/user/UserPage.jsx";
import AboutUsPage from "./pages/AboutUs/AboutUsPage.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import ResetEmailPage from "./pages/auth/ResetEmailPage.jsx";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation.jsx";
import EmailConfirmation from "./pages/EmailConfirmation/EmailConfirmation.jsx";
import CheckoutProtectedRoute from "./components/CheckoutProtectedRoute/CheckoutProtectedRoute.jsx";

import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="about" element={<AboutUsPage />} />
                <Route
                  path="checkout"
                  element={
                    <CheckoutProtectedRoute>
                      <Checkout />
                    </CheckoutProtectedRoute>
                  }
                />
                <Route
                  path="order-confirmation"
                  element={<OrderConfirmation />}
                />
                <Route
                  path="email-confirmation"
                  element={<EmailConfirmation />}
                />
                <Route
                  path="reset-password/:token"
                  element={<ResetPasswordPage />}
                />

                <Route
                  path="user"
                  element={
                    <ProtectedRoute>
                      <UserPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
