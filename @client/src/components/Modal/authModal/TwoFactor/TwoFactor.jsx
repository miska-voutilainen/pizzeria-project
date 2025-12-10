import OtpInput from "./OtpInput.jsx";
import React, {useState} from "react";
import "./TwoFactor.css";
import Button from "../../../ui/Button/Button.jsx";
import CloseButton from "../../../ui/СloseButton/CloseButton.jsx";

const TwoFactor = ({onClose, setModalContent}) => {
    const [code, setCode] = useState("");
    const [style, setStyle] = useState("hidden");

    return (
        <div className="two-factor-container">
            <CloseButton onClick={onClose} />
            <h1 className="twofactor-title">The code was sent to your email</h1>
            <div id="two-factor-content">
            <p className="twofactor-subtitle">Enter the 4-digit code sent via your email</p>
                <div id="input-and-error">
                    <OtpInput value={code} onChange={setCode}/>
                    <p className="error-text" style={{ visibility: style }}>Wrong number!</p>
                </div>
                <Button id="two-factor-button" text="Confirm " onClick={() => {setModalContent("Success")}}>
                    Confirm
                </Button>
            </div>
        </div>
    );
};

export default TwoFactor;