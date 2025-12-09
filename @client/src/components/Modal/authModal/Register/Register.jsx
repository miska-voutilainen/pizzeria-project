import "./Register.css";
import Button from "../../../ui/Button/Button.jsx";
import CheckBox from "../../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import {useState} from "react";
import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";
import InputField from "../../../ui/InputField/InputField.jsx";
import TextButton from "../../../ui/TextButton/TextButton.jsx";

const Register = ({setModalContent,onClose}) => {

    const [email, setEmail] = React.useState("");
    const [userName, setUserName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [password, setPassword] = React.useState("");

    return (
        <div>
            <CloseButton onClick={onClose} />
            <div id="registerContent">
                <div id="registerTitle">
                    <h1>Register</h1>
                    <div>
                        <p>Or</p>
                        <TextButton text="log in" onClick={() => setModalContent("SignIn")} />
                    </div>
                </div>
                <div id="inputFields">
                    <InputField type="email" name="email" id="email" placeholder="Email" value={email} onChange={setEmail} placeholder="Email" />
                    <InputField type="username" name="username" id="username" placeholder="username" value={userName} onChange={setUserName} placeholder="Username" />
                    <InputField type="password" name="password" id="password" value={password} onChange={setPassword} placeholder="Password" />
                    <InputField type="password" name="confirm-password" id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password"/>
                </div>
                <div>
                    <Button text="Create an account" id="register-button" onClick={()=>setModalContent("RegistrationSuccess")}/>
                </div>
            </div>
        </div>
    );
}

export default Register;