import { Link } from "react-router-dom";
import "./Button.css";

const Button = ({
  url,
  text,
  imageUrl,
  onClick,
  id,
  appearance = "default",
}) => {
  const buttonClass = `button ${appearance === "dark" ? "button-dark" : ""}`;

  // If no URL is provided, render as a regular button
  if (!url) {
    return (
      <button className={buttonClass} onClick={onClick} id={id}>
        {text}
        {imageUrl && <img src={imageUrl} alt={imageUrl} />}
      </button>
    );
  }

  return (
    <Link to={url} className={buttonClass} onClick={onClick} id={id}>
      {text}
      {imageUrl && <img src={imageUrl} alt={imageUrl} />}
    </Link>
  );
};

export default Button;
