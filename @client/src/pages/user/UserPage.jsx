// src/pages/user/UserPage.jsx
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const UserPage = () => {
  const { user, loading, checkAuth } = useAuth();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSend2FACode = async () => {
    setLoading2FA(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/send-2fa-code",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("4-digit code sent to your email!");
        setShowCodeInput(true);
      } else {
        const error = await response.json();
        if (error.requiresEmailVerification) {
          setMessage(
            "Please verify your email address first before enabling 2FA."
          );
          // Automatically send verification email
          handleSendEmailVerification();
        } else {
          setMessage(error.message || "Failed to send code");
        }
      }
    } catch (error) {
      setMessage("Failed to send code");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      setMessage("Please enter a 4-digit code");
      return;
    }

    setLoading2FA(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/verify-2fa-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: verificationCode }),
        }
      );

      if (response.ok) {
        setMessage("2FA enabled successfully!");
        setShowCodeInput(false);
        setVerificationCode("");
        // Refresh user data
        await checkAuth();
      } else {
        const error = await response.json();
        setMessage(error.message || "Invalid code");
      }
    } catch (error) {
      setMessage("Verification failed");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;

    setLoading2FA(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/disable-2fa",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("2FA disabled successfully!");
        // Refresh user data
        await checkAuth();
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to disable 2FA");
      }
    } catch (error) {
      setMessage("Failed to disable 2FA");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleSendEmailVerification = async () => {
    setLoading2FA(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/send-verify-link",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: user.username }),
        }
      );

      if (response.ok) {
        setMessage(
          "Verification email sent! Please check your inbox and verify your email before enabling 2FA."
        );
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to send verification email");
      }
    } catch (error) {
      setMessage("Failed to send verification email");
    } finally {
      setLoading2FA(false);
    }
  };
  return (
    <div className="user-page">
      <div className="user-container">
        <h1 className="page-title">Your Account</h1>

        {!user.emailVerified && (
          <div
            className="email-verification-banner"
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>⚠️ Email Verification Required</strong>
              <p style={{ margin: "5px 0 0 0", color: "#856404" }}>
                Please verify your email address to enable security features
                like 2FA.
              </p>
            </div>
            <button
              onClick={handleSendEmailVerification}
              disabled={loading2FA}
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading2FA ? "Sending..." : "Verify Now"}
            </button>
          </div>
        )}

        <div className="user-card">
          <div className="user-avatar">
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="user-info">
            <h2>Welcome back, {user.username}!</h2>
            <p>
              <strong>Email:</strong> {user.email || "Not provided"}
            </p>
            <p>
              <strong>Role:</strong> {user.role || "Customer"}
            </p>
            <p>
              <strong>Member since:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="user-actions">
          <h3>Security</h3>
          <div className="action-grid">
            {!user.twoFactorEnabled ? (
              <button
                className="action-btn"
                onClick={handleSend2FACode}
                disabled={loading2FA}
              >
                <span>{loading2FA ? "Sending..." : "Enable 2FA"}</span>
              </button>
            ) : (
              <button
                className="action-btn logout"
                onClick={handleDisable2FA}
                disabled={loading2FA}
              >
                <span>{loading2FA ? "Disabling..." : "Disable 2FA"}</span>
              </button>
            )}
          </div>

          {showCodeInput && (
            <div className="code-verification">
              <p>Enter the 4-digit code sent to your email:</p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 4)
                  )
                }
                placeholder="0000"
                maxLength="4"
                style={{
                  textAlign: "center",
                  fontSize: "18px",
                  letterSpacing: "4px",
                  padding: "10px",
                  margin: "10px 0",
                  border: "2px solid #ccc",
                  borderRadius: "4px",
                  width: "120px",
                }}
              />
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={handleVerifyCode}
                  disabled={loading2FA || verificationCode.length !== 4}
                  className="action-btn"
                  style={{ marginRight: "10px" }}
                >
                  {loading2FA ? "Verifying..." : "Verify"}
                </button>
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setVerificationCode("");
                    setMessage("");
                  }}
                  className="action-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              style={{
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                backgroundColor: message.includes("success")
                  ? "#d4edda"
                  : "#f8d7da",
                color: message.includes("success") ? "#155724" : "#721c24",
                border: `1px solid ${
                  message.includes("success") ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}
            >
              {message}
            </div>
          )}

          <h3>Your Options</h3>
          <div className="action-grid">
            <button className="action-btn">
              <span>Change Password</span>
            </button>
            <button className="action-btn logout">
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
