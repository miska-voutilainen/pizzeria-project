import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/login", { username, password });
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: 100, maxWidth: 400, margin: "0 auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={login}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: 10,
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
            padding: 10,
            margin: "10px 0",
          }}
        />
        <button type="submit" style={{ width: "100%", padding: 12 }}>
          Login
        </button>
      </form>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
