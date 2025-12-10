import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { StatusBadge } from "../index";
import api from "../../api";
import "./ViewUserOrdersModal.css";
import UserDetailsModalHeader from "../UserDetailsModalHeader/UserDetailsModalHeader";

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
      const response = await api.get(`/orders`);
      // Filter orders for this specific user
      const userOrders = response.data.filter(
        (order) => Number(order.userId) === Number(user.userId)
      );
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      // Refresh the orders list for the modal
      await loadUserOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
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
      // title="Tilaukset"
      className="view-user-orders-modal"
    >
      <UserDetailsModalHeader user={user} formatDate={formatDate} />

      <hr className="view-user-details-section-divider" />

      <div className="view-user-orders-content">
        <h3 className="view-user-orders-title">Tilaukset ({orders.length})</h3>

        {loading ? (
          <div className="view-user-orders-loading">Ladataan tilauksia...</div>
        ) : orders.length === 0 ? (
          <div className="view-user-orders-empty">
            Käyttäjällä ei ole tilauksia.
          </div>
        ) : (
          <div className="users-page-table-container">
            <table>
              <thead>
                <tr>
                  <th>Luotu</th>
                  <th>Tuotteet</th>
                  <th>Maksutapa</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <div>{formatDate(order.created_at)}</div>
                    </td>
                    <td>
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
                    </td>

                    <td>
                      <div>
                        {order.paymentMethod === "card"
                          ? "Kortti"
                          : order.paymentMethod === "cash"
                          ? "Käteinen"
                          : order.paymentMethod === "mobilepay"
                          ? "MobilePay"
                          : order.paymentMethod || "Ei määritelty"}
                      </div>
                    </td>
                    <td>
                      <strong>{order.totalAmount}€</strong>
                    </td>
                    <td>
                      <StatusBadge
                        status={order.status}
                        type="order-status"
                        asSelect={true}
                        onChange={(e) =>
                          updateStatus(order.orderId, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
