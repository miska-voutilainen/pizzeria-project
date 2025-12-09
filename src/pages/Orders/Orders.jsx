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
      const r = await api.get("/orders");

      // Fetch all users to get their names
      const usersRes = await api.get("/auth/users");
      const userMap = {};
      usersRes.data.forEach((user) => {
        userMap[user.userId] = `${user.firstName} ${user.lastName}`;
      });

      // Enrich orders with customer names
      const ordersWithUserData = r.data.map((order) => ({
        ...order,
        customerName: userMap[order.userId] || order.userId,
      }));

      setOrders(ordersWithUserData);
      setFilteredOrders(ordersWithUserData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Fallback: just load orders without names
      api.get("/orders").then((r) => {
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
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const updateStatus = async (orderId, newStatus) => {
    await api.put(`/orders/${orderId}`, { status: newStatus });
    loadOrders();
  };

  const startEditAddress = (orderId, currentAddress) => {
    setEditingAddress(orderId);
    // Parse current address to string format
    let addressString = "";
    try {
      if (typeof currentAddress === "string") {
        const parsed = JSON.parse(currentAddress);
        addressString = `${parsed.street}, ${parsed.city}`;
      } else if (typeof currentAddress === "object" && currentAddress) {
        addressString = `${currentAddress.street}, ${currentAddress.city}`;
      } else {
        addressString = currentAddress || "";
      }
    } catch (error) {
      addressString = currentAddress || "";
    }
    setTempAddress(addressString);
  };

  const saveAddress = async (orderId) => {
    try {
      console.log("Attempting to update address for order:", orderId);
      console.log("New address string:", tempAddress);

      // Parse the address string back to JSON format expected by database
      // Expected format: "Street, PostalCode City" or "Street, City"
      const addressParts = tempAddress.split(", ");
      let addressObj = {
        street: addressParts[0] || "",
        city: "",
        postalCode: "",
      };

      if (addressParts.length >= 2) {
        const cityPart = addressParts[1];
        // Try to extract postal code if it exists (numbers at start)
        const postalCodeMatch = cityPart.match(/^(\d+)\s+(.+)$/);
        if (postalCodeMatch) {
          addressObj.postalCode = postalCodeMatch[1];
          addressObj.city = postalCodeMatch[2];
        } else {
          addressObj.city = cityPart;
        }
      }

      console.log("Formatted address object:", addressObj);

      const response = await api.put(`/orders/${orderId}`, {
        shippingAddress: JSON.stringify(addressObj),
      });

      console.log("Update response:", response.data);
      setEditingAddress(null);
      setTempAddress("");
      loadOrders();
    } catch (error) {
      console.error("Failed to update address:", error);
      console.error("Error response:", error.response?.data);
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
                                if (typeof order.shippingAddress === "string") {
                                  const parsed = JSON.parse(
                                    order.shippingAddress
                                  );
                                  return `${parsed.street}, ${parsed.city}`;
                                } else if (
                                  typeof order.shippingAddress === "object"
                                ) {
                                  return `${order.shippingAddress.street}, ${order.shippingAddress.city}`;
                                }
                                return (
                                  order.shippingAddress.substring(0, 20) + "..."
                                );
                              } catch (error) {
                                return (
                                  order.shippingAddress.substring(0, 20) + "..."
                                );
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
