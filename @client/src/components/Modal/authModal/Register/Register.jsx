import "./Register.css";
import Button from "../../../ui/Button/Button.jsx";
import CheckBox from "../../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import { useState } from "react";
import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import TextButton from "../../../ui/TextButton/TextButton.jsx";
import useLanguage from "../../../../context/useLanguage.jsx";

const Register = ({ setModalContent, onClose }) => {
  const { t } = useLanguage();
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
    if (!formData.username.trim())
      return setError(t("auth.errors.usernameRequired"));
    if (!formData.email.trim()) return setError(t("auth.errors.emailRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return setError(t("errors.invalidEmail"));
    if (!formData.password) return setError(t("auth.errors.passwordRequired"));
    if (formData.password.length < 6)
      return setError(t("auth.errors.passwordTooShort"));
    if (formData.password !== formData.confirm)
      return setError(t("errors.passwordMismatch"));

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

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
          <h1>{t("auth.register")}</h1>
          <div>
            <p>{t("auth.or")}</p>
            <TextButton
              text={t("auth.signIn")}
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
              placeholder={t("auth.email")}
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
            />
            <InputField
              type="text"
              name="username"
              id="username"
              placeholder={t("auth.username")}
              value={formData.username}
              onChange={(value) => handleChange("username", value)}
            />
            <InputField
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={(value) => handleChange("password", value)}
              placeholder={t("auth.password")}
            />
            <InputField
              type="password"
              name="confirm-password"
              id="confirm-password"
              value={formData.confirm}
              onChange={(value) => handleChange("confirm", value)}
              placeholder={t("auth.confirmPassword")}
            />
          </div>
          <div>
            <Button
              text={
                isLoading ? t("auth.creatingAccount") : t("auth.createAccount")
              }
              id="register-button"
              onClick={handleRegister}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
