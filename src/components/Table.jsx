import React from "react";

export default function Table({ children, ...props }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
        fontSize: "14px",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </table>
  );
}
