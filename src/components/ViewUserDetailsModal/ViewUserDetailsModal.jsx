import React from "react";
import Modal from "../Modal/Modal";
import ActionButton from "../ActionButton";
import "./ViewUserDetailsModal.css";
import Button from "../Button/Button";

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
              <p>{user.firstName || "-"}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Sukunimi</label>
            <div>
              <p>{user.lastName || "-"}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Käyttäjänimi</label>
            <div>
              <p>{user.username}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Sähköposti</label>
            <div>
              <p>{user.email}</p>
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
              <p>{addressInfo.katuosoite || "-"}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Postinumero</label>
            <div>
              <p>{addressInfo.postinumero || "-"}</p>
            </div>
          </div>

          <div className="view-user-details-field">
            <label>Kaupunki</label>
            <div>
              <p>{addressInfo.kaupunki || "-"}</p>
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
              <p>{user.role || "User"}</p>
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
              <p>
                {user.accountStatus === "active"
                  ? "Aktiivinen"
                  : "Deactiivinen"}
              </p>
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
        {/* <ActionButton
          variant="success"
          onClick={() => onEdit(user)}
          className="view-user-details-actions-edit-button"
        >
          Muokkaa
        </ActionButton> */}
        <Button onClick={() => onEdit(user)} text={"Muokkaa"} type={"edit"} />
      </div>
    </Modal>
  );
}
