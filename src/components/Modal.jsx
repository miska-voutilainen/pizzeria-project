import React from "react";

export default function Modal({
  isOpen,
  onClose,
  children,
  size = "medium",
  title,
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          maxWidth: "200px",
          width: "200px",
        };
      case "large":
        return {
          maxWidth: "800px",
          width: "90vw",
        };
      default:
        return {
          maxWidth: "500px",
          width: "90vw",
        };
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: size === "small" ? "8px" : "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          position: "relative",
          ...getSizeStyles(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && size !== "small" && (
          <div
            style={{
              borderBottom: "1px solid #dee2e6",
              paddingBottom: "16px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {title}
            </h2>
          </div>
        )}

        {showCloseButton && size !== "small" && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6c757d",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
