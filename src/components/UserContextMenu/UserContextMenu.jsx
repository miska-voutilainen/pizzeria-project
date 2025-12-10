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
      <div className="user-context-menu-container" onClick={onClose} />

      {/* Context Menu */}
      <div
        className="user-context-menu"
        style={{
          top: position?.y || 0,
          left: (position?.x || 0) + 15,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item, index) => (
          <div className="user-context-menu-item-wrapper" key={index}>
            <button
              onClick={item.onClick}
              className={`user-context-menu-item${
                index < menuItems.length - 1
                  ? " user-context-menu-item--spaced"
                  : ""
              }`}
            >
              <span className="user-context-menu-item-icon">
                <img src={item.icon} alt={item.icon} />
              </span>
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
