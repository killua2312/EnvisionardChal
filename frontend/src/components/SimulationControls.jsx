import { useState } from "react";

const SimulationControls = ({ onSimulate }) => {
  const [driversAvailable, setDriversAvailable] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [weatherCondition, setWeatherCondition] = useState("Clear");

  const handleSimulate = () => {
    onSimulate({
      driversInProximity: driversAvailable,
      ordersInProximity: activeOrders,
      weatherCondition,
    });
  };

  return (
    <div className="simulation-controls">
      <h3>Simulation Controls</h3>
      <div>
        <label>
          Drivers Available:
          <input
            type="number"
            value={driversAvailable}
            onChange={(e) => setDriversAvailable(Number(e.target.value))}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Active Orders:
          <input
            type="number"
            value={activeOrders}
            onChange={(e) => setActiveOrders(Number(e.target.value))}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Weather Condition:
          <select
            value={weatherCondition}
            onChange={(e) => setWeatherCondition(e.target.value)}
          >
            <option value="Clear">Clear</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Rain">Rain</option>
            <option value="Snow">Snow</option>
            <option value="Thunderstorm">Thunderstorm</option>
          </select>
        </label>
      </div>
      <button onClick={handleSimulate}>Simulate</button>
    </div>
  );
};

export default SimulationControls;
