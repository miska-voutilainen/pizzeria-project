import { useEffect, useState } from "react";
import api from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const loadUsers = () => {
    api.get("/auth/users").then((r) => setUsers(r.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEdit = (user) => {
    setEditingId(user.userId);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      is2faEnabled: user.is2faEnabled ? "1" : "0",
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

  return (
    <div style={{ padding: 40 }}>
      <h1>All Users ({users.length})</h1>

      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        border="1"
        cellPadding="12"
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>2FA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>
                {editingId === u.userId ? (
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    style={{ width: 140, padding: 6 }}
                  />
                ) : (
                  u.username
                )}
              </td>
              <td>
                {editingId === u.userId ? (
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    style={{ width: 200, padding: 6 }}
                  />
                ) : (
                  u.email
                )}
              </td>
              <td>
                {editingId === u.userId ? (
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ padding: 6 }}
                  >
                    <option value="user">user</option>
                    <option value="administrator">administrator</option>
                  </select>
                ) : (
                  <strong
                    style={{
                      color: u.role === "administrator" ? "red" : "inherit",
                    }}
                  >
                    {u.role}
                  </strong>
                )}
              </td>
              <td>
                {editingId === u.userId ? (
                  <select
                    value={form.is2faEnabled}
                    onChange={(e) =>
                      setForm({ ...form, is2faEnabled: e.target.value })
                    }
                    style={{ padding: 6 }}
                  >
                    <option value="0">Off</option>
                    <option value="1">On</option>
                  </select>
                ) : u.is2faEnabled ? (
                  "On"
                ) : (
                  "Off"
                )}
              </td>
              <td>
                {editingId === u.userId ? (
                  <>
                    <button
                      onClick={() => saveUser(u.userId)}
                      style={{
                        background: "#28a745",
                        color: "white",
                        marginRight: 5,
                      }}
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(u)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
