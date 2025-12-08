import React from "react";
import Modal from "./Modal";

export default function UserContextMenu({
  isOpen,
  onClose,
  onViewDetails,
  onEditProfile,
  onViewOrders,
}) {
  const menuItems = [
    {
      icon: "📄",
      label: "Tarkastele tietoja",
      onClick: onViewDetails,
    },
    {
      icon: "✏️",
      label: "Muokkaa",
      onClick: onEditProfile,
    },
    {
      icon: "📋",
      label: "Tilaukset",
      onClick: onViewOrders,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
    >
      <div style={{ padding: "4px" }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#333",
              borderRadius: "4px",
              marginBottom: index < menuItems.length - 1 ? "2px" : "0",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "16px" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
