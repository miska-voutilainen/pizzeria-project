import React from "react";
import "./CheckBox.css";

const CheckBox = ({ className = "", label, id }) => {
    return (
        <div className={className}>
            <input
                type="checkbox"
                id={id}
                name={id}
                value={id}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};

export default CheckBox;