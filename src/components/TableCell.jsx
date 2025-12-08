import React from "react";

export default function TableCell({
  children,
  isHeader = false,
  align = "left",
  width,
  ...props
}) {
  const Tag = isHeader ? "th" : "td";

  return (
    <Tag
      style={{
        padding: "12px 16px",
        textAlign: align,
        border: "1px solid #dee2e6",
        fontSize: "14px",
        fontWeight: isHeader ? "600" : "normal",
        color: isHeader ? "#495057" : "#212529",
        width: width,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
