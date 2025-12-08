import React from "react";

export default function TableRow({ children, isEven = false, ...props }) {
  return (
    <tr
      style={{
        backgroundColor: isEven ? "#f8f9fa" : "white",
        borderBottom: "1px solid #dee2e6",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </tr>
  );
}
