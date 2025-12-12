import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal/Modal.jsx";
import InputField from "../../components/ui/InputField/InputField.jsx";
import TextButton from "../../components/ui/TextButton/TextButton.jsx";
import deliveryIcon from "../../assets/images/delivery-icon.svg";
import takeawayIcon from "../../assets/images/store-icon.svg";
import "./UserPage.css";

const UserPage = () => {
  const { user, loading, checkAuth } = useAuth();

  const [modalWindow, setModalWindow] = useState(null);
  const modalRef = useRef(null);
  const [loading2FA, setLoading2FA] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(!!user?.twoFactorEnabled);

  const [address, setAddress] = useState({
    street: user.address?.street || "",
    postalCode: user.address?.postalCode || "",
    city: user.address?.city || "",
  });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");

  const [name, setName] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
  });
  const [loadingName, setLoadingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");

  useEffect(() => {
    setActive(!!user?.twoFactorEnabled);
  }, [user?.twoFactorEnabled]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSend2FACode = async () => {
    if (!user.emailVerified) {
      window.alert(
        "Please verify your email address first before enabling 2FA."
      );
      return;
    }

    setLoading2FA(true);
    setMessage("");
    setTwoFactorError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/send-2fa-code",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("4-digit code sent to your email!");
        setModalWindow(
          user.twoFactorEnabled ? "TwoFactorDisable" : "TwoFactorSetup"
        );
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to send code");
      }
    } catch (error) {
      setMessage("Failed to send code");
    } finally {
      setLoading2FA(false);
    }
  };

  const handle2FASetupSubmit = async (code) => {
    setLoading2FA(true);
    setTwoFactorError("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/verify-2fa-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        setMessage("2FA enabled successfully!");
        modalRef.current.close();
        await checkAuth();
      } else {
        const err = await response.json();
        setTwoFactorError(err.message || "Invalid code");
      }
    } catch (err) {
      setTwoFactorError("Verification failed");
    } finally {
      setLoading2FA(false);
    }
  };

  const handle2FADisableSubmit = async (code) => {
    setLoading2FA(true);
    setTwoFactorError("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/disable-2fa-with-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        setMessage("2FA disabled successfully!");
        modalRef.current.close();
        await checkAuth();
      } else {
        const err = await response.json();
        setTwoFactorError(err.message || "Invalid code");
      }
    } catch (err) {
      setTwoFactorError("Verification failed");
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
        setMessage("Verification email sent! Please check your inbox.");
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

  const handleSaveAddress = async () => {
    setLoadingAddress(true);
    setAddressMessage("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/update-address",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(address),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAddressMessage("Address saved successfully!");
        await checkAuth(); // Refresh user data
      } else {
        setAddressMessage(data.message || "Failed to save address");
      }
    } catch (err) {
      setAddressMessage("Network error - please try again");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSaveName = async () => {
    setLoadingName(true);
    setNameMessage("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/update-name",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName: name.firstName.trim(),
            lastName: name.lastName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNameMessage("Name saved successfully!");
        await checkAuth(); // Refresh user data
      } else {
        setNameMessage(data.message || "Failed to save name");
      }
    } catch (err) {
      setNameMessage("Failed to save name");
    } finally {
      setLoadingName(false);
    }
  };

  return (
    <section id="user-page">
      {/* Modal for all flows */}
      <Modal
        ref={modalRef}
        window={modalWindow}
        setModalWindow={setModalWindow}
        isLoading2FA={loading2FA}
        twoFactorError={twoFactorError}
        on2FASetupSubmit={handle2FASetupSubmit}
        on2FADisableSubmit={handle2FADisableSubmit}
      />

      <div className="user-page-wrapper">
        <div className="user-page-user-card">
          <div className="user-page-user-card-header">
            <div className="user-card-username">
              <h1>Welcome back, {user.username}!</h1>
              <div className="user-info">
                <p>
                  <strong>Member since:</strong>{" "}
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="user-cad-header-logout">
              <div className="action-grid">
                <button
                  className="action-btn logout"
                  onClick={async () => {
                    if (!confirm("Are you sure you want to log out?")) return;
                    try {
                      await fetch("http://localhost:3001/api/auth/logout", {
                        method: "POST",
                        credentials: "include",
                      });
                    } catch (err) {
                      console.error("Logout error:", err);
                    }
                    await checkAuth();
                    window.location.href = "/";
                  }}
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="user-card-personal-container">
            <div className="checkout-inputs">
              <h2>Personal information</h2>

              {/* First Name */}
              <div className="checkout-input-row">
                <label htmlFor="firstName">Etunimi</label>
                <InputField
                  type="text"
                  value={name.firstName}
                  onChange={(value) =>
                    setName((prev) => ({ ...prev, firstName: value }))
                  }
                  placeholder="Etunimi puuttuu"
                />
              </div>

              {/* Last Name */}
              <div className="checkout-input-row">
                <label htmlFor="surname">Sukunimi</label>
                <InputField
                  type="text"
                  value={name.lastName}
                  onChange={(value) =>
                    setName((prev) => ({ ...prev, lastName: value }))
                  }
                  placeholder="Sukunimi puuttuu"
                />
              </div>

              <div className="checkout-input-row">
                <label htmlFor="email">Email</label>
                <InputField
                  type="text"
                  value={user.email || ""}
                  readOnly
                  placeholder="pekka.virtanen@gmail.com"
                />
                <TextButton
                  text="Change"
                  onClick={() => setModalWindow("ChangeEmail")}
                />
              </div>

              <div className="checkout-input-row">
                <label htmlFor="password">Salasana</label>
                <InputField type="password" value={"**********"} readOnly />
                <TextButton
                  text="Change"
                  onClick={() => setModalWindow("ResetPassword")}
                />
              </div>

              <div className="user-page-save-address-changes-container">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {nameMessage && (
                    <p
                      style={{
                        margin: "0 15px 0 0",
                        color: nameMessage.includes("success")
                          ? "green"
                          : "red",
                      }}
                    >
                      {nameMessage}
                    </p>
                  )}
                  <TextButton
                    text={loadingName ? "Saving..." : "Save name"}
                    onClick={handleSaveName}
                    disabled={loadingName}
                  />
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <p
                  style={{
                    margin: "15px 0",
                    color:
                      message.includes("success") || message.includes("sent")
                        ? "green"
                        : "red",
                  }}
                >
                  {message}
                </p>
              )}

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
                    <strong>Email Verification Required</strong>
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

              {/* 2FA Toggle */}
              <div className="email-2FA-container">
                <p>Enable Two-Factor Authentication</p>
                <div
                  className={`switch ${active ? "active" : ""}`}
                  onClick={handleSend2FACode}
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

          {/* Delivery Address */}
          <div className="user-card-delivery-address-container">
            <div className="checkout-inputs">
              <h2>Delivery address</h2>

              {/* Street */}
              <div className="checkout-input-row">
                <label htmlFor="address">Katuosoite</label>
                <InputField
                  type="text"
                  value={address.street}
                  onChange={(value) =>
                    setAddress((prev) => ({ ...prev, street: value }))
                  }
                  placeholder="Katuosoite puuttuu"
                />
              </div>

              {/* Postal Code */}
              <div className="checkout-input-row">
                <label htmlFor="postcode">Postinumero</label>
                <InputField
                  type="text"
                  value={address.postalCode}
                  onChange={(value) =>
                    setAddress((prev) => ({ ...prev, postalCode: value }))
                  }
                  placeholder="Postinumero puuttuu"
                />
              </div>

              {/* City */}
              <div className="checkout-input-row">
                <label htmlFor="region">Kaupunki</label>
                <InputField
                  type="text"
                  value={address.city}
                  onChange={(value) =>
                    setAddress((prev) => ({ ...prev, city: value }))
                  }
                  placeholder="Kaupunki puuttuu"
                />
              </div>

              {/* Save Address Button + Message */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {addressMessage && (
                  <p
                    style={{
                      margin: "0 15px 0 0",
                      color: addressMessage.includes("success")
                        ? "green"
                        : "red",
                    }}
                  >
                    {addressMessage}
                  </p>
                )}
                <TextButton
                  text={loadingAddress ? "Saving..." : "Save address"}
                  onClick={handleSaveAddress}
                  disabled={loadingAddress}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="user-page-divider" />

        {/* Orders */}
        <div className="user-page-orders-card">
          <h2>Orders</h2>
          {Array.isArray(user.orders) && user.orders.length > 0 ? (
            <div className="simple-orders-list">
              {user.orders.map((order) => {
                const id = order.orderId || "-";
                const date = order.createdAt;
                const items = Array.isArray(order.items) ? order.items : [];
                const total = order.totalAmount || 0;
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
