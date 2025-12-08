import React from "react";

export default function TableHeader({ children, ...props }) {
  return (
    <thead
      style={{
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #dee2e6",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </thead>
  );
}
