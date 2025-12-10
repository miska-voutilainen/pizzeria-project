import "./SignIn.css";
import Button from "../../../ui/Button/Button.jsx";
import CheckBox from "../../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import TextButton from "../../../ui/TextButton/TextButton.jsx";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const SignIn = ({ setModalContent, onClose, redirectPath }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [serverError, setServerError] = React.useState("");
  const [show2FA, setShow2FA] = React.useState(false);
  const [twoFACode, setTwoFACode] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Use redirectPath if provided, otherwise use current location or "/"
  const getRedirectPath = () => {
    if (redirectPath) return redirectPath;
    if (location.pathname !== "/") return location.pathname;
    return "/";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    else if (username.length < 3) newErrors.username = "Username too short";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password too short";
    return newErrors;
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length !== 4) {
      setServerError("Please enter a 4-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/verify-login-2fa",
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

      // Login successful
      await checkAuth();
      onClose();
      navigate(getRedirectPath());
    } catch (error) {
      console.error("2FA verification error:", error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
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
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      const data = await response.json();

      if (data.requires2FA) {
        setUserId(data.userId);
        setShow2FA(true);
        setServerError("");
      } else {
        await checkAuth();
        onClose();
        navigate(getRedirectPath());
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <div>
        <CloseButton onClick={onClose} />
        <div id="signInContent">
          <div id="signInTitle">
            <h1>Enter 2FA Code</h1>
          </div>
          {serverError && <p className="error">{serverError}</p>}
          <p>We've sent a 4-digit code to your email. Please enter it below:</p>
          <div id="inputFields">
            <input
              type="text"
              value={twoFACode}
              onChange={(e) =>
                setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="0000"
              maxLength="4"
              autoComplete="off"
              style={{
                textAlign: "center",
                fontSize: "18px",
                letterSpacing: "4px",
                padding: "10px",
                width: "120px",
              }}
            />
          </div>
          <div>
            <Button
              text={loading ? "Verifying..." : "Verify"}
              onClick={handleVerify2FA}
              disabled={loading || twoFACode.length !== 4}
            />
          </div>
          <TextButton
            text="Cancel"
            onClick={() => {
              setShow2FA(false);
              setTwoFACode("");
              setUserId("");
              setServerError("");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <CloseButton onClick={onClose} />
      <div id="signInContent">
        <div id="signInTitle">
          <h1>Sign in</h1>
          <div>
            <p>Or</p>
            <TextButton
              text="create an account"
              onClick={() => setModalContent("Register")}
            />
          </div>
        </div>
        {serverError && <p className="error">{serverError}</p>}
        <form onSubmit={handleSubmit}>
          <div id="inputFields">
            <InputField
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(value) => {
                setUsername(value);
                setErrors((prev) => ({ ...prev, username: "" }));
                setServerError("");
              }}
            />
            {errors.username && <p className="error">{errors.username}</p>}
            <InputField
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: "" }));
                setServerError("");
              }}
              placeholder="Password"
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <CheckBox
            className="white-background"
            label="Remember me"
            id="remember-me"
          />
          <div>
            <Button
              text={loading ? "Signing in..." : "Sign in"}
              id="sign-in-button"
              onClick={handleSubmit}
              disabled={loading}
            />
          </div>
          <TextButton
            text="Forgot password?"
            onClick={() => setModalContent("TwoFactor")}
          />
        </form>
      </div>
    </div>
  );
};

export { SignIn };
