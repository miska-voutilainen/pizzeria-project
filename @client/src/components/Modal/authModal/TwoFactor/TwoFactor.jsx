import OtpInput from "./OtpInput.jsx";
import React, { useState } from "react";
import "./TwoFactor.css";
import Button from "../../../ui/Button/Button.jsx";
import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";

const TwoFactor = ({
  onClose,
  setModalContent,
  userId,
  onCodeSubmit,
  isLoading = false,
  error = "",
}) => {
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!code || code.length !== 4) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (onCodeSubmit) {
      onCodeSubmit(code);
    } else {
      setModalContent("Success");
    }
  };

  return (
    <div className="two-factor-container">
      <CloseButton onClick={onClose} />
      <h1 className="twofactor-title">The code was sent to your email</h1>
      <div id="two-factor-content">
        <p className="twofactor-subtitle">
          Enter the 4-digit code sent via your email
        </p>
        <div id="input-and-error">
          <OtpInput value={code} onChange={setCode} />
          <p
            className="error-text"
            style={{ visibility: error || showError ? "visible" : "hidden" }}
          >
            {error || "Wrong number!"}
          </p>
        </div>
        <Button
          id="two-factor-button"
          text={isLoading ? "Verifying..." : "Confirm"}
          onClick={handleSubmit}
          disabled={isLoading || code.length !== 4}
        />
      </div>
    </div>
  );
};

export default TwoFactor;
