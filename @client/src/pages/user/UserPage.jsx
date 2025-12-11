// src/pages/user/UserPage.jsx
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import SquareButton from "../../components/ui/SquareButton/SquareButton.jsx";
import "./UserPage.css";
import InputField from "../../components/ui/InputField/InputField.jsx";
import TextButton from "../../components/ui/TextButton/TextButton.jsx";
import deliveryIcon from "../../assets/images/delivery-icon.svg";
import takeawayIcon from "../../assets/images/store-icon.svg";
import useLanguage from "../../context/useLanguage.jsx";

const UserPage = () => {
  const { t } = useLanguage();
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
    <section id="user-page">
      <div className="user-page-wrapper">
        <div className="user-page-user-card">
          <div className="user-page-user-card-header">
            <h2>
              {t("userPage.welcomeBack").replace("{username}", user.username)}
            </h2>
            <div className="user-info">
              <p>
                <strong>{t("userPage.memberSince")}</strong>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="user-card-personal-container">
            <div className="checkout-inputs">
              <h2>{t("userPage.personalInformation")}</h2>

              <div className="checkout-input-row">
                <label htmlFor="firstName">{t("userPage.firstName")}</label>
                <InputField
                  type="text"
                  value={user.firstName || ""}
                  readOnly
                  placeholder={t("userPage.firstName")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="surname">{t("userPage.lastName")}</label>
                <InputField
                  type="text"
                  value={user.lastName || ""}
                  readOnly
                  placeholder={t("userPage.lastName")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="email">{t("userPage.email")}</label>
                <InputField
                  type="text"
                  value={user.email || ""}
                  readOnly
                  name={"email"}
                  id={"email"}
                  placeholder={t("userPage.email")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="password">{t("userPage.password")}</label>
                <InputField
                  type="password"
                  value={"**********"}
                  readOnly
                  name={"password"}
                  id={"password"}
                />
              </div>
              <p></p>
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
                    <strong>
                      ⚠️ {t("userPage.emailVerificationRequired")}
                    </strong>
                    <p style={{ margin: "5px 0 0 0", color: "#856404" }}>
                      {t("userPage.emailVerificationMessage")}
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
                    {loading2FA
                      ? t("userPage.sending")
                      : t("userPage.verifyNow")}
                  </button>
                </div>
              )}
              <div className="action-grid">
                {!user.twoFactorEnabled ? (
                  <button
                    className="action-btn"
                    onClick={handleSend2FACode}
                    disabled={loading2FA}
                  >
                    <span>
                      {loading2FA
                        ? t("userPage.sending")
                        : t("userPage.enable2FA")}
                    </span>
                  </button>
                ) : (
                  <button
                    className="action-btn logout"
                    onClick={handleDisable2FA}
                    disabled={loading2FA}
                  >
                    <span>
                      {loading2FA
                        ? t("userPage.sending")
                        : t("userPage.disable2FA")}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="user-card-delivery-address-container">
            <div className="checkout-inputs">
              <h2>{t("userPage.deliveryAddress")}</h2>

              <div className="checkout-input-row">
                <label htmlFor="address">{t("userPage.address")}</label>
                <InputField
                  type="text"
                  value={user.address?.street || ""}
                  readOnly
                  placeholder={t("userPage.address")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="postcode">{t("userPage.postalCode")}</label>
                <InputField
                  type="text"
                  value={user.address?.postalCode || ""}
                  readOnly
                  placeholder={t("userPage.postalCode")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="region">{t("userPage.city")}</label>
                <InputField
                  type="text"
                  value={user.address?.city || ""}
                  readOnly
                  placeholder={t("userPage.city")}
                />
              </div>
            </div>
          </div>

          <h3>{t("userPage.yourOptions")}</h3>
          <div className="action-grid">
            <button className="action-btn logout">
              <span>{t("userPage.logout")}</span>
            </button>
          </div>
        </div>

        <div className="user-page-orders-card">
          <h1>{t("userPage.orders")}</h1>
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

                    <div className="order-items">
                      {itemNames || t("userPage.noItems")}
                    </div>

                    <TextButton className="reorder-btn">
                      {t("userPage.makeOrderAgain")}
                    </TextButton>

                    <hr className="order-divider" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p>{t("userPage.noOrders")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserPage;
