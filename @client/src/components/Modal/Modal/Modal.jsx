import "./Modal.css";
import React from "react";
import {SignIn} from "../authModal/SignIn/SignIn.jsx";
import Register from "../authModal/Register/Register.jsx";
import RegistrationSuccess from "../authModal/RegistrationSucsess/RegistrationSucsess.jsx";
import TwoFactor from "../authModal/TwoFactor/TwoFactor.jsx";

const Modal = React.forwardRef((props, ref) => {

    const [modalContent, setModalContent] = React.useState("SignIn");

    const onClose = () => {
        ref.current.close()
        document.body.style.overflow = "";
        setModalContent('SignIn')
    };

    return (
        <dialog ref={ref} className={modalContent}>
            {modalContent === "SignIn" && (<SignIn setModalContent={setModalContent} onClose={onClose}/>)}
            {modalContent === "Register" && (<Register setModalContent={setModalContent} onClose={onClose}/>)}
            {modalContent === "RegistrationSuccess" && (<RegistrationSuccess onClose={onClose}/>)}
            {modalContent === "TwoFactor" && (<TwoFactor onClose={onClose} setModalContent={setModalContent}/>)}
        </dialog>
    );
});

export {Modal};
