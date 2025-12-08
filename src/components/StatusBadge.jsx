import React from "react";

export default function StatusBadge({ status, type = "default", ...props }) {
  const getStatusColor = () => {
    if (type === "user-role") {
      return status === "administrator" ? "#dc3545" : "#6c757d";
    }

    if (type === "order-status") {
      switch (status) {
        case "delivered":
          return "#28a745";
        case "ready":
          return "#fd7e14";
        case "preparing":
          return "#007bff";
        case "new":
          return "#6c757d";
        default:
          return "#6c757d";
      }
    }

    if (type === "user-status") {
      return status === "Aktiivinen" ? "#28a745" : "#6c757d";
    }

    return "#6c757d";
  };

  return (
    <span
      style={{
        color: getStatusColor(),
        fontWeight: "600",
        fontSize: "12px",
        textTransform: "capitalize",
        ...props.style,
      }}
      {...props}
    >
      {status}
    </span>
  );
}
