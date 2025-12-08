import React, { useState, useEffect } from "react";
import Modal from "./Modal/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
} from "./index";
import api from "../api";
import "./ViewUserOrdersModal.css";

export default function ViewUserOrdersModal({ isOpen, onClose, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserOrders();
    }
  }, [isOpen, user]);

  const loadUserOrders = async () => {
    setLoading(true);
    try {
      console.log("Fetching all orders and filtering for user:", user.userId);
      const response = await api.get(`/auth/orders`);
      console.log("All orders response:", response.data);
      // Filter orders for this specific user
      const userOrders = response.data.filter(
        (order) => order.userId === user.userId
      );
      console.log("Filtered user orders:", userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse items JSON
  const parseItems = (itemsData) => {
    try {
      console.log("Parsing items:", itemsData, typeof itemsData);
      if (typeof itemsData === "string") {
        const parsed = JSON.parse(itemsData);
        console.log("Parsed items:", parsed);
        return parsed;
      } else if (Array.isArray(itemsData)) {
        console.log("Items already array:", itemsData);
        return itemsData;
      }
      return [];
    } catch (error) {
      console.error("Error parsing items:", error, itemsData);
      return [];
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "confirmed":
        return "#17a2b8";
      case "preparing":
        return "#fd7e14";
      case "ready":
        return "#28a745";
      case "delivered":
        return "#28a745";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  // Helper function to get Finnish status text
  const getFinnishStatus = (status) => {
    switch (status) {
      case "pending":
        return "Odottaa";
      case "confirmed":
        return "Vahvistettu";
      case "preparing":
        return "Valmistetaan";
      case "ready":
        return "Valmis";
      case "delivered":
        return "Toimitettu";
      case "cancelled":
        return "Peruutettu";
      default:
        return status;
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Tilaukset"
      className="view-user-orders-modal"
    >
      <div className="view-user-orders-header">
        <div className="view-user-orders-user-id">#{user.userId}</div>
        <div className="view-user-orders-user-name">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </div>
        <div className="view-user-orders-last-login">
          Viimeinen kirjautuminen:{" "}
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString("fi-FI") +
              ", " +
              new Date(user.lastLoginAt).toLocaleTimeString("fi-FI", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Ei tietoa"}
        </div>
      </div>

      <div className="view-user-orders-content">
        <h3 className="view-user-orders-title">Tilaukset ({orders.length})</h3>

        {loading ? (
          <div className="view-user-orders-loading">Ladataan tilauksia...</div>
        ) : orders.length === 0 ? (
          <div className="view-user-orders-empty">
            Käyttäjällä ei ole tilauksia.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader width="100px">
                  Luotu
                </TableCell>
                <TableCell isHeader>Tuotteet</TableCell>
                <TableCell isHeader width="80px">
                  Status
                </TableCell>
                <TableCell isHeader width="120px">
                  Maksutapa
                </TableCell>
                <TableCell isHeader width="80px">
                  Total
                </TableCell>
                <TableCell isHeader width="40px">
                  •••
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <div style={{ fontSize: "14px" }}>
                      {formatDate(order.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {parseItems(order.items)?.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-id">
                            #{Math.random().toString(36).substring(7)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                    >
                      {getFinnishStatus(order.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      style={{ fontSize: "14px", textTransform: "capitalize" }}
                    >
                      {order.paymentMethod === "card"
                        ? "Kortti"
                        : order.paymentMethod === "cash"
                        ? "Käteinen"
                        : order.paymentMethod === "mobilepay"
                        ? "MobilePay"
                        : order.paymentMethod || "Ei määritelty"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <strong>{order.totalAmount}€</strong>
                  </TableCell>
                  <TableCell>
                    <button
                      className="order-actions-button"
                      onClick={() => {
                        // Handle order actions - could open another modal
                        console.log("Order actions for:", order.orderId);
                      }}
                    >
                      ⋯
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Modal>
  );
}
