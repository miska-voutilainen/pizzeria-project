import { Link } from "react-router-dom";
import "./Button.css";

const Button = ({ url, text, imageUrl, disabled, onClick }) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return false;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={url}
      className={`button ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
    >
      {text}
      {imageUrl && <img src={imageUrl} alt={imageUrl} />}
    </Link>
  );
};

export default Button;
