import React, { useState, useRef, useEffect } from "react";
import { Search, Globe, Wind, Droplets, Sun, Gauge, CloudRain } from "lucide-react";
import Lottie from "lottie-react";
import GlobeGL from "react-globe.gl";
import * as THREE from "three";


import sunnyAnim from "./lotties/sunny.json";
import cloudyAnim from "./lotties/cloudy.json";
import rainAnim from "./lotties/rainy.json";
import snowAnim from "./lotties/snowy.json";
import thunderAnim from "./lotties/thunder.json";

const weatherCodeMap = {
  1000: "Clear",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  1001: "Cloudy",
  4000: "Drizzle",
  4001: "Rain",
  4200: "Light Rain",
  4201: "Heavy Rain",
  5000: "Snow",
  5100: "Light Snow",
  8000: "Thunderstorm",
};

const weatherAnimationMap = {
  Clear: sunnyAnim,
  "Mostly Clear": sunnyAnim,
  "Partly Cloudy": cloudyAnim,
  Cloudy: cloudyAnim,
  Drizzle: rainAnim,
  Rain: rainAnim,
  "Light Rain": rainAnim,
  "Heavy Rain": rainAnim,
  Snow: snowAnim,
  "Light Snow": snowAnim,
  Thunderstorm: thunderAnim,
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGlobe, setShowGlobe] = useState(false);
  const [markers, setMarkers] = useState([]);
  const globeRef = useRef();

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
      fetchWeather(lat, lng, city);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const fetchWeather = async (lat, lon, cityName = "Selected Location") => {
    try {
      const res = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=UTZ1qNJTQMxPvz2stg0p0QcbDB33KGMg`
      );
      if (!res.ok) throw new Error("Weather data unavailable");
      const data = await res.json();
      const current = data.timelines.hourly[0];

      setWeather(current);
      setMarkers([
        {
          lat,
          lng: lon,
          city: cityName,
          temp: current.values.temperature,
          condition: weatherCodeMap[current.values.weatherCode] || "Clear",
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowGlobe(false); // return to dashboard automatically
    }
  };

  const handleMapClick = async ({ lat, lng }) => {
    fetchWeather(lat, lng);
  };

  const condition = weatherCodeMap[weather?.values?.weatherCode] || "Clear";
  const animationData = weatherAnimationMap[condition] || sunnyAnim;

  useEffect(() => {
  if (!showGlobe || !globeRef.current) return;

  const globe = globeRef.current;

  // center view
  try {
    globe.pointOfView({ lat: 20, lng: 80, altitude: 2 }, 1000);
  } catch (e) {
    /* ignore if not available immediately */
  }

  // controls: enable auto-rotate and pause on user interaction
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;

  const stopRotation = () => (controls.autoRotate = false);
  const resumeRotation = () => (controls.autoRotate = true);

  // pause on user interaction (drag start), resume a few seconds after interaction ends
  controls.addEventListener("start", stopRotation);
  controls.addEventListener("end", () => {
    // resume after 6s of inactivity
    setTimeout(() => {
      // only resume if user hasn't interacted again
      if (!controls.userIsInteracting) resumeRotation();
    }, 6000);
  });

  // Add lights to the scene (sunlight + ambient)
  // globe.scene() should return the THREE.Scene (guarded)
  let scene;
  try {
    scene = globe.scene();
  } catch (err) {
    // fallback: try globe.renderer()?.scene or just attach to window.scene
    scene = globe.scene ? globe.scene() : null;
  }

  let sunLight, ambientLight;
  if (scene) {
    sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = false;
    scene.add(sunLight);

    ambientLight = new THREE.AmbientLight(0x666666, 0.8);
    scene.add(ambientLight);
  }

  // cleanup when effect re-runs / unmounts
  return () => {
    try {
      controls.removeEventListener("start", stopRotation);
      controls.removeEventListener("end", resumeRotation);
    } catch (e) {}

    if (scene) {
      if (sunLight) scene.remove(sunLight);
      if (ambientLight) scene.remove(ambientLight);
    }
  };
}, [showGlobe]);



  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-[Poppins]">
      {!showGlobe && (
        <>
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-80"
          />

          <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-2xl p-6 text-center w-96">
            <h2 className="text-2xl font-semibold text-white mb-6">🌍 Weather App</h2>

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

            <button
              onClick={() => setShowGlobe(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all w-full"
            >
              <Globe size={18} /> Select on Map
            </button>

            {loading && <p className="text-white mt-4">Fetching weather...</p>}
            {error && <p className="text-red-200 mt-4">{error}</p>}

            {weather && (
              <div className="mt-6 bg-white/30 rounded-xl p-4 text-white shadow-md space-y-2">
                <h3 className="text-lg font-semibold">{condition}</h3>
                <p className="text-sm mb-4">{new Date(weather.time).toLocaleString()}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    🌡️ Temp: {weather.values.temperature}°C
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
                    <Sun size={16} /> UV: {weather.values.uvIndex}
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain size={16} /> Rain: {weather.values.precipitationProbability}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showGlobe && (
        <div className="absolute inset-0 bg-black">
          <GlobeGL
  ref={globeRef}
  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
  backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
  atmosphereColor="lightskyblue"
  atmosphereAltitude={0.25}
  onGlobeClick={({ lat, lng }) => handleMapClick({ lat, lng })}
  pointsData={markers}
  pointAltitude={0.02}
  pointColor={() => "orange"}
  pointRadius={0.15}
  labelLat={(d) => d.lat}
  labelLng={(d) => d.lng}
  labelText={(d) => `${d.city}\n${d.temp}°C\n${d.condition}`}
  labelSize={1.5}
  labelColor={() => "rgba(255,255,255,0.9)"}
/>


          <button
            onClick={() => setShowGlobe(false)}
            className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            Exit Map
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
