import CloseButton from "../../../ui/CloseButton/CloseButton.jsx";
import "./EmailPasswordSuccess.css";

const EmailPasswordSuccess = ({ modalContent, onClose }) => {
  return (
    <div id="content">
      <CloseButton onClick={onClose} />
      <img src="./confirm.svg" alt="Confirmed"></img>
      {modalContent === "ResetPasswordSuccess" && (
        <h1> The reset link has been sent to your email.</h1>
      )}
      {modalContent === "EmailConfirmationSuccess" && (
        <h1>The email confirmation link has been sent to your email.</h1>
      )}
    </div>
  );
};

export default EmailPasswordSuccess;
