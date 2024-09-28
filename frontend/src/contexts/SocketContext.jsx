import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("Initializing socket connection");
      const newSocket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.auth = { token: localStorage.getItem("token") };

      newSocket.on("connect", () => {
        console.log("Socket connected successfully");
        setIsConnected(true);
        newSocket.emit("join", user.role);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error.message);
        setIsConnected(false);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Attempting to reconnect... (Attempt ${attemptNumber})`);
      });

      newSocket.on("reconnect_failed", () => {
        console.log("Failed to reconnect after maximum attempts");
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      };
    } else {
      console.log("User not logged in, no socket connection");
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Connection status:", isConnected);
  }, [isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
