import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./CartSidebar.css";
import CloseButonDark from "../../../assets/images/close-dark.svg";
import Button from "../../ui/Button/Button";
import TrashIcon from "../../../assets/images/trash-icon.svg";
import QuantityInput from "../../ui/QuantityInput/QuantityInput";

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [emptyCartMessage, setEmptyCartMessage] = useState(false);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
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

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      setEmptyCartMessage(true);
      setTimeout(() => setEmptyCartMessage(false), 3000);
    } else {
      onClose();
      navigate("/checkout");
    }
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
              <>
                <p>Your cart is empty</p>
                {emptyCartMessage && (
                  <p
                    style={{
                      color: "#e74c3c",
                      marginTop: "10px",
                      fontSize: "14px",
                    }}
                  >
                    Please add items to your cart before checkout
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article key={item.slug} className="cart-item">
                      <div className="cart-item-image-container">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-item-image"
                          />
                        ) : item.imgUrl ? (
                          <img
                            src={item.imgUrl}
                            alt={item.name}
                            className="cart-item-image"
                          />
                        ) : null}
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-info-top-row">
                          <div className="cart-item-name-wrapper">
                            <h4>{item.name}</h4>

                            {item.isCustom && (
                              <div className="custom-details">
                                <p className="custom-base-and-size">
                                  {item.base}, {item.size}
                                </p>
                                <p className="cart-ingredients">
                                  + {item.ingredients}
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.slug)}
                            className="remove-btn"
                          >
                            <img src={TrashIcon} alt="trash icon" />
                          </button>
                        </div>
                        <div className="cart-item-info-bottom-row">
                          <p>{item.price.toFixed(2)}€</p>
                          <QuantityInput
                            quantity={item.quantity}
                            onIncrease={() =>
                              updateQuantity(item.slug, item.quantity + 1)
                            }
                            onDecrease={() =>
                              updateQuantity(item.slug, item.quantity - 1)
                            }
                          />
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
            <div>
              <p>
                <span>Shipping</span>
                <span>Free</span>
              </p>
            </div>
            <div className="cart-total">
              <p>
                <span>Order summary</span>
                <span>{getCartTotal().toFixed(2)} €</span>
              </p>
            </div>
            <Button text="Checkout" onClick={handleCheckoutClick} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
