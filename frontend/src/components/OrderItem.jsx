const OrderItem = ({ order, onSelect, isSelected }) => {
  return (
    <div
      className={`order-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(order)}
      style={{
        cursor: "pointer",
        padding: "10px",
        backgroundColor: isSelected ? "#e0e0e0" : "transparent",
        marginBottom: "5px",
        borderRadius: "4px",
      }}
    >
      <p>Order ID: {order.id}</p>
    </div>
  );
};

export default OrderItem;
