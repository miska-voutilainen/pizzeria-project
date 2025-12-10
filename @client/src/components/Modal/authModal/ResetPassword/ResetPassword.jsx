import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import Button from "../../../ui/Button/Button.jsx";
import { useState } from "react";
import "./ResetPassword.css";

const ResetPassword = ({ setModalContent, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/send-reset-link",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send reset email");

      setModalContent("ResetPasswordSuccess");
    } catch (err) {
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form id="reset-password-form">
        <CloseButton onClick={onClose} />
        <h1>Enter your email</h1>
        {error && <p className="error">{error}</p>}
        <InputField
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(value) => setEmail(value)}
        />
        <Button
          type="submit"
          id="reset-password-button"
          onClick={handleSendResetEmail}
          text={isLoading ? "Sending..." : "Send an email"}
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default ResetPassword;
