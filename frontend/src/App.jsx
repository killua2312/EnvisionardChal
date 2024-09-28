import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SurgePricingProvider } from "./contexts/SurgePricingContext";
import { SocketProvider } from "./contexts/SocketContext";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OrderDashboard from "./pages/OrderDashboard";
import SimulateDashboard from "./pages/SimulateDashboard";
// import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SurgePricingProvider>
          <Router>
            <Navigation />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <PrivateRoute allowedRoles={["admin", "manager"]}>
                    <OrderDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/simulate"
                element={
                  <PrivateRoute allowedRoles={["admin", "manager"]}>
                    <SimulateDashboard />
                  </PrivateRoute>
                }
              />
              {/* <Route
                path="/analytics"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AnalyticsDashboard />
                  </PrivateRoute>
                }
              /> */}
            </Routes>
          </Router>
        </SurgePricingProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
