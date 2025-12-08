import { useEffect, useState } from "react";
import api from "../api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  SearchBox,
} from "../components";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = () => {
    api.get("/auth/orders").then((r) => {
      setOrders(r.data);
      setFilteredOrders(r.data);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const updateStatus = async (orderId, newStatus) => {
    await api.put(`/auth/orders/${orderId}`, { status: newStatus });
    loadOrders();
  };

  // Helper function to parse items JSON
  const parseItems = (itemsData) => {
    try {
      if (typeof itemsData === "string") {
        return JSON.parse(itemsData);
      } else if (Array.isArray(itemsData)) {
        return itemsData;
      }
      return [];
    } catch (error) {
      console.error("Error parsing items:", error);
      return [];
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return (
      new Date(dateString).toLocaleDateString("fi-FI") +
      ", " +
      new Date(dateString).toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "#333", marginBottom: 20 }}>
        Tilaukset ({filteredOrders.length})
      </h1>

      <div style={{ marginBottom: 20 }}>
        <SearchBox
          placeholder="Hae tilauksia..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader width="120px">
              Tilausnumero
            </TableCell>
            <TableCell isHeader width="150px">
              Päivämäärä
            </TableCell>
            <TableCell isHeader width="120px">
              Asiakas
            </TableCell>
            <TableCell isHeader>Tuotteet</TableCell>
            <TableCell isHeader width="100px">
              Summa
            </TableCell>
            <TableCell isHeader width="120px">
              Maksutapa
            </TableCell>
            <TableCell isHeader width="100px">
              Status
            </TableCell>
            <TableCell isHeader width="140px">
              Muuta Status
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell>
                <div style={{ fontWeight: "500" }}>#{order.orderId}</div>
              </TableCell>
              <TableCell>
                <div>{formatDate(order.created_at)}</div>
              </TableCell>
              <TableCell>
                <div style={{ fontWeight: "500" }}>{order.userId}</div>
                <small style={{ color: "#6c757d", fontSize: "11px" }}>
                  {order.shippingAddress
                    ? (() => {
                        try {
                          if (typeof order.shippingAddress === "string") {
                            const parsed = JSON.parse(order.shippingAddress);
                            return `${parsed.street}, ${parsed.city}`;
                          } else if (
                            typeof order.shippingAddress === "object"
                          ) {
                            return `${order.shippingAddress.street}, ${order.shippingAddress.city}`;
                          }
                          return order.shippingAddress.substring(0, 20) + "...";
                        } catch (error) {
                          return order.shippingAddress.substring(0, 20) + "...";
                        }
                      })()
                    : "Ei osoitetta"}
                </small>
              </TableCell>
              <TableCell>
                {parseItems(order.items)?.map((item, index) => (
                  <div
                    key={index}
                    style={{ fontSize: "13px", marginBottom: "2px" }}
                  >
                    {item.name} × {item.quantity}
                    <small style={{ color: "#6c757d" }}> ({item.price}€)</small>
                  </div>
                ))}
              </TableCell>
              <TableCell>
                <strong>{order.totalAmount}€</strong>
              </TableCell>
              <TableCell>
                <div style={{ fontSize: "12px", textTransform: "capitalize" }}>
                  {order.paymentMethod || "Ei määritelty"}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} type="order-status" />
              </TableCell>
              <TableCell>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.orderId, e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                >
                  <option value="pending">Odottaa</option>
                  <option value="confirmed">Vahvistettu</option>
                  <option value="preparing">Valmistetaan</option>
                  <option value="ready">Valmis</option>
                  <option value="delivered">Toimitettu</option>
                  <option value="cancelled">Peruutettu</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
