import "./Modal.css";
import React, { useEffect } from "react";
import { SignIn } from "../authModal/SignIn/SignIn.jsx";
import Register from "../authModal/Register/Register.jsx";
import RegistrationSuccess from "../authModal/RegistrationSuccess/RegistrationSuccess.jsx";
import TwoFactor from "../authModal/TwoFactor/TwoFactor.jsx";
import Success from "../authModal/Success/Success.jsx";
import ResetPassword from "../authModal/ResetPassword/ResetPassword.jsx";
import EmailPasswordSuccess from "../authModal/EmailPasswordSuccess/EmailPasswordSuccess.jsx";
import MakeYourOwnPizza from "../MakeYourOwnPizza/MakeYourOwnPizza.jsx";

import CloseButton from "../../ui/CloseButton/CloseButton.jsx";
import Button from "../../ui/Button/Button.jsx";

const Modal = React.forwardRef((props, ref) => {
  const [modalContent, setModalContent] = React.useState(props.window);
  const [modalKey, setModalKey] = React.useState(0);
  const { redirectPath } = props;

  useEffect(() => {
    if (props.window && ref.current) {
      setModalContent(props.window);
      document.body.style.overflow = "hidden";
      ref.current.showModal();
    }
  }, [props.window]);

  const onClose = () => {
    ref.current.close();
    document.body.style.overflow = "";
    props.setModalWindow(null);
    setModalContent(null);
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
      {modalContent === "TwoFactorSetup" && (
        <TwoFactor
          key={`twoFactorSetup-${modalKey}`}
          setModalContent={setModalContent}
          onClose={onClose}
          isLoading={props.isLoading2FA}
          error={props.twoFactorError}
          onCodeSubmit={props.on2FASetupSubmit || (() => {})}
        />
      )}
      {modalContent === "TwoFactorDisable" && (
        <TwoFactor
          key={`twoFactorDisable-${modalKey}`}
          setModalContent={setModalContent}
          onClose={onClose}
          isLoading={props.isLoading2FA}
          error={props.twoFactorError}
          onCodeSubmit={props.on2FADisableSubmit || (() => {})}
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
      {modalContent === "MakeYourOwnPizza" && (
        <MakeYourOwnPizza
          key={`makeYouOwnPizza-${modalKey}`}
          onClose={onClose}
        />
      )}
      {modalContent === "ChangeEmail" && (
        <div>
          <CloseButton onClick={onClose} />
          <h1>Change Email Address</h1>
          <p>A confirmation link will be sent to your current email.</p>
          <Button
            text="Send Link"
            onClick={async () => {
              try {
                const res = await fetch(
                  `${
                    import.meta.env.VITE_API_URL
                  }/api/auth/send-change-email-link`,
                  {
                    method: "POST",
                    credentials: "include",
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  alert("Change email link sent to your current email!");
                  onClose();
                } else {
                  alert(data.message || "Failed to send link");
                }
              } catch (err) {
                alert("Failed to send link");
              }
            }}
          />
        </div>
      )}
    </dialog>
  );
});

export { Modal };
