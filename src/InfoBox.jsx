import Card from "@mui/material/Card";

const weatherIcon = (main = "") => ({ Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Smoke: "🌫️", Haze: "🌫️", Dust: "🌫️", Fog: "🌫️", Sand: "🌫️", Ash: "🌫️", Squall: "💨", Tornado: "🌪️" }[main] || "🌤️");

function clock(unixSeconds, offsetSeconds) {
  if (!unixSeconds) return null;
  return new Date((unixSeconds + offsetSeconds) * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function makeForecast(items, offset) {
  const grouped = new Map();
  items.forEach((item) => {
    const local = new Date((item.dt + offset) * 1000);
    const key = local.toISOString().slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({ item, local });
  });
  return [...grouped.entries()].slice(0, 5).map(([key, entries]) => {
    const representative = entries.reduce((best, entry) => Math.abs(entry.local.getUTCHours() - 12) < Math.abs(best.local.getUTCHours() - 12) ? entry : best);
    return { key, day: new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }), date: new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), min: Math.min(...entries.map(({ item }) => item.main.temp_min)), max: Math.max(...entries.map(({ item }) => item.main.temp_max)), weather: representative.item.weather?.[0] };
  });
}

export default function InfoBox({ weather, forecast }) {
  const condition = weather.weather?.[0] || {};
  const offset = weather.timezone || 0;
  const details = [
    ["Feels like", weather.main?.feels_like != null ? `${Math.round(weather.main.feels_like)}°` : null, "🌡️"],
    ["Humidity", weather.main?.humidity != null ? `${weather.main.humidity}%` : null, "💧"],
    ["Wind speed", weather.wind?.speed != null ? `${(weather.wind.speed * 3.6).toFixed(1)} km/h` : null, "💨"],
    ["Wind direction", weather.wind?.deg != null ? `${weather.wind.deg}°` : null, "🧭"],
    ["Pressure", weather.main?.pressure != null ? `${weather.main.pressure} hPa` : null, "◉"],
    ["Visibility", weather.visibility != null ? `${(weather.visibility / 1000).toFixed(1)} km` : null, "◉"],
    ["Cloudiness", weather.clouds?.all != null ? `${weather.clouds.all}%` : null, "☁️"],
    ["Sunrise", clock(weather.sys?.sunrise, offset), "🌅"],
    ["Sunset", clock(weather.sys?.sunset, offset), "🌇"],
  ].filter(([, value]) => value != null);
  const days = makeForecast(forecast || [], offset);
  const flag = weather.sys?.country ? String.fromCodePoint(...weather.sys.country.toUpperCase().split("").map((letter) => 127397 + letter.charCodeAt(0))) : "";

  return (
    <div className="weather-content">
      <Card elevation={0} className="current-card">
        <div className="current-top">
          <div>
            <p className="eyebrow">CURRENT WEATHER</p>
            <h2>{weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""} <span className="flag">{flag}</span></h2>
            <p className="condition-text">{condition.description || "Weather conditions"}</p>
          </div>
          <div className="hero-icon" aria-label={condition.description}>{weatherIcon(condition.main)}</div>
        </div>
        <div className="temperature-row">
          <span className="temperature">{weather.main?.temp != null ? Math.round(weather.main.temp) : "—"}°</span>
          <span className="unit">C</span>
          <span className="high-low">H {weather.main?.temp_max != null ? Math.round(weather.main.temp_max) : "—"}° <span>·</span> L {weather.main?.temp_min != null ? Math.round(weather.main.temp_min) : "—"}°</span>
        </div>
        <div className="location-strip">
          <span>⌖ {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}</span>
          <span>Latitude {weather.coord?.lat != null ? weather.coord.lat.toFixed(2) : "—"}°</span>
          <span>Longitude {weather.coord?.lon != null ? weather.coord.lon.toFixed(2) : "—"}°</span>
          <span>UTC{offset >= 0 ? "+" : "−"}{Math.floor(Math.abs(offset) / 3600)}:{String(Math.floor((Math.abs(offset) % 3600) / 60)).padStart(2, "0")}</span>
        </div>
      </Card>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AT A GLANCE</p>
            <h2>Weather details</h2>
          </div>
        </div>
        <div className="details-grid">
          {details.map(([label, value, icon]) => (
            <article className="detail-card" key={label}>
              <span className="detail-icon">{icon}</span>
              <span className="detail-label">{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMING UP</p>
            <h2>5-day forecast</h2>
          </div>
        </div>
        {days.length ? (
          <div className="forecast-grid">
            {days.map((day) => (
              <article className="forecast-card" key={day.key}>
                <div className="forecast-day">{day.day}</div>
                <div className="forecast-date">{day.date}</div>
                <div className="forecast-icon">{weatherIcon(day.weather?.main)}</div>
                <div className="forecast-condition">{day.weather?.description || "—"}</div>
                <div className="forecast-temps">
                  <strong>{Math.round(day.max)}°</strong>
                  <span>{Math.round(day.min)}°</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="forecast-note">Forecast data is unavailable right now.</p>
        )}
      </section>
    </div>
  );
}
