const OrderItem = ({ order, onSelect, isSelected }) => {
  return (
    <div
      className={`order-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(order)}
    >
      <p>Order ID: {order.id}</p>
    </div>
  );
};

export default OrderItem;
