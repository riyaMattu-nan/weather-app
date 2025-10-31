import React, { useState } from "react";
import { Search, Wind, Droplets, Sun, Gauge, Eye, CloudRain } from "lucide-react";

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
  5100: "Light Snow",
  8000: "Thunderstorm",
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=UTZ1qNJTQMxPvz2stg0p0QcbDB33KGMg`
      );
      if (!res.ok) throw new Error("Weather data unavailable");
      const data = await res.json();

      const current = data.timelines.hourly[0]; // richer data here
      setWeather(current);
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

        {!loading && weather && (
          <div className="mt-6 bg-white/30 rounded-xl p-4 text-white shadow-md space-y-2">
            <h3 className="text-lg font-semibold">
              {weatherCodeMap[weather.values.weatherCode] || "Unknown"}
            </h3>
            <p className="text-sm mb-4">
              {new Date(weather.time).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                🌡️ <span>Temp:</span> {weather.values.temperature}°C
              </div>
              <div className="flex items-center gap-2">
                🥵 <span>Feels Like:</span> {weather.values.temperatureApparent}°C
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={16} /> Humidity: {weather.values.humidity}%
              </div>
              <div className="flex items-center gap-2">
                <Wind size={16} /> Wind: {weather.values.windSpeed} m/s
              </div>
              <div className="flex items-center gap-2">
                <Gauge size={16} /> Pressure: {weather.values.pressureSurfaceLevel} hPa
              </div>
              <div className="flex items-center gap-2">
                <Sun size={16} /> UV Index: {weather.values.uvIndex}
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} /> Visibility: {weather.values.visibility} km
              </div>
              <div className="flex items-center gap-2">
                <CloudRain size={16} /> Rain Chance: {weather.values.precipitationProbability}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
