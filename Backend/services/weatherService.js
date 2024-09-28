const axios = require("axios");
const { weatherUtils } = require("../utils/redisModeUtils");
const geolib = require("geolib");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_RADIUS_KM = 5;

const weatherService = {
  getCurrentWeather: async (latitude, longitude) => {
    try {
      // Check cache first
      const cachedWeather = await weatherService.getNearbyWeatherFromCache(
        latitude,
        longitude
      );
      if (cachedWeather) {
        return cachedWeather;
      }

      // If not in cache, fetch from API
      const options = {
        method: "GET",
        url: `https://open-weather13.p.rapidapi.com/city/latlon/${latitude}/${longitude}`,
        headers: {
          "x-rapidapi-key": OPENWEATHER_API_KEY,
          "x-rapidapi-host": "open-weather13.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);

      const weatherData = {
        condition: response.data.weather[0].main,
        temperature: response.data.main.temp,
        latitude,
        longitude,
      };

      // Cache the result
      await weatherService.cacheWeatherData(weatherData);

      return weatherData;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw new Error("Failed to fetch weather data");
    }
  },

  getNearbyWeatherFromCache: async (latitude, longitude) => {
    const cachedWeatherKeys = await weatherUtils.getAllKeys();

    for (const key of cachedWeatherKeys) {
      const [cachedLat, cachedLon] = key.split(":").slice(-2);
      const distance = geolib.getDistance(
        { latitude, longitude },
        { latitude: cachedLat, longitude: cachedLon }
      );

      if (distance <= CACHE_RADIUS_KM * 1000) {
        // Convert km to meters
        const cachedWeather = await weatherUtils.get(cachedLat, cachedLon);
        if (cachedWeather) {
          return JSON.parse(cachedWeather);
        }
      }
    }

    return null;
  },

  cacheWeatherData: async (weatherData) => {
    const { latitude, longitude } = weatherData;
    await weatherUtils.cache(latitude, longitude, JSON.stringify(weatherData));
  },

  getWeatherImpact: (condition) => {
    const impactMap = {
      // Clear conditions
      Clear: 1.0,
      Sunny: 1.0,

      // Cloudy conditions
      Clouds: 1.1,
      Overcast: 1.1,
      Haze: 1.1,
      Mist: 1.2,
      Fog: 1.3,

      // Rain conditions
      Drizzle: 1.2,
      Rain: 1.3,
      Shower: 1.3,
      "Light Rain": 1.2,
      "Heavy Rain": 1.4,

      // Snow conditions
      Snow: 1.5,
      Sleet: 1.5,
      "Light Snow": 1.4,
      "Heavy Snow": 1.6,
      Blizzard: 1.7,

      // Thunderstorm conditions
      Thunderstorm: 1.7,
      Thunder: 1.6,
      Lightning: 1.6,

      // Extreme conditions
      Tornado: 2.0,
      Hurricane: 2.0,
      Cyclone: 2.0,
      "Tropical Storm": 1.9,

      // Dust and sand conditions
      Dust: 1.4,
      Sand: 1.4,
      "Dust Storm": 1.6,
      Sandstorm: 1.6,

      // Other conditions
      Smoke: 1.3,
      Ash: 1.5,
      Squall: 1.5,
    };

    return impactMap[condition] || 1;
  },
};

module.exports = weatherService;
