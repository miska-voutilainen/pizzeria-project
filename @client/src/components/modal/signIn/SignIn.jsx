import "./SignIn.css";
import {useEffect, useRef} from "react";

const SignIn = () => {

    const dialogRef = useRef(null);

    useEffect(() => {
        dialogRef.current.showModal();  // <-- важно!
    }, []);

    return (
        <dialog ref={dialogRef}>
            <div>
                <div id="signInContent">
                <div id="signInTitle">
                    <h1>Sign in</h1>
                    <div>
                        <p>Or</p>
                        <a href="/register" className="textButton">create an account</a>
                    </div>
                </div>
                <div id="inputFields">
                    <input type="email" name="email" id="email" placeholder="Email" />
                    <input type="password" name="password" id="password" placeholder="Password" />
                </div>
                <input type="checkbox" name="rememberMe" id="rememberMe"/>
                <label htmlFor="rememberMe">Remember me</label>
                <div>
                    <button id="signInButton">Sign In</button>
                </div>
                <a href="/resetPassword" className="textButton">Forgot your password?</a>
                </div>
            </div>
        </dialog>
    );
}

export  {SignIn};