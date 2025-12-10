import { useEffect, useState } from "react";
import api from "../../api";
import {
  ActionButton,
  StatusBadge,
  UserProfileModal,
  ViewUserDetailsModal,
  ViewUserOrdersModal,
  UserContextMenu,
} from "../../components";
import Search from "../../components/Search/Search";
import "./Users.css";
import threeDotsIcon from "../../assets/images/three-dots-icon.svg";
import emailYesIcon from "../../assets/images/email-yes-icon.svg";
import emailNoIcon from "../../assets/images/email-no-icon.svg";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenuUser, setContextMenuUser] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [viewDetailsUser, setViewDetailsUser] = useState(null);
  const [viewOrdersUser, setViewOrdersUser] = useState(null);

  const loadUsers = () => {
    api.get("/admin/users").then((r) => {
      setUsers(r.data);
      setFilteredUsers(r.data);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.toString().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const startEdit = (user) => {
    setEditingId(user.userId);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus || "active",
    });
  };

  const saveUser = async (userId) => {
    await api.put(`/admin/users/${userId}`, form);
    setEditingId(null);
    loadUsers();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const openContextMenu = (user, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = rect.left - menuWidth - 8;
    let y = rect.top;

    if (x < 8) x = rect.right + 8;
    if (x + menuWidth > viewportWidth - 8) x = viewportWidth - menuWidth - 8;
    if (y + 120 > viewportHeight - 8) y = rect.bottom - 120;
    if (y < 8) y = 8;

    setContextMenuPosition({ x, y });
    setContextMenuUser(user);
  };

  const closeContextMenu = () => {
    setContextMenuUser(null);
    setContextMenuPosition({ x: 0, y: 0 });
  };

  const openProfileModal = (user) => {
    setProfileModalUser(user);
    setContextMenuUser(null);
  };

  const closeProfileModal = () => {
    setProfileModalUser(null);
  };

  const closeViewDetailsModal = () => {
    setViewDetailsUser(null);
  };

  const handleEditFromDetails = (user) => {
    setViewDetailsUser(null);
    setProfileModalUser(user);
  };

  const closeViewOrdersModal = () => {
    setViewOrdersUser(null);
  };

  const handleViewDetails = () => {
    setViewDetailsUser(contextMenuUser);
    closeContextMenu();
  };

  const handleViewOrders = () => {
    setViewOrdersUser(contextMenuUser);
    closeContextMenu();
  };

  const saveProfile = async (updatedData) => {
    if (profileModalUser) {
      try {
        let addressValue = updatedData.address;
        if (!addressValue || addressValue.trim() === "") {
          addressValue = null;
        }
        const response = await api.put(
          `/admin/users/${profileModalUser.userId}`,
          {
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            username: updatedData.username,
            email: updatedData.email,
            role: updatedData.role,
            accountStatus: updatedData.accountStatus,
            address: addressValue,
          }
        );
        setProfileModalUser(null);
        loadUsers();
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
    <section id="users-page-container">
      <div>
        <h1 className="title">Käyttäjät ({filteredUsers.length})</h1>
      </div>
      <div className="users-page-search-container">
        <Search
          inputPlaceholder="hae käyttäjää (nimi, email tai ID)"
          name="productSearch"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="users-page-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Asiakas</th>
              <th>Sähköposti</th>
              <th>Viimeinen kirjautuminen</th>
              <th>Rooli</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.userId}>
                <td>#{u.userId}</td>
                <td>
                  <div>
                    <div>{u.username}</div>
                    <small className="users-table-username">
                      {u.firstName && u.lastName
                        ? `${u.firstName} ${u.lastName}`
                        : "Ei nimeä"}
                    </small>
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <span>{u.email}</span>
                    <div
                      style={{
                        position: "relative",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        const tooltip =
                          e.currentTarget.querySelector("[data-tooltip]");
                        if (tooltip) tooltip.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        const tooltip =
                          e.currentTarget.querySelector("[data-tooltip]");
                        if (tooltip) tooltip.style.opacity = "0";
                      }}
                    >
                      <img
                        src={u.emailVerified ? emailYesIcon : emailNoIcon}
                        alt={
                          u.emailVerified
                            ? "email verified"
                            : "email not verified"
                        }
                        style={{
                          width: "12px",
                          height: "12px",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.transform = "scale(1.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.transform = "scale(1)")
                        }
                      />
                      <div
                        data-tooltip
                        className="email-verified-tooltip"
                        style={{
                          position: "absolute",
                          top: "-38px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "#082109",
                          color: "#f3f4f6",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                          opacity: "0",
                          transition: "opacity 0.2s ease",
                          pointerEvents: "none",
                          zIndex: "1000",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-5px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "0",
                            height: "0",
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid #082109",
                          }}
                        />
                        {u.emailVerified
                          ? "Email verified"
                          : "Email not verified"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString("fi-FI") +
                      ", " +
                      new Date(u.lastLoginAt).toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Ei kirjauduttu"}
                </td>
                <td>{u.role}</td>
                <td>
                  {u.accountStatus === "active" ? "Aktiivinen" : "Deaktiivinen"}
                </td>
                <td className="users-page-table-button">
                  <button onClick={(e) => openContextMenu(u, e)}>
                    <img src={threeDotsIcon} alt="three dots icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserContextMenu
        isOpen={!!contextMenuUser}
        onClose={closeContextMenu}
        onViewDetails={handleViewDetails}
        onEditProfile={() => openProfileModal(contextMenuUser)}
        onViewOrders={handleViewOrders}
        position={contextMenuPosition}
      />
      <UserProfileModal
        isOpen={!!profileModalUser}
        onClose={closeProfileModal}
        user={profileModalUser}
        onSave={saveProfile}
      />
      <ViewUserDetailsModal
        isOpen={!!viewDetailsUser}
        onClose={closeViewDetailsModal}
        user={viewDetailsUser}
        onEdit={handleEditFromDetails}
      />
      <ViewUserOrdersModal
        isOpen={!!viewOrdersUser}
        onClose={closeViewOrdersModal}
        user={viewOrdersUser}
      />
    </section>
  );
}
