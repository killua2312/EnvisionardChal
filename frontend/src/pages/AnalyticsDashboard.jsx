import { useEffect, useState } from "react";
import { analyticsAPI } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AnalyticsDashboard = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [averageMultipliers, setAverageMultipliers] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const historicalResponse = await analyticsAPI.getHistoricalData();
        setHistoricalData(historicalResponse.data);

        const averageResponse = await analyticsAPI.getAverageMultipliers();
        setAverageMultipliers(averageResponse.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <div className="historical-data">
        <h3>Historical Surge Pricing Usage</h3>
        <LineChart width={600} height={300} data={historicalData}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="surgeMultiplier" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="average-multipliers">
        <h3>Average Surge Multipliers Across Different Times of the Day</h3>
        <LineChart width={600} height={300} data={averageMultipliers}>
          <XAxis dataKey="time" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageMultiplier" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
