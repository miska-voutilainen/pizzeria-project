import { Link } from "react-router-dom";
import "./AdminNavBar.css";
import AdminNavLinkItem from "./AdminNavLinkItem";
import userIcon from "../../assets/images/user-icon.svg";
import signOutIcon from "../../assets/images/sign-out-icon.svg";
import usersIcon from "../../assets/images/users-icon.svg";
import productsIcon from "../../assets/images/products-icon.svg";
import ordersIcon from "../../assets/images/orders-icon.svg";
import pizzawebLogo from "../../assets/images/pizzaweb-logo.svg";

const AdminNavBar = () => {
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
              User
            </Link>
          </li>
          <li>
            <Link to="/">
              <img src={signOutIcon} alt="sign out icon" />
              Kirjaudu ulos
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNavBar;
