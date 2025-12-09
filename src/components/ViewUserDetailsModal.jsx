import React from "react";
import Modal from "./Modal/Modal";
import ActionButton from "./ActionButton";
import "./ViewUserDetailsModal.css";

export default function ViewUserDetailsModal({
  isOpen,
  onClose,
  user,
  onEdit,
}) {
  if (!user) return null;

  // Helper function to format date
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

  // Parse address into components
  const parseAddress = (address) => {
    if (!address) return { katuosoite: "", postinumero: "", kaupunki: "" };

    try {
      // Try to parse JSON format
      if (typeof address === "string") {
        const parsed = JSON.parse(address);
        return {
          katuosoite: parsed.street || "",
          postinumero: parsed.postalCode || "",
          kaupunki: parsed.city || "",
        };
      } else if (typeof address === "object") {
        return {
          katuosoite: address.street || "",
          postinumero: address.postalCode || "",
          kaupunki: address.city || "",
        };
      }
    } catch (error) {
      console.error("Error parsing address:", error);
    }

    return { katuosoite: "", postinumero: "", kaupunki: "" };
  };

  const addressInfo = parseAddress(user.address);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Käyttäjän tiedot"
      className="view-user-details-modal"
    >
      <div className="view-user-details-header">
        <div className="view-user-details-header-user-id">#{user.userId}</div>
        <div className="view-user-details-header-user-name">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </div>
        <div className="view-user-details-header-last-login">
          Viimeinen kirjautuminen: {formatDate(user.lastLoginAt)}
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section">
        <h3 className="view-user-details-section-title">Henkilötiedot</h3>

        <div className="view-user-details-grid view-user-details-grid--five-columns">
          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Etunimi</label>
            <div className="view-user-details-field-value">
              {user.firstName || "-"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Sukunimi</label>
            <div className="view-user-details-field-value">
              {user.lastName || "-"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Käyttäjänimi
            </label>
            <div className="view-user-details-field-value">{user.username}</div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Sähköposti</label>
            <div className="view-user-details-field-value">{user.email}</div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Sähköposti vahvistettu
            </label>
            <div className="view-user-details-field-value">
              {user.emailVerified ? "Kyllä" : "Ei"}
            </div>
          </div>
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section">
        <h3 className="view-user-details-section-title">Osoitetiedot</h3>

        <div className="view-user-details-grid view-user-details-grid--three-columns">
          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Katuosoite</label>
            <div className="view-user-details-field-value">
              {addressInfo.katuosoite || "-"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Postinumero</label>
            <div className="view-user-details-field-value">
              {addressInfo.postinumero || "-"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Kaupunki</label>
            <div className="view-user-details-field-value">
              {addressInfo.kaupunki || "-"}
            </div>
          </div>
        </div>
      </div>

      <hr className="view-user-details-section-divider" />

      <div className="view-user-details-section view-user-details-section--final">
        <h3 className="view-user-details-section-title">Muu</h3>

        <div className="view-user-details-grid view-user-details-grid--six-columns">
          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Rooli</label>
            <div className="view-user-details-field-value">
              {user.role || "User"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">2FA päällä</label>
            <div className="view-user-details-field-value">
              {user.is2faEnabled ? "Kyllä" : "Ei"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Status</label>
            <div className="view-user-details-field-value">
              {user.accountStatus === "active" ? "Aktiivinen" : "Deactiivinen"}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Salasana päivitetty
            </label>
            <div className="view-user-details-field-value">
              {formatDate(user.lastPasswordChange)}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Kirjautumiset
            </label>
            <div className="view-user-details-field-value">
              {user.loginCount || 0}
            </div>
          </div>
        </div>

        <div
          className="view-user-details-grid view-user-details-grid--four-columns"
          style={{ marginTop: "16px" }}
        >
          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Profili päivitetty
            </label>
            <div className="view-user-details-field-value">
              {formatDate(user.updatedAt)}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">Luotu</label>
            <div className="view-user-details-field-value">
              {formatDate(user.createdAt)}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              2FA viimeksi päällä
            </label>
            <div className="view-user-details-field-value">
              {formatDate(user.last2faVerifiedAt)}
            </div>
          </div>

          <div className="view-user-details-field">
            <label className="view-user-details-field-label">
              Kirjautumisvirheet
            </label>
            <div className="view-user-details-field-value">
              {user.failedLoginCount || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="view-user-details-actions">
        <ActionButton
          variant="success"
          onClick={() => onEdit(user)}
          className="view-user-details-actions-edit-button"
        >
          Muokkaa
        </ActionButton>
      </div>
    </Modal>
  );
}
