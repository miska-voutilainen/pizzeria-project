import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch("/api/register", {
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

      alert("Account created successfully! Taking you to login...");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            value={formData.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <div className="login-link">
        <p>Already have an account?</p>
        <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
