const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

const API_KEY = "b998ff4339c10bbe0bd999978513aea1";

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return;
  getWeather(city);
});

function getWeather(city) {
  weatherResult.innerHTML = `<div class="loading">Loading...</div>`;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        weatherResult.innerHTML = `<p>City not found</p>`;
        return;
      }

      const { lat, lon } = data.coord;
      fetchAQI(lat, lon, data);
      fetch7DayForecast(lat, lon);
    });
}

/* AQI */
function fetchAQI(lat, lon, weatherData) {
  fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    .then(res => res.json())
    .then(aqiData => {
      displayWeather(weatherData, getAQIInfo(aqiData.list[0].main.aqi));
    });
}

/* 7 Day Forecast */
function fetch7DayForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => display7DayForecast(data.daily.slice(1, 8)));
}

function display7DayForecast(days) {
  const forecastDiv = document.getElementById("forecastSection");

  let html = `
    <h3 class="forecast-title">7-Day Forecast</h3>
    <div class="forecast-container">
  `;

  days.forEach(d => {
    const day = new Date(d.dt * 1000)
      .toLocaleDateString("en-US", { weekday: "short" });

    html += `
      <div class="forecast-card">
        <p class="day">${day}</p>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
        <p class="temp-range">
          ${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°
        </p>
      </div>
    `;
  });

  html += `</div>`;
  forecastDiv.innerHTML = html;
}


/* Main Weather */

function displayWeather(data, aqiInfo) {
  weatherResult.innerHTML = `
    <div class="main-card">
      <h2>${data.name}</h2>
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
      <h3>${data.weather[0].main}</h3>
      <p class="temp">${data.main.temp}°C</p>
      <p class="feels-like">Feels like ${data.main.feels_like}°C</p>
    </div>

    <div class="grid">
      <div class="card">💧 <span>${data.main.humidity}%</span><small>Humidity</small></div>
      <div class="card">🌬 <span>${data.wind.speed} m/s</span><small>Wind</small></div>
      <div class="card">☁ <span>${data.clouds.all}%</span><small>Cloud</small></div>
      <div class="card">📈 <span>${data.main.pressure} hPa</span><small>Pressure</small></div>
    </div>

    <div class="aqi-card ${aqiInfo.class}">
      <h3>Air Quality Index</h3>
      <p class="aqi-value">${aqiInfo.level}</p>
      <span>${aqiInfo.text}</span>
    </div>

    <!-- ✅ Forecast will be injected here -->
    <div id="forecastSection"></div>
  `;
}


/* AQI Map */
function getAQIInfo(aqi) {
  return {
    1: { level: "Good", text: "Air is clean 😊", class: "good" },
    2: { level: "Fair", text: "Acceptable 🙂", class: "fair" },
    3: { level: "Moderate", text: "Sensitive groups affected 😐", class: "moderate" },
    4: { level: "Poor", text: "Health effects 😷", class: "poor" },
    5: { level: "Very Poor", text: "Hazardous ☠️", class: "very-poor" }
  }[aqi];
}

