import React, { useState } from "react";

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
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=UTZ1qNJTQMxPvz2stg0p0QcbDB33KGMg`
      );
      if (!response.ok) throw new Error("Unable to fetch weather data");
      const data = await response.json();
      const first = data.timelines.minutely[0];
      setWeather(first);
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(latitude, longitude);
      },
      () => setError("Unable to get your location.")
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-200 to-blue-500 p-6 font-[Poppins]">
      <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-2xl p-6 text-center w-80">
        <h2 className="text-2xl font-semibold text-white mb-4">🌤️ Weather App</h2>

        <button
          onClick={handleGetWeather}
          className="bg-white text-blue-700 px-4 py-2 rounded-xl font-medium shadow hover:bg-blue-50 transition-all"
        >
          Detect My Weather
        </button>

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
