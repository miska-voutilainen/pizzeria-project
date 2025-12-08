import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import ActionButton from "./ActionButton";
import "./UserProfileModal.css";

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
  useEffect(() => {
    if (user) {
      console.log("UserProfileModal user data:", user); // Debug
      const newForm = {
        etunimi: user.firstName || "",
        sukunimi: user.lastName || "",
        kayttajanimi: user.username || "",
        sahkoposti: user.email || "",
        katuosoite: user.address || "",
        status: user.accountStatus === "active" ? "Aktiivinen" : "Deactiivinen",
        rooli: user.role || "User",
      };
      console.log("Setting form to:", newForm); // Debug
      setForm(newForm);
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
      className="user-profile-modal"
    >
      <div className="user-profile-header">
        <div className="user-profile-header-user-id">#{user.userId}</div>
        <div className="user-profile-header-user-name">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </div>
        <div className="user-profile-header-last-login">
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
      </div>

      <div className="user-profile-section">
        <h3 className="user-profile-section-title">Henkilötiedot</h3>

        <div className="user-profile-form-grid user-profile-form-grid--three-columns">
          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Etunimi</label>
            <input
              type="text"
              value={form.etunimi}
              onChange={(e) => handleInputChange("etunimi", e.target.value)}
              className="user-profile-form-field-input"
            />
          </div>

          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Sukunimi</label>
            <input
              type="text"
              value={form.sukunimi}
              onChange={(e) => handleInputChange("sukunimi", e.target.value)}
              className="user-profile-form-field-input"
            />
          </div>

          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">
              Käyttäjänimi
            </label>
            <input
              type="text"
              value={form.kayttajanimi}
              onChange={(e) =>
                handleInputChange("kayttajanimi", e.target.value)
              }
              className="user-profile-form-field-input"
            />
          </div>
        </div>

        <div className="user-profile-form-field">
          <label className="user-profile-form-field-label">Sähköposti</label>
          <input
            type="email"
            value={form.sahkoposti}
            onChange={(e) => handleInputChange("sahkoposti", e.target.value)}
            className="user-profile-form-field-input user-profile-form-field-input--email"
          />
        </div>
      </div>

      <div className="user-profile-section">
        <h3 className="user-profile-section-title">Osoite</h3>

        <div className="user-profile-form-field">
          <label className="user-profile-form-field-label">Osoite</label>
          <textarea
            value={form.katuosoite}
            onChange={(e) => handleInputChange("katuosoite", e.target.value)}
            rows="2"
            className="user-profile-form-field-textarea"
            placeholder="Esim. Pizzatie 5, 00510 Helsinki"
          />
        </div>
      </div>

      <div className="user-profile-section user-profile-section--final">
        <h3 className="user-profile-section-title">Muu</h3>

        <div className="user-profile-form-grid user-profile-form-grid--two-columns">
          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="user-profile-form-field-select"
            >
              <option value="Aktiivinen">Aktiivinen</option>
              <option value="Deactiivinen">Deactiivinen</option>
            </select>
          </div>

          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Rooli</label>
            <select
              value={form.rooli}
              onChange={(e) => handleInputChange("rooli", e.target.value)}
              className="user-profile-form-field-select"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="user-profile-actions">
        <ActionButton
          variant="success"
          onClick={handleSave}
          className="user-profile-actions-save-button"
        >
          Tallenna
        </ActionButton>
      </div>
    </Modal>
  );
}
