import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import ActionButton from "../ActionButton";
import "./UserProfileModal.css";
import Button from "../Button/Button";

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

  const formatDate = (dateString) => {
    if (!dateString) return "Ei tietoa";
    return (
      new Date(dateString).toLocaleDateString("fi-FI") +
      ", " +
      new Date(dateString).toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      className="view-user-details-modal"
    >
      <div className="view-user-details-header">
        <div className="view-user-details-header-user-id">
          <p>#{user.userId}</p>
        </div>
        <div className="view-user-details-header-user-name">
          <h3>
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username}
          </h3>
        </div>
        <div className="view-user-details-header-last-login">
          <p>Viimeinen kirjautuminen: {formatDate(user.lastLoginAt)}</p>
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section">
        <h3 className="view-user-details-section-title">Henkilötiedot</h3>

        <div className="view-user-details-grid view-user-details-grid--five-columns">
          <div className="view-user-details-field">
            <label>Etunimi</label>
            <div>
              <input
                type="text"
                value={form.etunimi}
                onChange={(e) => handleInputChange("etunimi", e.target.value)}
                placeholder="Mikko"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Sukunimi</label>
            <div>
              <input
                type="text"
                value={form.sukunimi}
                onChange={(e) => handleInputChange("sukunimi", e.target.value)}
                placeholder="Virtanen"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Käyttäjänimi</label>
            <div>
              <input
                type="text"
                value={form.kayttajanimi}
                onChange={(e) =>
                  handleInputChange("kayttajanimi", e.target.value)
                }
                placeholder="mvirtanen"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Sähköposti</label>
            <div>
              <input
                type="email"
                value={form.sahkoposti}
                onChange={(e) =>
                  handleInputChange("sahkoposti", e.target.value)
                }
                placeholder="m.virtanen@example.com"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Sähköposti vahvistettu</label>
            <div>
              <p>{user.emailVerified ? "Kyllä" : "Ei"}</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section">
        <h3 className="view-user-details-section-title">Osoitetiedot</h3>

        <div className="view-user-details-grid view-user-details-grid--three-columns">
          <div className="view-user-details-field">
            <label>Katuosoite</label>
            <div>
              <input
                type="text"
                value={form.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="Esim. Pizzatie 5"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Postinumero</label>
            <div>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) =>
                  handleInputChange("postalCode", e.target.value)
                }
                placeholder="Esim. 00510"
              />
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Kaupunki</label>
            <div>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Esim. Helsinki"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section view-user-details-section--final">
        <h3 className="view-user-details-section-title">Muu</h3>

        <div className="view-user-details-grid view-user-details-grid--six-columns">
          <div className="view-user-details-field">
            <label>Rooli</label>
            <div>
              <select
                value={form.rooli}
                onChange={(e) => handleInputChange("rooli", e.target.value)}
              >
                <option value="user">User</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>2FA päällä</label>
            <div>
              <p>{user.is2faEnabled ? "Kyllä" : "Ei"}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Status</label>
            <div>
              <select
                value={form.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="Aktiivinen">Aktiivinen</option>
                <option value="Deactiivinen">Deactiivinen</option>
              </select>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Salasana päivitetty</label>
            <div>
              <p>{formatDate(user.lastPasswordChange)}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Kirjautumiset</label>
            <div>
              <p>{user.loginCount || 0}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Profili päivitetty</label>
            <div>
              <p>{formatDate(user.updatedAt)}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Luotu</label>
            <div>
              <p>{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>2FA viimeksi päällä</label>
            <div>
              <p>{formatDate(user.last2faVerifiedAt)}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Kirjautumisvirheet</label>
            <div>
              <p>{user.failedLoginCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="view-user-details-actions">
        <Button onClick={handleSave} text={"Tallenna"} />
      </div>
    </Modal>
  );
}
