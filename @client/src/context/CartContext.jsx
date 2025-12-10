import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponPercentage, setCouponPercentage] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pizzeria-cart");
    const savedCoupon = localStorage.getItem("pizzeria-coupon");
    const savedPercentage = localStorage.getItem("pizzeria-percentage");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("pizzeria-cart");
      }
    }

    if (savedCoupon) {
      setCoupon(savedCoupon);
    }

    if (savedPercentage) {
      setCouponPercentage(parseInt(savedPercentage));
    }

    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever cartItems changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("pizzeria-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.slug === product.slug);

      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productSlug) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.slug !== productSlug)
    );
  };

  const updateQuantity = (productSlug, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productSlug);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.slug === productSlug ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponPercentage(0);
    localStorage.removeItem("pizzeria-coupon");
    localStorage.removeItem("pizzeria-percentage");
  };

  const clearCoupon = () => {
    setCoupon(null);
    setCouponPercentage(0);
    localStorage.removeItem("pizzeria-coupon");
    localStorage.removeItem("pizzeria-percentage");
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    const discountAmount = (total * couponPercentage) / 100;
    return total - discountAmount;
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/newsletter/validate-coupon",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coupon: couponCode }),
        }
      );

      const data = await response.json();

      if (data.valid) {
        const cartTotal = getCartTotal();
        const discountAmount = (cartTotal * data.discount) / 100;

        // Log coupon usage to database
        try {
          await fetch("http://localhost:3001/api/newsletter/log-coupon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coupon: couponCode,
              cartTotal: cartTotal.toFixed(2),
              discountAmount: discountAmount.toFixed(2),
              email: null, // Add email if user is logged in
            }),
          });
        } catch (logError) {
          console.error("Error logging coupon usage:", logError);
          // Don't prevent coupon application if logging fails
        }

        setCoupon(couponCode);
        setCouponPercentage(data.discount);
        localStorage.setItem("pizzeria-coupon", couponCode);
        localStorage.setItem("pizzeria-percentage", data.discount.toString());

        return {
          success: true,
          message: data.message,
          discount: data.discount,
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { success: false, message: "Error validating coupon" };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponPercentage(0);
    localStorage.removeItem("pizzeria-coupon");
    localStorage.removeItem("pizzeria-percentage");
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCoupon,
    getCartTotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    couponPercentage,
    getCartItemCount,
    isInitialized,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
