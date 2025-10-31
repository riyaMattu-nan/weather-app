import React, { useState } from "react";
import { Search } from "lucide-react"; // magnifying glass icon from lucide-react

const weatherCodeMap = {
  1000: "Clear",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  1001: "Cloudy",
  2000: "Fog",
  2100: "Light Fog",
  4000: "Drizzle",
  4001: "Rain",
  4200: "Light Rain",
  4201: "Heavy Rain",
  5000: "Snow",
  5001: "Flurries",
  5100: "Light Snow",
  5101: "Heavy Snow",
  6000: "Freezing Drizzle",
  6001: "Freezing Rain",
  6200: "Light Freezing Rain",
  6201: "Heavy Freezing Rain",
  7000: "Ice Pellets",
  7101: "Heavy Ice Pellets",
  7102: "Light Ice Pellets",
  8000: "Thunderstorm",
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch coordinates for city
  const fetchCoordinates = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const geoRes = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          city
        )}&key=7119d87c5cd54f0d91705f6f3802e542`
      );
      const geoData = await geoRes.json();
      if (!geoData.results.length) throw new Error("City not found");
      const { lat, lng } = geoData.results[0].geometry;
      fetchWeather(lat, lng);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  // Fetch weather using Tomorrow.io
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=UTZ1qNJTQMxPvz2stg0p0QcbDB33KGMg`
      );
      if (!response.ok) throw new Error("Unable to fetch weather data");
      const data = await response.json();
      const first = data.timelines.minutely[0];
      setWeather(first);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-200 to-blue-500 p-6 font-[Poppins]">
      <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-2xl p-6 text-center w-96">
        <h2 className="text-2xl font-semibold text-white mb-6">🌤️ Weather App</h2>

        {/* Search Bar */}
        <div className="flex items-center bg-white/30 rounded-xl overflow-hidden shadow-inner mb-4">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-grow bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none"
          />
          <button
            onClick={fetchCoordinates}
            className="bg-white/40 hover:bg-white/60 transition-all p-2 rounded-r-xl"
          >
            <Search className="text-blue-800 w-5 h-5" />
          </button>
        </div>

        {loading && <p className="text-white mt-4">Fetching weather...</p>}
        {error && <p className="text-red-200 mt-4">{error}</p>}

        {weather && (
          <div className="mt-6 bg-white/30 rounded-xl p-4 text-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              {new Date(weather.time).toLocaleTimeString()}
            </h3>
            <p>🌡️ Temperature: {weather.values.temperature} °C</p>
            <p>💧 Humidity: {weather.values.humidity} %</p>
            <p>💨 Wind Speed: {weather.values.windSpeed} m/s</p>
            <p>☁️ Condition: {weatherCodeMap[weather.values.weatherCode] || "Unknown"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
