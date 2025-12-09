import "./SignIn.css";
import Button from "../../ui/Button/Button.jsx";
import CheckBox from "../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import CloseButton from "../../ui/СloseButton/CloseButton.jsx";
import InputField from "../../ui/inputField/InputField.jsx";
import TextButton from "../../ui/TextButton/TextButton.jsx";

const SignIn = ({setModalContent,onClose}) => {

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    return (
            <div>
                <CloseButton onClick={onClose} />
                <div id="signInContent">
                    <div id="signInTitle">
                        <h1>Sign in</h1>
                        <div>
                            <p>Or</p>
                            <TextButton text="create an account" onClick={() => setModalContent("Register")} />
                        </div>
                    </div>
                    <div id="inputFields">
                        <InputField type="email" name="email" id="email" placeholder="Email" value={email} onChange={setEmail} placeholder="Email" />
                        <InputField type="password" name="password" id="password" value={password} onChange={setPassword} placeholder="Password" />
                    </div>
                    <CheckBox className="white-background" label="Remember me" id="remember-me" />
                    <div>
                        <Button text="Sign in" id="sign-in-button"/>
                    </div>
                    <TextButton text="create an account" onClick={() => setModalContent("ResetPassword")} />
                </div>
            </div>
    );
}

export {SignIn};
