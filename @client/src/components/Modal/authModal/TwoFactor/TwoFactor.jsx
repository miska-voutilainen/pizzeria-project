import OtpInput from "./OtpInput.jsx";
import { useState } from "react";
import "./TwoFactor.css";
import Button from "../../../ui/Button/Button.jsx";

const TwoFactor = ({ onClose, setModalContent }) => {
    const [code, setCode] = useState("");

    return (
        <div className="two-factor">
            <h1 className="twofactor-title">The code was sent to your email</h1>
            <p className="twofactor-subtitle">Enter the 4-digit code</p>

            <OtpInput value={code} onChange={setCode} />

            <p className="error-text">Wrong number!</p>

            <Button id="two-factor-button" text="Confirm " onClick={() => console.log(code)}>
                Confirm
            </Button>
        </div>
    );
};

export default TwoFactor;