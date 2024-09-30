import { useEffect } from "react";
import { useSurgePricing } from "../contexts/SurgePricingContext";
import CurrentDeliveryFee from "../components/CurrentDeliveryFee";
import DemandLevel from "../components/DemandLevel";
import WeatherCondition from "../components/WeatherCondition";
import DriverMap from "../components/DriverMap";
import OrderSidebar from "../components/OrderSidebar";

const OrderDashboard = () => {
  const {
    surgePricingData,
    activeOrders,
    proximityDrivers,
    selectedOrder,
    selectOrder,
  } = useSurgePricing();

  useEffect(() => {
    if (activeOrders.length > 0 && !selectedOrder) {
      selectOrder(activeOrders[0]);
    }
  }, [activeOrders, selectedOrder, selectOrder, proximityDrivers]);

  return (
    <div className="dashboard" style={{ display: "flex" }}>
      <OrderSidebar
        activeOrders={activeOrders}
        onOrderSelect={selectOrder}
        selectedOrderId={selectedOrder?.id}
      />
      <div className="dashboard-content" style={{ flex: 1 }}>
        <h2>Order Dashboard</h2>
        {selectedOrder && surgePricingData && (
          <>
            <CurrentDeliveryFee
              totalFee={surgePricingData.total_fee}
              surgeMultiplier={surgePricingData.surge_multiplier}
            />
            <DemandLevel demandLevel={surgePricingData.demand_level} />
            <WeatherCondition
              weatherCondition={surgePricingData.weather_condition}
            />
            <DriverMap
              drivers={proximityDrivers}
              customerLocation={{
                latitude: Number(selectedOrder.latitude),
                longitude: Number(selectedOrder.longitude),
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
