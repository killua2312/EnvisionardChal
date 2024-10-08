import OrderItem from "./OrderItem";

const OrderSidebar = ({ activeOrders, onOrderSelect, selectedOrderId }) => {
  return (
    <div className="order-sidebar">
      <h3>Active Orders</h3>
      <div className="order-list">
        {activeOrders.map((order) => (
          <OrderItem
            key={order.id}
            order={order}
            onSelect={onOrderSelect}
            isSelected={order.id === selectedOrderId}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderSidebar;
