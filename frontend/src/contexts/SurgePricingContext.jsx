import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { surgePricingAPI } from "../utils/api";
import { useSocket } from "./SocketContext";

const SurgePricingContext = createContext();

export const SurgePricingProvider = ({ children }) => {
  const [surgePricingData, setSurgePricingData] = useState(null);
  const [simulatePricingData, setSimulatePricingData] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [proximityDrivers, setProximityDrivers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const socketContext = useSocket();

  const fetchSurgePricing = useCallback(async (latitude, longitude) => {
    console.log(
      `Fetching surge pricing for lat: ${latitude}, lon: ${longitude}`
    );
    try {
      await surgePricingAPI.getSurgePricing(latitude, longitude);
    } catch (error) {
      console.error("Error fetching surge pricing:", error);
    }
  }, []);

  const simulateSurgePricing = async (simulationData) => {
    try {
      await surgePricingAPI.simulateSurgePricing(simulationData);
      // The simulated data will be received via WebSocket
    } catch (error) {
      console.error("Error simulating surge pricing:", error);
    }
  };

  useEffect(() => {
    if (socketContext && socketContext.socket && socketContext.isConnected) {
      console.log("Socket is connected, setting up listeners");
      const { socket } = socketContext;

      socket.emit("requestInitialData");

      socket.on("initialDataUpdate", ({ activeOrders }) => {
        setActiveOrders(activeOrders);
        if (activeOrders.length > 0) {
          setSelectedOrder(activeOrders[0]);
          fetchSurgePricing(
            activeOrders[0].latitude,
            activeOrders[0].longitude
          );
        }
      });

      socket.on(
        "surgePricingUpdate",
        ({ surgePricingData, proximityDrivers }) => {
          setSurgePricingData(surgePricingData);
          setProximityDrivers(proximityDrivers);
        }
      );

      socket.on("simulateSurgePrice", (simulatePricingData) => {
        setSimulatePricingData(simulatePricingData);
      });

      socket.on("ordersUpdate", (updatedOrders) => {
        setActiveOrders(updatedOrders);
        if (surgePricingData) {
          fetchSurgePricing(
            surgePricingData.latitude,
            surgePricingData.longitude
          );
        }
      });

      socket.on("driversUpdate", () => {
        if (surgePricingData) {
          fetchSurgePricing(
            surgePricingData.latitude,
            surgePricingData.longitude
          );
        }
      });

      return () => {
        socket.off("initialDataUpdate");
        socket.off("surgePricingUpdate");
        socket.off("ordersUpdate");
        socket.off("driversUpdate");
        socket.off("simulateSurgePrice");
      };
    }
  }, [socketContext]);

  const selectOrder = useCallback(
    (order) => {
      setSelectedOrder(order);
      if (order) {
        fetchSurgePricing(order.latitude, order.longitude);
      }
    },
    [fetchSurgePricing]
  );

  return (
    <SurgePricingContext.Provider
      value={{
        surgePricingData,
        simulatePricingData,
        fetchSurgePricing,
        simulateSurgePricing,
        activeOrders,
        proximityDrivers,
        selectedOrder,
        selectOrder,
      }}
    >
      {children}
    </SurgePricingContext.Provider>
  );
};

export const useSurgePricing = () => useContext(SurgePricingContext);
