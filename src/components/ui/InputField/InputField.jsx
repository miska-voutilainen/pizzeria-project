import React from "react";
import "./InputField.css";

const InputField = ({ type, name, id, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="greyInput"
      autoComplete="off"
    />
  );
};

export default InputField;
