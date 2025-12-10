import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import Button from "../../../ui/Button/Button.jsx";
import {useState} from "react";
import "./ResetPassword.css";


const ResetPassword = ({setModalContent, onClose}) => {
    const [email, setEmail] = useState("");

    return (
        <div>
            <form id="reset-password-form">
                <CloseButton onClick={onClose}/>
                <h1>Enter your email</h1>
                <InputField type="email"
                            name="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(value) => setEmail(value)}/>
                <Button type="submit" id="reset-password-button" onClick={(e) =>{{e.preventDefault(); setModalContent("ResetPasswordSuccess")}}} text="Send an email"/>
            </form>
        </div>

    )

}

export default ResetPassword