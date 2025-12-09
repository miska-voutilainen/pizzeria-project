import "./SquareButton.css";
import addIcon from "../../../assets/images/add-icon.svg";
import editIcon from "../../../assets/images/pen-icon.svg";

const SquareButton = ({ type, onClick, product }) => {
  const getIcon = () => {
    if (type === "add") return addIcon;
    if (type === "edit") return editIcon;
  };

  const handleClick = () => {
    if (onClick && product) {
      onClick(product);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div id="square-button-container">
      <button onClick={handleClick}>
        <img src={getIcon()} alt={`${type} icon`} />
      </button>
    </div>
  );
};

export default SquareButton;
