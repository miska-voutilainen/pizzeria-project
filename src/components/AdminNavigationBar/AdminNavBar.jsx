import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminNavBar.css";
import AdminNavLinkItem from "./AdminNavLinkItem";
import userIcon from "../../assets/images/user-icon.svg";
import signOutIcon from "../../assets/images/sign-out-icon.svg";
import usersIcon from "../../assets/images/users-icon.svg";
import productsIcon from "../../assets/images/products-icon.svg";
import ordersIcon from "../../assets/images/orders-icon.svg";
import pizzawebLogo from "../../assets/images/pizzaweb-logo.svg";
import api from "../../api";

const AdminNavBar = () => {
  const [currentUser, setCurrentUser] = useState({
    username: "User",
    firstName: "User",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // First get basic auth info
    api
      .get("/auth/check")
      .then((res) => {
        if (res.data.authenticated && res.data.user) {
          const currentUsername = res.data.user.username;
          // Then get full user data including firstName
          api
            .get("/auth/users")
            .then((usersRes) => {
              const fullUserData = usersRes.data.find(
                (user) => user.username === currentUsername
              );
              if (fullUserData) {
                setCurrentUser({
                  username: fullUserData.username || "User",
                  firstName:
                    fullUserData.firstName || fullUserData.username || "User",
                  role: res.data.user.role,
                });
              } else {
                setCurrentUser({
                  username: res.data.user.username || "User",
                  firstName: res.data.user.username || "User",
                  role: res.data.user.role,
                });
              }
            })
            .catch((error) => {
              console.error("Failed to fetch full user data:", error);
              setCurrentUser({
                username: res.data.user.username || "User",
                firstName: res.data.user.username || "User",
                role: res.data.user.role,
              });
            });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
      });
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to login page even if logout request fails
      navigate("/login");
    }
  };

  return (
    <div id="navigation-sidebar">
      <div>
        <div className="logo-wrapper">
          <Link to="/">
            <img
              className="pizzaweb-logo"
              src={pizzawebLogo}
              alt="pizzaweb logo"
            />
          </Link>
        </div>

        <nav className="navbar-links">
          <ul>
            <AdminNavLinkItem
              to="/products"
              icon={productsIcon}
              text="Tuotteet"
              isRootPath={true}
            />
            <AdminNavLinkItem to="/users" icon={usersIcon} text="Käytäjät" />
            <AdminNavLinkItem to="/orders" icon={ordersIcon} text="Tilaukset" />
          </ul>
        </nav>
      </div>

      <div>
        <ul>
          <li>
            <Link to="/">
              <img src={userIcon} alt="user icon" />
              Hey, {currentUser.firstName}
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "17px",
                textDecoration: "none",
                color: "inherit",
                padding: "10px",
                borderRadius: "8px",
                transition: "opacity 0.3s ease",
                width: "100%",
                whiteSpace: "nowrap",
                fontSize: "inherit",
                fontFamily: "inherit",
                fontWeight: "inherit",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              <img src={signOutIcon} alt="sign out icon" />
              Kirjaudu ulos
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNavBar;
