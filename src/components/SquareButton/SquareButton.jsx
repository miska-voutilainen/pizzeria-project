import "./SquareButton.css";
import addIcon from "../../assets/images/add-icon.svg";
import editIcon from "../../assets/images/pen-icon.svg";

{
  /*onclick prop*/
}
const SquareButton = ({ type, onClick }) => {
  const getIcon = () => {
    if (type === "add") return addIcon;
    if (type === "edit") return editIcon;
  };

  return (
    <div id="square-button-container">
      <button onClick={onClick}>
        <img src={getIcon()} alt={`${type} icon`} />
      </button>
    </div>
  );
};

export default SquareButton;
