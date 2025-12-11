import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";
import Button from "../../components/ui/Button/Button";
import pizzaWebLogo from "../../assets/images/Pizzaweb-logo.svg";
import checkmarkIcon from "../../assets/images/checkmark-icon.svg";
import riderIcon from "../../assets/images/rider-icon.svg";
import fullPizzaImg from "../../assets/images/full-image.png";
import CheckoutNavigationBar from "../../components/layout/Navigation/CheckoutNavigationBar/CheckoutNavigationBar";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const [estimatedTime, setEstimatedTime] = useState("15:50");
  const [isValidOrder, setIsValidOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateOrder = async () => {
      console.log("OrderConfirmation - orderId:", orderId);

      // Redirect to home if no orderId is provided
      if (!orderId || orderId.trim() === "") {
        console.log("No orderId found, redirecting to home");
        navigate("/", { replace: true });
        return;
      }

      try {
        console.log("Validating orderId with server:", orderId);
        // Validate that the order exists in the database
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          console.log("Order validated successfully");
          setIsValidOrder(true);

          // Generate estimated delivery time (current time + 30 minutes)
          const now = new Date();
          now.setMinutes(now.getMinutes() + 30);
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          setEstimatedTime(`${hours}:${minutes}`);
        } else {
          console.log("Order validation failed, redirecting to home");
          // Order not found - redirect to home
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error validating order:", error);
        // On error, redirect to home
        navigate("/", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    validateOrder();
  }, [orderId, navigate]);

  return (
    <>
      {isLoading ? (
        <div className="order-confirmation-container">
          <p>Validating order...</p>
        </div>
      ) : isValidOrder ? (
        <div className="order-confirmation-container">
          {/* Header */}
          {/* <header className="order-confirmation-header">
            <div className="order-confirmation-header-wrapper">
              <div className="order-confirmation-logo">
                <img
                  src={pizzaWebLogo}
                  alt="Pizza Web Logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <nav className="order-confirmation-nav">
                <div className="order-status-tracker">

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


                  <div className="connecting-line"></div>


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


                  <div className="connecting-line dashed"></div>


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
          </header> */}
          <CheckoutNavigationBar />

          {/* Main Content */}
          <main className="order-confirmation-main">
            <div className="order-confirmation-content">
              <div className="rider-icon-container">
                <img
                  src={riderIcon}
                  alt="Delivery Rider"
                  className="rider-icon"
                />
              </div>

              <h1 className="order-done-text">Order #{orderId} placed!</h1>

              <p className="estimated-delivery-text">
                Estimated delivery time: {estimatedTime}
              </p>
              <div>
                <div className="back-button-container">
                  <Button url="/" text="Back" />
                </div>
              </div>
            </div>

            <div className="full-pizza-container">
              <img
                src={fullPizzaImg}
                alt="Full Pizza"
                className="full-pizza-img"
              />
            </div>
          </main>
        </div>
      ) : null}
    </>
  );
};

export default OrderConfirmation;
