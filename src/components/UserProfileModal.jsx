import React, { useState } from "react";
import Modal from "./Modal";
import ActionButton from "./ActionButton";

export default function UserProfileModal({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState({
    etunimi: "",
    sukunimi: "",
    kayttajanimi: "",
    sahkoposti: "",
    katuosoite: "",
    status: "Deactiivinen",
    rooli: "User",
  });

  // Update form when user changes
  useState(() => {
    if (user) {
      setForm({
        etunimi: user.firstName || "",
        sukunimi: user.lastName || "",
        kayttajanimi: user.username || "",
        sahkoposti: user.email || "",
        katuosoite: user.address || "",
        status: user.accountStatus === "active" ? "Aktiivinen" : "Deactiivinen",
        rooli: user.role || "User",
      });
    }
  }, [user]);

  const handleSave = async () => {
    await onSave({
      firstName: form.etunimi,
      lastName: form.sukunimi,
      username: form.kayttajanimi,
      email: form.sahkoposti,
      role: form.rooli,
      accountStatus: form.status === "Aktiivinen" ? "active" : "inactive",
      address: form.katuosoite,
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Muokkaa profiilia"
    >
      <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>
        #{user.userId}
      </div>
      <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
        {user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username}
      </div>
      <div style={{ color: "#6c757d", fontSize: "14px", marginBottom: "24px" }}>
        Viimeinen kirjautuminen:{" "}
        {user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString("fi-FI") +
            ", " +
            new Date(user.lastLoginAt).toLocaleTimeString("fi-FI", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Ei koskaan"}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          Henkilötiedot
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            >
              Etunimi
            </label>
            <input
              type="text"
              value={form.etunimi}
              onChange={(e) => handleInputChange("etunimi", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            >
              Sukunimi
            </label>
            <input
              type="text"
              value={form.sukunimi}
              onChange={(e) => handleInputChange("sukunimi", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            >
              Käyttäjänimi
            </label>
            <input
              type="text"
              value={form.kayttajanimi}
              onChange={(e) =>
                handleInputChange("kayttajanimi", e.target.value)
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Sähköposti
          </label>
          <input
            type="email"
            value={form.sahkoposti}
            onChange={(e) => handleInputChange("sahkoposti", e.target.value)}
            style={{
              width: "48%",
              padding: "8px 12px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          Osoite
        </h3>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#6c757d",
              marginBottom: "4px",
            }}
          >
            Osoite
          </label>
          <textarea
            value={form.katuosoite}
            onChange={(e) => handleInputChange("katuosoite", e.target.value)}
            rows="2"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "14px",
              resize: "vertical",
            }}
            placeholder="Esim. Pizzatie 5, 00510 Helsinki"
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          Muu
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            >
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="Aktiivinen">Aktiivinen</option>
              <option value="Deactiivinen">Deactiivinen</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            >
              Rooli
            </label>
            <select
              value={form.rooli}
              onChange={(e) => handleInputChange("rooli", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #dee2e6",
          paddingTop: "20px",
        }}
      >
        <ActionButton
          variant="danger"
          onClick={onClose}
          style={{ backgroundColor: "#dc3545" }}
        >
          Hylkää
        </ActionButton>
        <ActionButton
          variant="success"
          onClick={handleSave}
          style={{ backgroundColor: "#28a745" }}
        >
          Tallenna
        </ActionButton>
      </div>
    </Modal>
  );
}
