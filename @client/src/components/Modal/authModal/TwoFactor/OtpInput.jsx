import "./OtpInput.css";
import {createRef} from "react";

export default function OtpInput({ value, onChange }) {
    const inputs = Array(4).fill(0);
    const refs = inputs.map(() => createRef());

    const handleChange = (e, index) => {
        const val = e.target.value;

        if (!/^[0-9]?$/.test(val)) return;

        const newValue = value.split("");
        newValue[index] = val;
        onChange(newValue.join(""));

        if (val && index < 3) refs[index + 1].current.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            refs[index - 1].current.focus();
        }
    };

    return (
        <div className="otp-wrapper">
            {inputs.map((_, index) => (
                <input
                    key={index}
                    ref={refs[index]}
                    maxLength={1}
                    className="otp-box"
                    value={value[index] || ""}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                />
            ))}
        </div>
    );
}