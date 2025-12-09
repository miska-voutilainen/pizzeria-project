import React, {useState, useEffect} from "react";
import {Link, useLocation} from "react-router-dom";
import "./Navbar.css";
import Button from "../ui/Button/Button";
import {SignIn} from "../authModal/SignIn/SignIn";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const signInRef = React.useRef(null);
    const openSignIn = () => signInRef.current.showModal ()
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    return (

        <>
            <SignIn ref={signInRef}/>
            <header className="navbar">
                <div className="navbar-container">
                    <div className="navbar-row-start">
                        <Link to="/">
                            <img src="./Pizzaweb-logo.svg" alt="Pizzaweb logo"/>
                        </Link>
                    </div>

                    {/* CENTER LINKS (DESKTOP) */}
                    <nav className="navbar-links">
                        <ul>
                            <li>
                                <Link to="/menu"> Menu </Link>
                            </li>
                            <li>
                                <Link to="/omapizza">Luo oma pizza</Link>
                            </li>
                            <li>
                                <Link to="/about">About us</Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="navbar-row-end">
                        <Button
                            text={"Sign innnnn"}
                            imageUrl={"./user-icon.svg"}
                            onClick={() => openSignIn()}
                        />
                        <Link to="/cart">
                            <img src="/SVGRepo_shopping_cart.svg" alt="Shopping cart icon"/>
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <div className="mobile-navbar-column-end ">
                        <Link to="/cart">
                            <img src="/SVGRepo_shopping_cart.svg" alt="Shopping cart icon"/>
                        </Link>
                        <button
                            className="menuButton"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? (
                                <img
                                    className="close-icon"
                                    src="./close-light.svg"
                                    alt="close button"
                                />
                            ) : (
                                <img src="./hamburger-menu.svg" alt="hamburger menu"/>
                            )}
                        </button>
                    </div>

                    {/* MOBILE MENU DROPDOWN */}
                    {menuOpen && (
                        <div className="mobileMenu">
                            <nav>
                                <ul>
                                    <li>
                                        <Link to="/menu"> Menu </Link>
                                    </li>
                                    <li>
                                        <Link to="/omapizza">Luo oma pizza</Link>
                                    </li>
                                    <li>
                                        <Link to="/about">About us</Link>
                                    </li>
                                </ul>
                            </nav>

                            <div className="mobile-menu-column-end">
                                <Button
                                    text={"Sign in"}
                                    imageUrl={"./user-icon.svg"}
                                    onClick={() => openSignIn()}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

export default Navbar;
