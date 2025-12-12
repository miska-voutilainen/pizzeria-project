import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";
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
        `${import.meta.env.VITE_API_URL}/api/auth/send-reset-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link");
      setModalContent("ResetPasswordSuccess");
    } catch (err) {
      setError(err.message || "Failed to send link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form id="reset-password-form">
        <CloseButton onClick={onClose} />
        <h1>Forgot Password?</h1>
        <p>
          Enter your email and we'll send you a link to reset your password.
        </p>
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
          text={isLoading ? "Sending..." : "Send Reset Link"}
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default ResetPassword;
