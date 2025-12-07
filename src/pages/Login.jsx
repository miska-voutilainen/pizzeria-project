// src/pages/Login.jsx
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [step, setStep] = useState("login"); // "login" or "2fa"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.requires2FA) {
        setUserId(res.data.userId);
        setStep("2fa");
        setMsg("Check your email for 2FA code");
      } else {
        navigate("/");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/verify-login-2fa", { code, userId });
      navigate("/");
    } catch (err) {
      setMsg("Invalid or expired code");
    }
  };

  if (step === "2fa") {
    return (
      <div style={{ padding: 100, maxWidth: 400, margin: "0 auto" }}>
        <h1>Enter 2FA Code</h1>
        <form onSubmit={handle2FA}>
          <input
            placeholder="4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={4}
            style={{
              width: "100%",
              padding: 12,
              fontSize: 24,
              textAlign: "center",
              letterSpacing: 8,
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 15,
              marginTop: 20,
              background: "#28a745",
              color: "white",
            }}
          >
            Verify
          </button>
        </form>
        {msg && <p style={{ color: "red", textAlign: "center" }}>{msg}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 100, maxWidth: 400, margin: "0 auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            margin: "10px 0",
          }}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: 12,
            margin: "10px 0",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 15,
            background: "#007bff",
            color: "white",
          }}
        >
          Login
        </button>
      </form>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
