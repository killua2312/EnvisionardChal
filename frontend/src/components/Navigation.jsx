import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="top-nav">
      <ul>
        <li>
          <Link to="/">Order Dashboard</Link>
        </li>
        <li>
          <Link to="/simulate">Simulate Dashboard</Link>
        </li>
        {user.role === "admin" && (
          <li>
            <Link to="/analytics">Analytics Dashboard</Link>
          </li>
        )}
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
