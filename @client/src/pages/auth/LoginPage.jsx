// src/pages/auth/LoginForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length !== 4) {
      setServerError("Please enter a 4-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/verify-login-2fa",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: twoFACode, userId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      // Login successful, check auth and navigate
      await checkAuth();
      navigate("/");
    } catch (error) {
      console.error("2FA verification error:", error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username too short";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password too short";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      const data = await response.json();

      if (data.requires2FA) {
        // User has 2FA enabled, show 2FA input
        setUserId(data.userId);
        setShow2FA(true);
        setServerError(""); // Clear any previous errors
      } else {
        // Normal login without 2FA
        await checkAuth();
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {serverError && <p className="error">{serverError}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {show2FA && (
        <div className="two-fa-section">
          <h3>Enter 2FA Code</h3>
          <p>We've sent a 4-digit code to your email. Please enter it below:</p>
          <div className="form-group">
            <input
              type="text"
              value={twoFACode}
              onChange={(e) =>
                setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="0000"
              maxLength="4"
              style={{
                textAlign: "center",
                fontSize: "18px",
                letterSpacing: "4px",
                padding: "10px",
                width: "120px",
              }}
            />
          </div>
          <button
            onClick={handleVerify2FA}
            disabled={loading || twoFACode.length !== 4}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            onClick={() => {
              setShow2FA(false);
              setTwoFACode("");
              setUserId("");
              setServerError("");
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="register-link">
        <p>Don't have an account?</p>
        <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default LoginForm;
