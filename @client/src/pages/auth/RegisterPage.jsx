import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSendVerify = async () => {
    if (!formData.username) {
      return setError("Username is required");
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError("Valid email is required");
    }

    try {
      const res = await fetch("/api/send-verify-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send verification");

      setIsEmailSent(true);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send email");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.password) return setError("Password is required");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (formData.password !== formData.confirm)
      return setError("Passwords don't match");

    setIsChecking(true);
    setError("");

    try {
      const checkRes = await fetch("/api/check-email-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username }),
      });
      const { verified } = await checkRes.json();

      if (!verified) {
        return setError(
          "Email not verified. Please check your inbox and click the link."
        );
      }

      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.message || "Registration failed");

      alert("Successfully registered! Redirecting to login...");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={handleSendVerify}
            disabled={isEmailSent}
          >
            {isEmailSent ? "Sent" : "Send Verification Email"}
          </button>
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            value={formData.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <button type="submit" disabled={isChecking}>
            {isChecking ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      {isEmailSent && <p>Verification email sent! Check your inbox.</p>}

      <div>
        <p>Already have an account?</p>
        <Link
          to="/login"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
