import { Link } from "react-router-dom";
import "./Button.css";
import addIcon from "../../assets/images/add-icon.svg";
import editIcon from "../../assets/images/pen-icon.svg";

const Button = ({ onClick, url, text, imageUrl, type }) => {
  const Component = url ? Link : "button";
  const props = url ? { to: url, onClick } : { onClick };

  const getIcon = () => {
    if (!type) return null;
    if (type === "add") return addIcon;
    if (type === "edit") return editIcon;
    return imageUrl;
  };

  return (
    <Component className="button" {...props}>
      {getIcon() && <img src={getIcon()} alt="" />}
      {text}
    </Component>
  );
};

export default Button;
