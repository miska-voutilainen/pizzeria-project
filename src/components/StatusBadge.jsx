export default function StatusBadge({
  status,
  type = "default",
  asSelect = false,
  onChange,
  ...props
}) {
  const getStatusColor = () => {
    if (type === "user-role") {
      return status === "administrator" ? "#dc3545" : "#6c757d";
    }

    if (type === "order-status") {
      switch (status) {
        case "delivered":
          return "#28a745";
        case "ready":
          return "#fd7e14";
        case "preparing":
          return "#007bff";
        case "confirmed":
          return "#17a2b8";
        case "pending":
          return "#ffc107";
        case "cancelled":
          return "#dc3545";
        case "new":
          return "#6c757d";
        default:
          return "#6c757d";
      }
    }

    if (type === "user-status") {
      return status === "Aktiivinen" ? "#28a745" : "#6c757d";
    }

    return "#6c757d";
  };

  if (asSelect) {
    return (
      <select
        value={status}
        onChange={onChange}
        style={{
          backgroundColor: getStatusColor(),
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "500",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          backgroundSize: "12px",
          paddingRight: "28px",
          ...props.style,
        }}
        {...props}
      >
        <option value="pending">Odottaa</option>
        <option value="confirmed">Vahvistettu</option>
        <option value="preparing">Valmistetaan</option>
        <option value="ready">Valmis</option>
        <option value="delivered">Toimitettu</option>
        <option value="cancelled">Peruutettu</option>
      </select>
    );
  }

  return (
    <span
      style={{
        color: getStatusColor(),
        ...props.style,
      }}
      {...props}
    >
      {status}
    </span>
  );
}
