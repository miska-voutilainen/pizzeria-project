import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import "./EmailPasswordSuccess.css";

const EmailPasswordSuccess = ({modalContent, onClose}) => {
    return (
        <div id="content">
            <CloseButton onClick={onClose} />
            <img src="./confirm.svg" alt="Confirmed"></img>
            {modalContent === "ResetPasswordSuccess" && (<h1> The reset password link has been sent to your email.</h1>)}
            {modalContent === "EmailConfirmationSuccess" && (<h1>The password change link has been sent to your email.</h1>)}
        </div>
    );
}

export default EmailPasswordSuccess;