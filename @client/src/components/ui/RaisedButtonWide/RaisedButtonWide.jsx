import styles from "./RaisedButtonWide.module.css";
import addIcon from "../../../assets/images/add-icon.svg";
import cartIcon from "../../../assets/images/cart-icon-rectangular.svg";

const RaisedButtonWide = ({ type, text, onClick, product }) => {
  const getIcon = () => {
    if (type === "add") return addIcon;
    if (type === "cart") return cartIcon;
  };

  const handleClick = () => {
    if (onClick && product) {
      onClick(product);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div id={styles["raised-button-wide-container"]}>
      <button onClick={handleClick}>
        <img src={getIcon()} alt={`${type} icon`} />
        {text}
      </button>
    </div>
  );
};

export default RaisedButtonWide;
