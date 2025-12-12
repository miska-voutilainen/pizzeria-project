// src/pages/auth/ResetEmailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const ResetEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setServerMessage("Invalid or missing token");
      setIsTokenValid(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/verify-email-token/${token}`
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Invalid or expired token");
        setIsTokenValid(true);
      } catch (err) {
        setServerMessage(err.message || "Invalid or expired token");
        setIsTokenValid(false);
      }
    };
    checkToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "confirmEmail") setConfirmEmail(value);
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage("");
  };

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!confirmEmail) {
      newErrors.confirmEmail = "Please confirm your email";
    } else if (confirmEmail !== email) {
      newErrors.confirmEmail = "Emails do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-email/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setServerMessage("Email changed successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setServerMessage(data.message || "Failed to change email");
      }
    } catch (err) {
      setServerMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || isTokenValid === false) {
    return (
      <div
        className="reset-email-error"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <h1>Error</h1>
        <p>
          {serverMessage || "This email change link is invalid or has expired."}
        </p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  if (isTokenValid === null) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
    );
  }

  return (
    <div
      className="reset-email-page"
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>Change Your Email</h1>
      {serverMessage && (
        <p
          style={{
            color: serverMessage.includes("success") ? "green" : "red",
            margin: "20px 0",
          }}
        >
          {serverMessage}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="New email address"
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="email"
            name="confirmEmail"
            value={confirmEmail}
            onChange={handleChange}
            placeholder="Confirm new email"
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          />
          {errors.confirmEmail && (
            <p style={{ color: "red" }}>{errors.confirmEmail}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || email !== confirmEmail || !email}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            background:
              isLoading || email !== confirmEmail || !email
                ? "#ccc"
                : "#c62828",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Changing..." : "Change Email"}
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default ResetEmailPage;
