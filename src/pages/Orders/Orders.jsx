import { useEffect, useState } from "react";
import api from "../../api";
import { StatusBadge } from "../../components";
import Search from "../../components/Search/Search";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const [tempAddress, setTempAddress] = useState("");

  const loadOrders = async () => {
    try {
      const r = await api.get("/admin/orders");
      const usersRes = await api.get("/admin/users");
      const userMap = {};
      usersRes.data.forEach((user) => {
        userMap[user.userId] =
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username;
      });
      const ordersWithUserData = r.data.map((order) => ({
        ...order,
        customerName: userMap[order.userId] || "Guest",
      }));
      setOrders(ordersWithUserData);
      setFilteredOrders(ordersWithUserData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Fallback
      api.get("/admin/orders").then((r) => {
        setOrders(r.data);
        setFilteredOrders(r.data);
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        String(order.orderId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(order.userId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(order.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(order.status || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const updateStatus = async (orderId, newStatus) => {
    await api.put(`/orders/${orderId}`, { status: newStatus });
    loadOrders();
  };

  const startEditAddress = (orderId, currentAddress) => {
    setEditingAddress(orderId);
    let addressString = "";
    try {
      const addr =
        typeof currentAddress === "string"
          ? JSON.parse(currentAddress)
          : currentAddress;
      if (addr)
        addressString = `${addr.street || ""}, ${addr.city || ""}`.trim();
    } catch {
      addressString = currentAddress || "";
    }
    setTempAddress(addressString);
  };

  const saveAddress = async (orderId) => {
    try {
      const parts = tempAddress.split(",").map((s) => s.trim());
      const addressObj = {
        street: parts[0] || "",
        postalCode: parts[1] || "",
        city: parts[2] || parts[1] || "",
      };

      await api.put(`/orders/${orderId}`, { shippingAddress: addressObj });
      setEditingAddress(null);
      setTempAddress("");
      loadOrders();
    } catch (error) {
      console.error("Failed to update address:", error);
      alert(
        `Failed to update address: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const cancelEditAddress = () => {
    setEditingAddress(null);
    setTempAddress("");
  };

  const parseItems = (itemsData) => {
    try {
      return typeof itemsData === "string"
        ? JSON.parse(itemsData)
        : itemsData || [];
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return (
      d.toLocaleDateString("fi-FI") +
      ", " +
      d.toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <section id="users-page-container">
      <h1 className="title">Tilaukset ({filteredOrders.length})</h1>
      <div className="users-page-search-container">
        <Search
          inputPlaceholder="hae tilauksia (tilaus ID tai käyttäjä ID)"
          name="orderSearch"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="users-page-table-container">
        <table>
          <thead>
            <tr>
              <th>Tilausnumero</th>
              <th>Päivämäärä</th>
              <th>Asiakas</th>
              <th>Tuotteet</th>
              <th>Maksutapa</th>
              <th>Summa</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId}>
                <td>
                  <div>#{order.orderId}</div>
                </td>
                <td>
                  <div>{formatDate(order.created_at)}</div>
                </td>
                <td>
                  <div>
                    {order.customerName || "Unknown"}{" "}
                    {order.userId && `(${order.userId})`}
                  </div>
                  {editingAddress === order.orderId ? (
                    <div>
                      <input
                        type="text"
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        placeholder="Katuosoite, Kaupunki"
                      />
                      <div className="users-table-edit-address">
                        <button onClick={() => saveAddress(order.orderId)}>
                          Tallenna
                        </button>
                        <button onClick={cancelEditAddress}>Peruuta</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <small className="users-table-username">
                        {order.shippingAddress
                          ? (() => {
                              try {
                                const addr =
                                  typeof order.shippingAddress === "string"
                                    ? JSON.parse(order.shippingAddress)
                                    : order.shippingAddress;
                                return `${addr.street || ""}, ${
                                  addr.city || ""
                                }`;
                              } catch {
                                return order.shippingAddress;
                              }
                            })()
                          : "Ei osoitetta"}
                      </small>
                      {order.status !== "delivered" && (
                        <div className="users-table-edit-address">
                          <button
                            onClick={() =>
                              startEditAddress(
                                order.orderId,
                                order.shippingAddress
                              )
                            }
                          >
                            Muokkaa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {parseItems(order.items)?.map((item, index) => (
                    <div key={index}>
                      {item.name} × {item.quantity}
                      <small> ({item.price}€)</small>
                    </div>
                  ))}
                </td>
                <td>
                  <div>{order.paymentMethod || "Ei määritelty"}</div>
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
    </section>
  );
}
