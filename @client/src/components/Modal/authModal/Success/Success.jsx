import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";

const Success = ({ onClose }) => {
  return (
    <div>
      <CloseButton onClick={onClose} />
      <img src="./confirm.svg" alt="Success"></img>
      <h1>Success</h1>
    </div>
  );
};

export default Success;
