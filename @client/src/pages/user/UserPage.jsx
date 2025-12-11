// src/pages/user/UserPage.jsx
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SquareButton from "../../components/ui/SquareButton/SquareButton.jsx";
import "./UserPage.css";
import InputField from "../../components/ui/InputField/InputField.jsx";
import TextButton from "../../components/ui/TextButton/TextButton.jsx";
import deliveryIcon from "../../assets/images/delivery-icon.svg";
import takeawayIcon from "../../assets/images/store-icon.svg";

const UserPage = () => {
  const { user, loading, checkAuth } = useAuth();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(() => !!user?.twoFactorEnabled);

  useEffect(() => {
    setActive(!!user?.twoFactorEnabled);
  }, [user?.twoFactorEnabled]);

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
    <section id="user-page">
      <div className="user-page-wrapper">
        <div className="user-page-user-card">
          <div className="user-page-user-card-header">
            <h2>Welcome back, {user.username}!</h2>
            <div className="user-info">
              <p>
                <strong>Member since:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="user-card-personal-container">
            <div className="checkout-inputs">
              <h2>Personal information</h2>

              <div className="checkout-input-row">
                <label htmlFor="firstName">Etunimi</label>
                <InputField
                  type="text"
                  value={user.firstName || ""}
                  readOnly
                  placeholder="Etunimi puuttuu"
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="surname">Sukunimi</label>
                <InputField
                  type="text"
                  value={user.lastName || ""}
                  readOnly
                  placeholder="Sukunimi puuttuu"
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="email">Email</label>
                <InputField
                  type="text"
                  value={user.email || ""}
                  readOnly
                  name={"email"}
                  id={"email"}
                  placeholder="pekka.virtanen@gmail.com"
                  // value={formData.city}
                  // onChange={handleFormChange("city")}
                />

                {/* <div className="user-card-personal-container-change-btn"> */}
                <TextButton text="Change" />
                {/* </div> */}
              </div>
              <div className="checkout-input-row">
                <label htmlFor="password">Salasana</label>
                <InputField
                  type="password"
                  value={"**********"}
                  readOnly
                  name={"password"}
                  id={"password"}
                  // value={formData.postcode}
                  // onChange={handleFormChange("postcode")}
                />
                <TextButton text="Change" />
              </div>
              <p></p>
              {/* email verified  */}
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
                      Please verify your email address to enable security
                      features like 2FA.
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
              {/* <div className="action-grid">
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
              </div> */}
              <div className="email-2FA-container">
                <p>Enable Two-Factor Authentication</p>
                <div
                  className={`switch ${active ? "active" : ""}`}
                  onClick={() =>
                    user?.twoFactorEnabled
                      ? handleDisable2FA()
                      : handleSend2FACode()
                  }
                  role="switch"
                  aria-checked={active}
                >
                  <button className="toggle-btn" aria-label="Toggle">
                    {active ? "ON" : "OFF"}
                  </button>

                  <span className="slider"></span>
                </div>
              </div>
            </div>
          </div>

          <div className="user-card-delivery-address-container">
            <div className="checkout-inputs">
              <h2>Delivery address</h2>

              <div className="checkout-input-row">
                <label htmlFor="address">Katuosoite</label>
                <InputField
                  type="text"
                  value={user.address?.street || ""}
                  readOnly
                  placeholder="Katuosoite puuttuu"
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="postcode">Postinumero</label>
                <InputField
                  type="text"
                  value={user.address?.postalCode || ""}
                  readOnly
                  placeholder="Postinumero puuttuu"
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="region">Kaupunki</label>
                <InputField
                  type="text"
                  value={user.address?.city || ""}
                  readOnly
                  placeholder="Kaupunki puuttuu"
                />
              </div>
            </div>
          </div>

          <div className="action-grid">
            <button className="action-btn logout">
              <span>Logout</span>
            </button>
          </div>
        </div>

        <hr className="user-page-divider" />

        <div className="user-page-orders-card">
          <h2>Orders</h2>
          {Array.isArray(user.orders) && user.orders.length > 0 ? (
            <div className="simple-orders-list">
              {user.orders.map((order) => {
                const id = order.orderId || "-";
                const date = order.createdAt;
                const items = Array.isArray(order.items) ? order.items : [];
                const total = order.totalAmount || 0;
                const deliveryType = order.deliveryType || "N/A";

                const itemNames = items
                  .map((item) => {
                    let name = item.name;
                    if (item.size && item.size !== "normaali")
                      name += ` (${item.size})`;
                    return item.quantity > 1
                      ? `${item.quantity}× ${name}`
                      : name;
                  })
                  .join(", ");

                return (
                  <div key={id} className="order-list">
                    <div className="order-header">
                      <div
                        className="delivery-type"
                        style={{ width: "30px", height: "30px" }}
                      >
                        {order.deliveryType === "delivery" ? (
                          <img
                            src={deliveryIcon}
                            alt="Delivery"
                            className="dt-icon"
                          />
                        ) : order.deliveryType === "takeaway" ? (
                          <img
                            src={takeawayIcon}
                            alt="Takeaway"
                            className="dt-icon"
                          />
                        ) : null}
                      </div>
                      <strong>#{id}</strong>
                      <span className="order-total">
                        {Number(total).toFixed(2)} €
                      </span>
                    </div>

                    <div className="order-date">
                      {date
                        ? new Date(date).toLocaleDateString("fi-FI", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          }) +
                          ", " +
                          new Date(date).toLocaleTimeString("fi-FI", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>

                    <div className="order-items">{itemNames || "No items"}</div>

                    <TextButton className="reorder-btn">
                      Make order again
                    </TextButton>

                    <hr className="order-divider" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserPage;
