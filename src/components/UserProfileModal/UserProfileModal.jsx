import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import ActionButton from "../ActionButton";
import "./UserProfileModal.css";

export default function UserProfileModal({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState({
    etunimi: "",
    sukunimi: "",
    kayttajanimi: "",
    sahkoposti: "",
    street: "",
    postalCode: "",
    city: "",
    status: "Deactiivinen",
    rooli: "user",
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      console.log("UserProfileModal user data:", user); // Debug

      // Parse address from JSON or string
      let street = "";
      let postalCode = "";
      let city = "";

      if (user.address) {
        try {
          if (typeof user.address === "string") {
            const parsed = JSON.parse(user.address);
            street = parsed.street || "";
            postalCode = parsed.postalCode || "";
            city = parsed.city || "";
          } else if (
            typeof user.address === "object" &&
            user.address !== null
          ) {
            street = user.address.street || "";
            postalCode = user.address.postalCode || "";
            city = user.address.city || "";
          }
        } catch (error) {
          console.error("Error parsing address:", error);
          street = "";
          postalCode = "";
          city = "";
        }
      }

      const newForm = {
        etunimi: user.firstName || "",
        sukunimi: user.lastName || "",
        kayttajanimi: user.username || "",
        sahkoposti: user.email || "",
        street: street,
        postalCode: postalCode,
        city: city,
        status: user.accountStatus === "active" ? "Aktiivinen" : "Deactiivinen",
        rooli: user.role || "user",
      };
      console.log("Setting form to:", newForm); // Debug
      setForm(newForm);
    }
  }, [user]);

  const handleSave = async () => {
    console.log("Saving user profile...");

    // Map display role values to database role values
    const roleMap = {
      User: "user",
      Administrator: "administrator",
      user: "user",
      administrator: "administrator",
    };

    // Format address as JSON object
    const addressObj = {
      street: form.street || "",
      postalCode: form.postalCode || "",
      city: form.city || "",
    };

    // Only include address if at least one field is filled
    let addressValue = null;
    if (addressObj.street || addressObj.postalCode || addressObj.city) {
      addressValue = JSON.stringify(addressObj);
    }

    const saveData = {
      firstName: form.etunimi,
      lastName: form.sukunimi,
      username: form.kayttajanimi,
      email: form.sahkoposti,
      role: roleMap[form.rooli] || form.rooli, // Map to database value
      accountStatus: form.status === "Aktiivinen" ? "active" : "inactive",
      address: addressValue,
    };
    console.log("Save data:", saveData);
    const success = await onSave(saveData);
    if (success) {
      console.log("Save successful, closing modal");
      onClose();
    } else {
      console.log("Save failed, keeping modal open");
    }
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

        <div className="user-profile-form-grid user-profile-form-grid--three-columns">
          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Katuosoite</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              className="user-profile-form-field-input"
              placeholder="Esim. Pizzatie 5"
            />
          </div>

          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Postinumero</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              className="user-profile-form-field-input"
              placeholder="Esim. 00510"
            />
          </div>

          <div className="user-profile-form-field">
            <label className="user-profile-form-field-label">Kaupunki</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="user-profile-form-field-input"
              placeholder="Esim. Helsinki"
            />
          </div>
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
              <option value="user">User</option>
              <option value="administrator">Administrator</option>
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
