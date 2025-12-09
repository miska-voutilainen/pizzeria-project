import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";
import pizzaWebLogo from "../../assets/images/Pizzaweb-logo.svg";
import checkmarkIcon from "../../assets/images/checkmark-icon.svg";
import riderIcon from "../../assets/images/rider-icon.svg";
import halfPizzaImg from "../../assets/images/half-a-pizza.png";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const [estimatedTime, setEstimatedTime] = useState("15:50");

  useEffect(() => {
    // Generate estimated delivery time (current time + 30 minutes)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setEstimatedTime(`${hours}:${minutes}`);
  }, []);

  return (
    <div className="order-confirmation-container">
      {/* Header */}
      <header className="order-confirmation-header">
        <div className="order-confirmation-header-wrapper">
          <div className="order-confirmation-logo">
            <img src={pizzaWebLogo} alt="Pizza Web Logo" />
          </div>
          <nav className="order-confirmation-nav">
            <div className="order-status-tracker">
              {/* Cart Status */}
              <div className="status-step">
                <div className="status-step-large">
                  <div className="checkmark-frame">
                    <img
                      src={checkmarkIcon}
                      alt="Checkmark"
                      className="checkmark-svg"
                    />
                  </div>
                  <div className="status-text cart">Cart</div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="connecting-line"></div>

              {/* Checkout Status */}
              <div className="status-step">
                <div className="status-step-large">
                  <div className="checkmark-frame">
                    <img
                      src={checkmarkIcon}
                      alt="Checkmark"
                      className="checkmark-svg"
                    />
                  </div>
                  <div className="status-text checkout">Checkout</div>
                </div>
              </div>

              {/* Dashed Line */}
              <div className="connecting-line dashed"></div>

              {/* Done Status */}
              <div className="status-step">
                <div className="status-step-large">
                  <div className="number-frame done">
                    <div className="number">3</div>
                  </div>
                  <div className="status-text done">Done!</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="order-confirmation-main">
        <div className="order-confirmation-content">
          <div className="rider-icon-container">
            <img src={riderIcon} alt="Delivery Rider" className="rider-icon" />
          </div>

          <h1 className="order-done-text">Order #{orderId} placed!</h1>

          <p className="estimated-delivery-text">
            Estimated delivery time: {estimatedTime}
          </p>
        </div>

        <div className="half-pizza-container">
          <img src={halfPizzaImg} alt="Half Pizza" className="half-pizza-img" />
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
