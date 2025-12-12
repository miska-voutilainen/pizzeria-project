import "./Register.css";
import Button from "../../../ui/Button/Button.jsx";
import CheckBox from "../../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import { useState } from "react";
import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import TextButton from "../../../ui/TextButton/TextButton.jsx";

const Register = ({ setModalContent, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.username.trim()) return setError("Username is required");
    if (!formData.email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return setError("Please enter a valid email");
    if (!formData.password) return setError("Password is required");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (formData.password !== formData.confirm)
      return setError("Passwords do not match");

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Show success modal and redirect
      setModalContent("RegistrationSuccess");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CloseButton onClick={onClose} />
      <div id="registerContent">
        <div id="registerTitle">
          <h1>Register</h1>
          <div>
            <p>Or</p>
            <TextButton
              text="log in"
              onClick={() => setModalContent("SignIn")}
            />
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegister}>
          <div id="inputFields">
            <InputField
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
            />
            <InputField
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={formData.username}
              onChange={(value) => handleChange("username", value)}
            />
            <InputField
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={(value) => handleChange("password", value)}
              placeholder="Password"
            />
            <InputField
              type="password"
              name="confirm-password"
              id="confirm-password"
              value={formData.confirm}
              onChange={(value) => handleChange("confirm", value)}
              placeholder="Confirm password"
            />
          </div>
          <Button
            text={isLoading ? "Creating Account..." : "Create an account"}
            id="register-button"
            onClick={handleRegister}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
