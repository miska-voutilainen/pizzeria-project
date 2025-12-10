import "./Modal.css";
import React from "react";
import { SignIn } from "../authModal/SignIn/SignIn.jsx";
import Register from "../authModal/Register/Register.jsx";
import RegistrationSuccess from "../authModal/RegistrationSuccess/RegistrationSuccess.jsx";
import TwoFactor from "../authModal/TwoFactor/TwoFactor.jsx";
import Success from "../authModal/Success/Success.jsx";
import ResetPassword from "../authModal/ResetPassword/ResetPassword.jsx";
import EmailPasswordSuccess from "../authModal/EmailPasswordSuccess/EmailPasswordSuccess.jsx";

const Modal = React.forwardRef((props, ref) => {
  const [modalContent, setModalContent] = React.useState(props.window);
  const [modalKey, setModalKey] = React.useState(0);
  const { redirectPath } = props;

  const onClose = () => {
    ref.current.close();
    document.body.style.overflow = "";
    setModalContent(props.window);
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
      {modalContent === "TwoFactor" && (
        <TwoFactor
          key={`twoFactor-${modalKey}`}
          setModalContent={setModalContent}
          onClose={onClose}
        />
      )}
      {modalContent === "Success" && (
        <Success key={`success-${modalKey}`} onClose={onClose} />
      )}
      {modalContent === "ResetPassword" && (
        <ResetPassword
          key={`resetPassword-${modalKey}`}
          onClose={onClose}
          setModalContent={setModalContent}
        />
      )}
      {(modalContent === "ResetPasswordSuccess" ||
        modalContent === "EmailConfirmationSuccess") && (
        <EmailPasswordSuccess
          key={`emailPasswordSuccess-${modalKey}`}
          onClose={onClose}
          modalContent={modalContent}
        />
      )}
    </dialog>
  );
});

export { Modal };
