import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import "./RegistrationSuccess.css";

const RegistrationSucsess = ({onClose}) => {
    return (
        <div>
            <CloseButton onClick={onClose}/>
            <img src="./confirm.svg" alt="Confirmed"></img>
            <div className="success-text">
                <h1>Thanks for creating an account</h1>
                <p id="success-text">Please, check an email to confirm your password</p>
            </div>
        </div>
    )
}

export default RegistrationSucsess