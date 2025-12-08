import { useEffect, useState } from "react";
import api from "../api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton,
  StatusBadge,
  SearchBox,
  UserContextMenu,
  UserProfileModal,
  ViewUserDetailsModal,
  ViewUserOrdersModal,
} from "../components";

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
    api.get("/auth/users").then((r) => {
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
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    await api.put(`/auth/users/${userId}`, form);
    setEditingId(null);
    loadUsers();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const openContextMenu = (user, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 180; // Approximate width of the context menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position to the left of the button by default
    let x = rect.left - menuWidth - 8;
    let y = rect.top;

    // If menu would go off the left edge, position to the right instead
    if (x < 8) {
      x = rect.right + 8;
    }

    // If menu would go off the right edge, align with right edge of viewport
    if (x + menuWidth > viewportWidth - 8) {
      x = viewportWidth - menuWidth - 8;
    }

    // If menu would go off the bottom edge, position above the button
    if (y + 120 > viewportHeight - 8) {
      // 120px is approximate menu height
      y = rect.bottom - 120;
    }

    // Ensure menu doesn't go above viewport
    if (y < 8) {
      y = 8;
    }

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

  const closeViewOrdersModal = () => {
    setViewOrdersUser(null);
  };

  const saveProfile = async (updatedData) => {
    if (profileModalUser) {
      await api.put(`/auth/users/${profileModalUser.userId}`, {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        username: updatedData.username,
        email: updatedData.email,
        role: updatedData.role,
        accountStatus: updatedData.accountStatus,
        address: updatedData.address,
      });
      loadUsers();
    }
  };

  const handleViewDetails = () => {
    setViewDetailsUser(contextMenuUser);
    closeContextMenu();
  };

  const handleViewOrders = () => {
    setViewOrdersUser(contextMenuUser);
    closeContextMenu();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "#333", marginBottom: 20 }}>
        Käyttäjät ({filteredUsers.length})
      </h1>

      <SearchBox
        placeholder="Hae käyttäjä"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader>Id</TableCell>
            <TableCell isHeader>Asiakas</TableCell>
            <TableCell isHeader>Sähköposti</TableCell>
            <TableCell isHeader>Viimeinen kirjautuminen</TableCell>
            <TableCell isHeader>Rooli</TableCell>
            <TableCell isHeader>Status</TableCell>
            <TableCell isHeader width="120px"></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((u) => (
            <TableRow key={u.userId}>
              <TableCell>#{u.userId}</TableCell>
              <TableCell>
                {editingId === u.userId ? (
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    style={{
                      width: 140,
                      padding: "4px 8px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div>
                    <div style={{ fontWeight: "500" }}>{u.username}</div>
                    <small style={{ color: "#6c757d", fontSize: "11px" }}>
                      {u.firstName && u.lastName
                        ? `${u.firstName} ${u.lastName}`
                        : "Ei nimeä"}
                    </small>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {editingId === u.userId ? (
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    style={{
                      width: 200,
                      padding: "4px 8px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div>
                    <div>{u.email}</div>
                    {u.email.includes("@gmail.com") && (
                      <span style={{ color: "#28a745", fontSize: "12px" }}>
                        ✓
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString("fi-FI") +
                      ", " +
                      new Date(u.lastLoginAt).toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Ei kirjauduttu"}
                </div>
              </TableCell>
              <TableCell>
                {editingId === u.userId ? (
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <StatusBadge status={u.role} type="user-role" />
                )}
              </TableCell>
              <TableCell>
                {editingId === u.userId ? (
                  <select
                    value={form.accountStatus}
                    onChange={(e) =>
                      setForm({ ...form, accountStatus: e.target.value })
                    }
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="inactive">Deactiivinen</option>
                    <option value="active">Aktiivinen</option>
                  </select>
                ) : (
                  <StatusBadge
                    status={
                      u.accountStatus === "active"
                        ? "Aktiivinen"
                        : "Deactiivinen"
                    }
                    type="user-status"
                  />
                )}
              </TableCell>
              <TableCell>
                {editingId === u.userId ? (
                  <div>
                    <ActionButton
                      variant="success"
                      onClick={() => saveUser(u.userId)}
                    >
                      Tallenna
                    </ActionButton>
                    <ActionButton variant="outline" onClick={cancelEdit}>
                      Peruuta
                    </ActionButton>
                  </div>
                ) : (
                  <ActionButton onClick={(e) => openContextMenu(u, e)}>
                    Muokkaa
                  </ActionButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
      />

      <ViewUserOrdersModal
        isOpen={!!viewOrdersUser}
        onClose={closeViewOrdersModal}
        user={viewOrdersUser}
      />
    </div>
  );
}
