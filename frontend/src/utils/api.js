import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your API base URL
  timeout: 5000, // Set a timeout for requests (optional)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login page)
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
  verifyToken: () => api.get("/auth/verify"),
};

// Surge Pricing API calls
export const surgePricingAPI = {
  getSurgePricing: (latitude, longitude) =>
    api.post("/surge-pricing", {
      latitude,
      longitude,
    }),
  simulateSurgePricing: (simulationData) =>
    api.post("/surge-pricing/simulate", simulationData),
};

// Analytics API calls
export const analyticsAPI = {
  getAverageSurgeMultiplier: () => api.get("/analytics/average-multiplier"),
  getAverageSurgeMultiplierByArea: () =>
    api.get("/analytics/average-multiplier-by-area"),
  getSurgePricingFrequency: () => api.get("/analytics/surge-frequency"),
};

export default api;
