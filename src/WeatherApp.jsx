import { useRef, useState } from "react";
import SearchBox from "./SearchBox.jsx";
import InfoBox from "./InfoBox.jsx";



const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

console.log(
  "OpenWeather API key loaded:",
  Boolean(import.meta.env.VITE_OPENWEATHER_API_KEY)
);

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "Weather request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestInProgress = useRef(false);

  async function getWeatherInfo(city) {
    if (requestInProgress.current) return;
    if (!city || !city.trim()) {
      setError("Please enter a city name");
      return;
    }
    if (!API_KEY) {
      setWeather(null);
      setForecast([]);
      setError("Add your OpenWeather API key to the .env file to get started.");
      return;
    }

    setLoading(true);
    requestInProgress.current = true;
    setError("");
    setWeather(null);
    setForecast([]);
    const query = city.trim();
    const url = `${API_URL}?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
    try {
      const current = await fetchJson(url);
      setWeather(current);
      try {
        const forecastUrl = `${FORECAST_URL}?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
        const future = await fetchJson(forecastUrl);
        setForecast(future.list || []);
      } catch {
        setForecast([]);
      }
    } catch (requestError) {
      if (requestError.status === 404) {
        setError("Location not found. Please check the city name and try again.");
      } else {
        setError("Unable to fetch weather information. Please try again.");
      }
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }

  return (
    <main className={`weather-app ${weather ? `weather-${weather.weather?.[0]?.main?.toLowerCase()}` : "weather-default"}`}>
      <div className="dashboard">
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true">☼</div>
          <div><p className="eyebrow">YOUR EVERYDAY FORECAST</p><h1>Weather App</h1></div>
        </header>
        <p className="subtitle">Real-time weather information for locations around the world</p>
        <SearchBox onSearch={getWeatherInfo} getWeatherInfo={getWeatherInfo} loading={loading} />
        {error && <div className="message error-message" role="alert">{error}</div>}
        {loading && <div className="message loading-message"><span className="loader" />Fetching weather...</div>}
        {weather && <InfoBox weather={weather} forecast={forecast} />}
        {!weather && !loading && !error && <section className="welcome-panel"><div className="welcome-icon">⛅</div><h2>Find your weather</h2><p>Search for a city to see current conditions and the five-day forecast.</p></section>}
        <footer className="footer">Weather at a glance <span>·</span> Powered by OpenWeather</footer>
      </div>
    </main>
  );
}
