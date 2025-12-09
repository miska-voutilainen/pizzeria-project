import "./StatusBadge.css";

export default function StatusBadge({
  status,
  type = "default",
  asSelect = false,
  onChange,
  ...props
}) {
  const getStatusIcon = () => {
    if (type === "order-status") {
      switch (status) {
        case "pending":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFE066"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
        case "confirmed":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#26e2ffff"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
        case "preparing":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6289ffff"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
        case "ready":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffa34eff"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
        case "delivered":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#05ED00"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" stroke="#05ED00" stroke-width="1.5"/></svg>'
            )
          );
        case "cancelled":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff253bff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" stroke="#ff253bff" stroke-width="1.5"/></svg>'
            )
          );
        case "new":
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9CA3AF"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
        default:
          return (
            "data:image/svg+xml;base64," +
            btoa(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9CA3AF"><circle cx="12" cy="12" r="6"/></svg>'
            )
          );
      }
    }
    return null;
  };

  const getStatusClass = () => {
    if (type === "user-role") {
      return status === "administrator" ? "administrator" : "user";
    }

    if (type === "order-status") {
      return status; // pending, confirmed, preparing, ready, delivered, cancelled, new
    }

    if (type === "user-status") {
      return status === "Aktiivinen" ? "active" : "inactive";
    }

    return "default";
  };

  if (asSelect) {
    return (
      <div className="status-badge-select-wrapper">
        <img src={getStatusIcon()} alt="" className="status-badge-icon" />
        <select
          value={status}
          onChange={onChange}
          className={`status-badge-select ${getStatusClass()}`}
          {...props}
          name="status-select"
        >
          <option value="pending">Odottaa</option>
          <option value="confirmed">Vahvistettu</option>
          <option value="preparing">Valmistetaan</option>
          <option value="ready">Valmis</option>
          <option value="delivered">Toimitettu</option>
          <option value="cancelled">Peruutettu</option>
        </select>
      </div>
    );
  }

  return (
    <span
      className={`status-badge ${getStatusClass()}`}
      style={props.style}
      {...props}
    >
      {status}
    </span>
  );
}
