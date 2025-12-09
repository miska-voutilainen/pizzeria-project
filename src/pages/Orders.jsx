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
import Search from "../components/Search/Search";

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
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "#333", marginBottom: 20 }}>
        Tilaukset ({filteredOrders.length})
      </h1>

      <div style={{ marginBottom: 20 }}>
        <Search
          inputPlaceholder="hae tilauksia (tilaus ID tai käyttäjä ID)"
          name="orderSearch"
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <div style={{ fontWeight: "500" }}>
                  {order.customerName || "Unknown"}{" "}
                  {order.userId && `(${order.userId})`}
                </div>
                {editingAddress === order.orderId ? (
                  <div style={{ marginTop: "4px" }}>
                    <input
                      type="text"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      style={{
                        fontSize: "11px",
                        padding: "2px 4px",
                        border: "1px solid #ced4da",
                        borderRadius: "3px",
                        width: "100%",
                        marginBottom: "2px",
                      }}
                      placeholder="Katuosoite, Kaupunki"
                    />
                    <div>
                      <button
                        onClick={() => saveAddress(order.orderId)}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          marginRight: "4px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        Tallenna
                      </button>
                      <button
                        onClick={cancelEditAddress}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        Peruuta
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <small style={{ color: "#6c757d", fontSize: "11px" }}>
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
                      <div>
                        <button
                          onClick={() =>
                            startEditAddress(
                              order.orderId,
                              order.shippingAddress
                            )
                          }
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            marginTop: "2px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          Muokkaa
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
