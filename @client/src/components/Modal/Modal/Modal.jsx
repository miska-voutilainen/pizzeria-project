import "./Modal.css";
import React from "react";
import { SignIn } from "../authModal/SignIn/SignIn.jsx";
import Register from "../authModal/Register/Register.jsx";
import RegistrationSuccess from "../authModal/RegistrationSucsess/RegistrationSucsess.jsx";

const Modal = React.forwardRef((props, ref) => {
  const [modalContent, setModalContent] = React.useState("SignIn");
  const { redirectPath } = props;

  const onClose = () => {
    ref.current.close();
    document.body.style.overflow = "";
    setModalContent("SignIn");
  };

  return (
    <dialog ref={ref} className={modalContent}>
      {modalContent === "SignIn" && (
        <SignIn
          setModalContent={setModalContent}
          onClose={onClose}
          redirectPath={redirectPath}
        />
      )}
      {modalContent === "Register" && (
        <Register setModalContent={setModalContent} onClose={onClose} />
      )}
      {modalContent === "RegistrationSuccess" && (
        <RegistrationSuccess onClose={onClose} />
      )}
    </dialog>
  );
});

export { Modal };
