import "./UserContextMenu.css";
import seeInfoIcon from "../../assets/images/see-info-icon.svg";
import penIcon from "../../assets/images/pen-black-icon.svg";
import ordersIcon from "../../assets/images/orders-black-icon.svg";

export default function UserContextMenu({
  isOpen,
  onClose,
  onViewDetails,
  onEditProfile,
  onViewOrders,
  position,
}) {
  const menuItems = [
    {
      icon: seeInfoIcon,
      label: "Tarkastele tietoja",
      onClick: onViewDetails,
    },
    {
      icon: penIcon,
      label: "Muokkaa",
      onClick: onEditProfile,
    },
    {
      icon: ordersIcon,
      label: "Tilaukset",
      onClick: onViewOrders,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="user-context-menu-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Context Menu */}
      <div
        style={{
          position: "fixed",
          top: position?.y || 0,
          left: position?.x || 0,
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "4px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          border: "1px solid #dee2e6",
          zIndex: 1000,
          minWidth: "180px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <img src={item.icon} alt={item.icon} />
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
