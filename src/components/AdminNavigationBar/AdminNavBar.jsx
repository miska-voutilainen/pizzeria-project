import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminNavBar.css";
import AdminNavLinkItem from "./AdminNavLinkItem";
import ViewUserDetailsModal from "../ViewUserDetailsModal/ViewUserDetailsModal";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import userIcon from "../../assets/images/user-icon.svg";
import signOutIcon from "../../assets/images/sign-out-icon.svg";
import usersIcon from "../../assets/images/users-icon.svg";
import productsIcon from "../../assets/images/products-icon.svg";
import ordersIcon from "../../assets/images/orders-icon.svg";
import couponsIcon from "../../assets/images/coupon-icon.svg";
import pizzawebLogo from "../../assets/images/pizzaweb-logo.svg";
import api from "../../api";

const AdminNavBar = () => {
  const [currentUser, setCurrentUser] = useState({
    username: "User",
    firstName: "User",
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/check")
      .then((res) => {
        if (res.data.authenticated && res.data.user) {
          const currentUsername = res.data.user.username;
          // Then get full user data including firstName
          api
            .get("/admin/users")
            .then((usersRes) => {
              const fullUserData = usersRes.data.find(
                (user) => user.username === currentUsername
              );
              if (fullUserData) {
                setCurrentUser(fullUserData);
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

  const handleViewProfile = () => {
    setShowDetailsModal(true);
  };

  const handleEditFromDetails = (user) => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const saveProfile = async (updatedData) => {
    if (currentUser) {
      try {
        // Handle address field - convert empty string to null for JSON column
        let addressValue = updatedData.address;
        if (!addressValue || addressValue.trim() === "") {
          addressValue = null; // Send null instead of empty string for JSON column
        }

        const response = await api.put(`/admin/users/${currentUser.userId}`, {
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          username: updatedData.username,
          email: updatedData.email,
          role: updatedData.role,
          accountStatus: updatedData.accountStatus,
          address: addressValue,
        });
        console.log("Save response:", response.data);

        // Update currentUser with new data before closing modal
        const updatedUser = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        setShowEditModal(false);

        return true;
      } catch (error) {
        console.error("Failed to save user profile:", error);
        alert(
          `Failed to save: ${error.response?.data?.error || error.message}`
        );
        return false;
      }
    }
    return false;
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
            <AdminNavLinkItem to="/users" icon={usersIcon} text="Käyttäjät" />
            <AdminNavLinkItem to="/orders" icon={ordersIcon} text="Tilaukset" />
            <AdminNavLinkItem
              to="/coupons"
              icon={couponsIcon}
              text="Kupongit"
            />
          </ul>
        </nav>
      </div>

      <div>
        <ul>
          <li>
            <button
              onClick={handleViewProfile}
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
              <img src={userIcon} alt="user icon" />
              Hey, {currentUser.firstName}
            </button>
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

      <ViewUserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={currentUser}
        onEdit={handleEditFromDetails}
      />

      <UserProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={currentUser}
        onSave={saveProfile}
      />
    </div>
  );
};

export default AdminNavBar;
