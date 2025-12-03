import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

const Button = ({ url, text, imageUrl }) => {
  return (
    <Link to={url} className="button">
      {text}
      {imageUrl && <img src={imageUrl} alt="" />}
    </Link>
  );
};

export default Button;
