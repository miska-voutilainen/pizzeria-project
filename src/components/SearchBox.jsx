import React from "react";

export default function SearchBox({
  placeholder = "Hae käyttäjä",
  value = "",
  onChange,
  ...props
}) {
  return (
    <div style={{ marginBottom: "20px", ...props.containerStyle }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "250px",
          padding: "8px 12px",
          border: "1px solid #ced4da",
          borderRadius: "4px",
          fontSize: "14px",
          backgroundColor: "white",
          ...props.style,
        }}
        {...props}
      />
    </div>
  );
}
