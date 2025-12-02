import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./Button.module.css";

const Button = ({ url, text, imageUrl }) => {
  return (
    <Link to={url} className={styles.button}>
      {text}
      {imageUrl && <img src={imageUrl} alt="" />}
    </Link>
  );
};

Button.propTypes = {
  url: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
};

export default Button;
