import "./Modal.css";
import React from "react";
import { SignIn } from "../authModal/SignIn/SignIn.jsx";
import Register from "../authModal/Register/Register.jsx";
import RegistrationSuccess from "../authModal/RegistrationSucsess/RegistrationSucsess.jsx";

const Modal = React.forwardRef((props, ref) => {
  const [modalContent, setModalContent] = React.useState("SignIn");
  const [modalKey, setModalKey] = React.useState(0);
  const { redirectPath } = props;

  const onClose = () => {
    ref.current.close();
    document.body.style.overflow = "";
    setModalContent("SignIn");
    // Force remount of child components by changing the key
    setModalKey((prev) => prev + 1);
  };

  return (
    <dialog ref={ref} className={modalContent}>
      {modalContent === "SignIn" && (
        <SignIn
          key={`signin-${modalKey}`}
          setModalContent={setModalContent}
          onClose={onClose}
          redirectPath={redirectPath}
        />
      )}
      {modalContent === "Register" && (
        <Register
          key={`register-${modalKey}`}
          setModalContent={setModalContent}
          onClose={onClose}
        />
      )}
      {modalContent === "RegistrationSuccess" && (
        <RegistrationSuccess key={`success-${modalKey}`} onClose={onClose} />
      )}
    </dialog>
  );
});

export { Modal };
