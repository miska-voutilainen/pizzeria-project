import React, { useState, useRef, useEffect } from "react";
import "./UserDetailsModalHeader.css";
import clipBoardIcon from "../../assets/images/clipboard-icon.svg";

const UserDetailsModalHeader = ({ user, formatDate }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copyUserId = async () => {
    const idText = String(user?.userId ?? "");
    if (!idText) return;
    try {
      await navigator.clipboard.writeText(idText);
      setCopied(false);
      requestAnimationFrame(() => setCopied(true));

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 900);
    } catch (err) {
      console.error("Failed to copy userId:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  return (
    <div className="view-user-details-header">
      <div className="view-user-details-header-user-id">
        <p className={copied ? "userid-copied" : ""}>#{user.userId}</p>
        <button
          type="button"
          className="copy-userid-button"
          onClick={copyUserId}
          title="Kopioi käyttäjä-ID"
          aria-label="Kopioi käyttäjä-ID"
        >
          <img src={clipBoardIcon} alt="clipboard icon" />
        </button>
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
  );
};

export default UserDetailsModalHeader;
