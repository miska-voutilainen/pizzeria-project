import "./Modal.css";
import Button from "../../../ui/Button/Button.jsx";
import CheckBox from "../../../ui/CheckBox/CheckBox.jsx";
import React from "react";
import {SignIn} from "../SignIn/SignIn.jsx";
import Register from "../Register/Register.jsx";

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
        </dialog>
    );
});

export {Modal};
