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
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pizzeria-cart");
    const savedCoupon = localStorage.getItem("pizzeria-coupon");
    const savedDiscount = localStorage.getItem("pizzeria-discount");

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

    if (savedDiscount) {
      setCouponDiscount(parseFloat(savedDiscount));
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
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    return total - couponDiscount;
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
        const total = getCartTotal();
        const discount = (total * data.discount) / 100;

        setCoupon(couponCode);
        setCouponDiscount(discount);
        localStorage.setItem("pizzeria-coupon", couponCode);
        localStorage.setItem("pizzeria-discount", discount.toString());

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
    setCouponDiscount(0);
    localStorage.removeItem("pizzeria-coupon");
    localStorage.removeItem("pizzeria-discount");
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
    getCartTotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    couponDiscount,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
