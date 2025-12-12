import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

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
          `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
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
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setServerMessage("Password changed successfully! Redirecting...");
      setFormData({ password: "", confirmPassword: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerMessage(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    formData.password &&
    formData.confirmPassword &&
    Object.keys(validate()).length === 0;

  if (!token || isTokenValid === false) {
    return (
      <div className="reset-password-error">
        <h1>Error</h1>
        <p>
          {serverMessage ||
            "This password reset link is invalid or has expired."}
        </p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  if (isTokenValid === null) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reset-password-page">
      <h1>Reset Your Password</h1>

      {serverMessage && (
        <p className={serverMessage.includes("success") ? "success" : "error"}>
          {serverMessage}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" disabled={!canSubmit || isLoading}>
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
