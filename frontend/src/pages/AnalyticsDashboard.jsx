import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { analyticsAPI } from "../utils/api";

const AnalyticsDashboard = () => {
  const [surgePricingFrequency, setSurgePricingFrequency] = useState([]);
  const [averageMultiplier, setAverageMultiplier] = useState([]);
  const [averageMultiplierByArea, setAverageMultiplierByArea] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const frequencyResponse = await analyticsAPI.getSurgePricingFrequency(
        startDate,
        endDate
      );
      setSurgePricingFrequency(frequencyResponse.data);

      const avgMultiplierResponse =
        await analyticsAPI.getAverageSurgeMultiplier(startDate, endDate);
      setAverageMultiplier(avgMultiplierResponse.data);

      const avgMultiplierByAreaResponse =
        await analyticsAPI.getAverageSurgeMultiplierByArea(startDate, endDate);
      setAverageMultiplierByArea(avgMultiplierByAreaResponse.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>

      <div className="date-picker">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="chart">
        <h2>Surge Pricing Frequency</h2>
        <LineChart width={600} height={300} data={surgePricingFrequency}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </div>

      <div className="chart">
        <h2>Average Surge Multiplier</h2>
        <LineChart width={600} height={300} data={averageMultiplier}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageMultiplier" stroke="#82ca9d" />
        </LineChart>
      </div>

      <div className="table">
        <h2>Average Surge Multiplier by Area</h2>
        <table>
          <thead>
            <tr>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Average Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {averageMultiplierByArea.map((item, index) => (
              <tr key={index}>
                <td>{item.latitude}</td>
                <td>{item.longitude}</td>
                <td>{parseFloat(item.averageMultiplier).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
