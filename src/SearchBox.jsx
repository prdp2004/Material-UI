import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import "./SearchBox.css";

export default function SearchBox({ onSearch, getWeatherInfo, loading }) {
  const [city, setCity] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const searchAction = onSearch || getWeatherInfo;
    if (searchAction) {
      searchAction(city);
    }
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <TextField
        className="city-input"
        label="Search city or location"
        placeholder="e.g. Delhi, London, Tokyo"
        variant="outlined"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        disabled={loading}
        autoComplete="off"
        slotProps={{ htmlInput: { "aria-label": "City or location" } }}
      />
      <Button
        className="search-button"
        variant="contained"
        type="submit"
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <span aria-hidden="true">⌕</span>
          )
        }
      >
        {loading ? "SEARCHING" : "SEARCH"}
      </Button>
    </form>
  );
}
