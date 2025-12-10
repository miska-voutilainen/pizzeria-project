import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./EmailConfirmation.css";
import Button from "../../components/ui/Button/Button";
import pizzaWebLogo from "../../assets/images/Pizzaweb-logo.svg";
import checkmarkIcon from "../../assets/images/checkmark-icon.svg";
import bigCheckmarkIcon from "../../assets/images/big-checkmark-icon.svg";
import halfPizzaImg from "../../assets/images/half-a-pizza.png";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateEmail = async () => {
      console.log("EmailConfirmation - email:", email);

      try {
        console.log("Validating email:", email);
        // Allow access with or without email parameter
        setIsValidEmail(true);
      } catch (error) {
        console.error("Error validating email:", error);
      } finally {
        setIsLoading(false);
      }
    };

    validateEmail();
  }, [email]);

  return (
    <>
      {isLoading ? (
        <div className="email-confirmation-container">
          <p>Validating email...</p>
        </div>
      ) : isValidEmail ? (
        <div className="email-confirmation-container">
          {/* Header */}
          <header className="email-confirmation-header">
            <div className="email-confirmation-header-wrapper">
              <div className="email-confirmation-logo">
                <img
                  src={pizzaWebLogo}
                  alt="Pizza Web Logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <nav className="email-confirmation-nav"></nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="email-confirmation-main">
            <div className="email-confirmation-content">
              <div className="rider-icon-container">
                <img
                  src={bigCheckmarkIcon}
                  alt="Checkmark"
                  className="rider-icon"
                />
              </div>

              <h1 className="email-done-text">Thank you!</h1>

              <p className="email-message-text">
                Your email has been successfully confirmed.
              </p>
              <div>
                <div className="back-button-container">
                  <Button url="/user" text="Back" />
                </div>
              </div>
            </div>

            <div className="half-pizza-container">
              <img
                src={halfPizzaImg}
                alt="Half Pizza"
                className="half-pizza-img"
              />
            </div>
          </main>
        </div>
      ) : null}
    </>
  );
};

export default EmailConfirmation;
