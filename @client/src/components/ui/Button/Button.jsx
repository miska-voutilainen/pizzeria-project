import { Link } from "react-router-dom";
import "./Button.css";

const Button = ({ url, text, imageUrl, onClick }) => {
  return (
    <Link to={url} className="button" onClick={onClick}>
      {text}
      {imageUrl && <img src={imageUrl} alt={imageUrl} />}
    </Link>
  );
};

export default Button;
