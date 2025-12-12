import "./CheckoutNavigationBar.css";
import pizzaWebLogo from "../../../../assets/images/Pizzaweb-logo.svg";
import checkmarkIcon from "../../../../assets/images/checkmark-icon.svg";
import { Link, useLocation } from "react-router-dom";

const CheckoutNavigationBar = () => {
  const location = useLocation();
  const isCheckout = location.pathname === "/checkout";
  const isOrderConfirmation = location.pathname === "/order-confirmation";

  return (
    <header className="navbar checkout-header">
      <div className="navbar-container checkout-header-wrapper">
        {/* navbar logo */}
        <div className="navbar-row-start checkout-logo">
          <Link to="/">
            <img src={pizzaWebLogo} alt="Pizzaweb logo" />
          </Link>
        </div>

        {/* checkout step indicators */}
        <div className="checkout-status-tracker-container">
          <div className="checkout-status-tracker">
            {/* Cart Status */}
            <div className="checkout-status-step checkout-status-step-done">
              <div className="checkout-status-step-container">
                <img src={checkmarkIcon} alt="Checkmark" />
              </div>
              <div className="checkout-status-step-name-container">
                <p>Cart</p>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="checkout-connecting-line solid"></div>

            {/* Checkout Status */}
            <div
              className={`checkout-status-step ${
                isCheckout
                  ? "checkout-status-step-done"
                  : isOrderConfirmation
                  ? "checkout-status-step-done"
                  : ""
              }`}
            >
              <div className="checkout-status-step-container">
                {isOrderConfirmation ? (
                  <img src={checkmarkIcon} alt="Checkmark" />
                ) : (
                  <p>2</p>
                )}
              </div>
              <div className="checkout-status-step-name-container">
                <p>Checkout</p>
              </div>
            </div>

            {/* Dashed Line */}
            <div
              className={`checkout-connecting-line ${
                isOrderConfirmation ? "solid" : "dashed"
              }`}
            ></div>

            {/* Done Status */}
            <div
              className={`checkout-status-step ${
                isOrderConfirmation ? "checkout-status-step-done" : ""
              }`}
            >
              <div className="checkout-status-step-container">
                <p>3</p>
              </div>
              <div className="checkout-status-step-name-container">
                <p>Done!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CheckoutNavigationBar;
