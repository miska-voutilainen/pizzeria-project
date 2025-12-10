import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import "./RegistrationSuccess.css";

const RegistrationSuccess = ({ onClose }) => {
  return (
    <div>
      <CloseButton onClick={onClose} />
      <img src="./confirm.svg" alt="Confirmed"></img>
      <div className="success-text">
        <h1>Thank you for creating an account!</h1>
        <p id="success-text">Please, check your inbox to verify your email.</p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
