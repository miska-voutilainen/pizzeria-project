import { useEffect, useState } from "react";
import api from "../api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
} from "../components";

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
      <h1 style={{ color: "#333", marginBottom: 20 }}>
        Orders ({orders.length})
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader width="80px">
              ID
            </TableCell>
            <TableCell isHeader width="150px">
              Date
            </TableCell>
            <TableCell isHeader width="200px">
              Customer
            </TableCell>
            <TableCell isHeader>Items</TableCell>
            <TableCell isHeader width="80px">
              Total
            </TableCell>
            <TableCell isHeader width="100px">
              Status
            </TableCell>
            <TableCell isHeader width="140px">
              Change Status
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
                <br />
                <small style={{ color: "#6c757d" }}>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </small>
              </TableCell>
              <TableCell>
                <div style={{ fontWeight: "500" }}>{order.username}</div>
                <small style={{ color: "#6c757d" }}>{order.email}</small>
              </TableCell>
              <TableCell>
                {order.items?.map((item) => (
                  <div
                    key={item.slug}
                    style={{ fontSize: "13px", marginBottom: "2px" }}
                  >
                    {item.name} × {item.quantity}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                <strong>{order.total}€</strong>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} type="order-status" />
              </TableCell>
              <TableCell>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                >
                  <option value="new">New</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
