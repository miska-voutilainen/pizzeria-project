import React from "react";

export default function ActionButton({
  variant = "primary",
  size = "small",
  children,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "#28a745",
          color: "white",
          border: "1px solid #28a745",
        };
      case "danger":
        return {
          backgroundColor: "#dc3545",
          color: "white",
          border: "1px solid #dc3545",
        };
      case "secondary":
        return {
          backgroundColor: "#6c757d",
          color: "white",
          border: "1px solid #6c757d",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "#007bff",
          border: "1px solid #007bff",
        };
      default:
        return {
          backgroundColor: "#007bff",
          color: "white",
          border: "1px solid #007bff",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: "4px 12px",
          fontSize: "12px",
        };
      case "medium":
        return {
          padding: "8px 16px",
          fontSize: "14px",
        };
      default:
        return {
          padding: "4px 12px",
          fontSize: "12px",
        };
    }
  };

  return (
    <button
      style={{
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "500",
        marginRight: "4px",
        transition: "all 0.2s ease",
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
