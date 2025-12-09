import "./SignIn.css";
import { useEffect, useRef } from "react";
import Button from "../../ui/Button/Button.jsx";
import CheckBox from "../../ui/CheckBox/CheckBox.jsx";

const SignIn = () => {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  return (
    <dialog ref={dialogRef}>
      <div>
        <div id="signInContent">
          <div id="signInTitle">
            <h1>Sign in</h1>
            <div>
              <p>Or</p>
              <a href="/register" className="textButton">
                create an account
              </a>
            </div>
          </div>
          <div id="inputFields">
            <input type="email" name="email" id="email" placeholder="Email" />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
            />
          </div>
          <CheckBox
            className="white-background"
            label="Remember me"
            id="remember-me"
          />
          <div>
            <Button />
          </div>
          <a href="/resetPassword" className="textButton">
            Forgot your password?
          </a>
        </div>
      </div>
    </dialog>
  );
};

export { SignIn };
