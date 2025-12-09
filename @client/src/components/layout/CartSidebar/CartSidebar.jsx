import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import "./CartSidebar.css";
import CloseButonDark from "../../../assets/images/close-dark.svg";
import Button from "../../ui/Button/Button";
import TrashIcon from "../../../assets/images/trash-icon.svg";

const CartSidebar = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponValid, setIsCouponValid] = useState(false);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    couponDiscount,
    getCartItemCount,
  } = useCart();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    const result = await applyCoupon(couponInput);

    if (result.success) {
      setCouponMessage(`${result.message} - ${result.discount}% off!`);
      setIsCouponValid(true);
      setCouponInput("");
    } else {
      setCouponMessage(result.message);
      setIsCouponValid(false);
    }

    // Clear message after 5 seconds
    setTimeout(() => setCouponMessage(""), 5000);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setIsCouponValid(false);
    setCouponMessage("Coupon removed");
    setTimeout(() => setCouponMessage(""), 3000);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="cart-overlay"
        onClick={onClose}
        style={{ opacity: isAnimating ? 1 : 0 }}
      ></div>

      {/* Sidebar */}
      <div className={`cart-sidebar ${isAnimating ? "open" : ""}`}>
        <div className="cart-sidebar-wrapper">
          <div className="cart-header">
            <h2>
              {cartItems.length === 0
                ? "Shopping Cart"
                : `${getCartItemCount()} items for ${getCartTotal().toFixed(
                    2
                  )}€`}
            </h2>
            <button className="close-cart" onClick={onClose}>
              <img src={CloseButonDark} alt="Close" />
            </button>
          </div>

          <div className="cart-content">
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article key={item.slug} className="cart-item">
                      <div className="cart-item-image-container">
                        <img
                          src={item.imgUrl}
                          alt={item.name}
                          className="cart-item-image"
                        />
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-info-top-row">
                          <h4>{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.slug)}
                            className="remove-btn"
                          >
                            <img src={TrashIcon} alt="trash icon" />
                          </button>
                        </div>
                        <div className="cart-item-info-bottom-row">
                          <p>{item.price}€</p>
                          <div className="cart-item-controls">
                            <button
                              onClick={() =>
                                updateQuantity(item.slug, item.quantity - 1)
                              }
                              className="quantity-btn"
                            >
                              -
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.slug, item.quantity + 1)
                              }
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="cart-footer">
          <div className="cart-footer-wrapper">
            <div className="cart-footer-discount-container">
              {coupon ? (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
                    ✓ {coupon} applied
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c62828",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Use code"
                    name="code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                    style={{ flex: 1, color: "white" }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#c62828",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMessage && (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: isCouponValid ? "#2e7d32" : "#d32f2f",
                    textAlign: "center",
                  }}
                >
                  {couponMessage}
                </p>
              )}
            </div>
            <div>
              <p>
                <span>
                  {cartItems.length === 0
                    ? "Shopping Cart"
                    : `${getCartItemCount()} items`}
                </span>
                <span>{getCartTotal().toFixed(2)}€</span>
              </p>
            </div>
            {coupon && couponDiscount > 0 && (
              <div style={{ color: "#2e7d32", fontWeight: "bold" }}>
                <p>
                  <span>Discount (10%)</span>
                  <span>-{couponDiscount.toFixed(2)}€</span>
                </p>
              </div>
            )}
            <div>
              <p>
                <span>Shipping</span>
                <span>Free</span>
              </p>
            </div>
            <div className="cart-total">
              <p>
                <span>Order summary</span>
                <span>
                  {(coupon && couponDiscount > 0
                    ? getDiscountedTotal()
                    : getCartTotal()
                  ).toFixed(2)}{" "}
                  €
                </span>
              </p>
            </div>
            <Button
              url="/checkout"
              text="Checkout"
              disabled={cartItems.length === 0}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
