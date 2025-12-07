import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    api.get("/api/orders").then((r) => setOrders(r.data));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await api.put(`/api/orders/${orderId}`, { status: newStatus });
    loadOrders();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Orders ({orders.length})</h1>

      <table
        style={{ width: "100%", borderCollapse: "collapse" }}
        border="1"
        cellPadding="12"
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                {order.username}
                <br />
                <small>{order.email}</small>
              </td>
              <td>
                {order.items?.map((item) => (
                  <div key={item.slug}>
                    {item.name} × {item.quantity}
                  </div>
                ))}
              </td>
              <td>{order.total}€</td>
              <td>
                <strong
                  style={{
                    color:
                      order.status === "delivered"
                        ? "green"
                        : order.status === "ready"
                        ? "orange"
                        : order.status === "preparing"
                        ? "blue"
                        : "red",
                  }}
                >
                  {order.status}
                </strong>
              </td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{ padding: 8, fontSize: 14 }}
                >
                  <option value="new">New</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
