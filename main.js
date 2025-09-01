const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
const openCageApiKey = import.meta.env.VITE_OPENCAGE_API_KEY;

// DOM Element Selectors
const body = document.body;
const header = document.querySelector('header');
const headerLogoCity = document.getElementById('header-logo-city');
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');
const menuOverlay = document.getElementById('menu-overlay');
const menuLinks = document.querySelectorAll('#menu a');
const cityInput = document.getElementById('city');
const suggestions = document.getElementById('suggestions');
const forecastContainer = document.getElementById('forecast');
const detailedWeatherContainer = document.getElementById('detailed-weather');
const themeToggle = document.getElementById('theme-toggle');
const welcomeMessage = document.querySelector('.welcome-message');
const countryNameDisplay = document.getElementById('country-name');
const cityNameDisplay = document.getElementById('city-name');
const currentTimeDisplay = document.getElementById('current-time');
const getWeatherBtn = document.getElementById('get-weather-btn');
const getLocationBtn = document.getElementById('get-location-btn');

// State variables
let timeUpdateInterval;

// --- Menu Logic ---
function closeMenu() {
    body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    body.classList.toggle('menu-open');
});

menuOverlay.addEventListener('click', closeMenu);
menuLinks.forEach(link => link.addEventListener('click', closeMenu));

// --- Theme Toggling Logic ---
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
}

function toggleTheme() {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// --- Scroll Logic for Header ---
const observer = new IntersectionObserver(
    ([entry]) => {
        // When the city name is NOT visible on screen, show it in the header
        if (!entry.isIntersecting) {
            header.classList.add('show-city');
        } else {
            header.classList.remove('show-city');
        }
    },
    {
        root: null,
        threshold: 0.1, // Trigger when 10% of the element is visible
    }
);

// --- UI and Weather Effect Functions ---
function clearPrecipitation() {
    document.querySelectorAll('.rain-drop, .snow-flake').forEach(el => el.remove());
}

function createPrecipitation(type) {
    clearPrecipitation();
    const count = type.includes('rain') || type === 'thunderstorm' ? 100 : 70;
    const className = type.includes('snow') ? 'snow-flake' : 'rain-drop';
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = className;
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${Math.random() * 2 + 1}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        if (className === 'snow-flake') {
            const size = Math.random() * 4 + 4;
            drop.style.width = `${size}px`;
            drop.style.height = `${size}px`;
        }
        body.appendChild(drop);
    }
}

function updateCurrentTime(timezoneOffset) {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    const update = () => {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utcTime + (timezoneOffset * 1000));
        currentTimeDisplay.textContent = `Local Time: ${localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        currentTimeDisplay.classList.add('show');
    };
    update();
    timeUpdateInterval = setInterval(update, 1000);
}

function setWeatherBackground(condition) {
    const themeClass = body.classList.contains('dark-mode') ? 'dark-mode' : '';
    body.className = themeClass; // Reset classes but keep theme
    clearPrecipitation();
    const conditionLower = condition.toLowerCase();
    
    body.classList.add(conditionLower);
    if (['rain', 'drizzle', 'thunderstorm', 'snow'].includes(conditionLower)) {
        createPrecipitation(conditionLower);
    }
    welcomeMessage.style.display = 'none';
}

// --- Core Weather fetching and displaying logic ---
async function fetchAndProcessWeather(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== '200') throw new Error(data.message || 'City not found');
        
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
        
        document.title = `SUNDAY - ${data.city.name}`;
        countryNameDisplay.textContent = data.city.country;
        cityNameDisplay.textContent = data.city.name;
        headerLogoCity.textContent = data.city.name; // Set city name in header for scroll effect
        [countryNameDisplay, cityNameDisplay].forEach(el => el.classList.add('show'));
        
        updateCurrentTime(data.city.timezone);
        setWeatherBackground(dailyData[0].weather[0].main);
        displayForecast(dailyData, data.city);
        updateDetailedView(dailyData[0], data.city);
        
        // Start observing the main city name display
        observer.observe(cityNameDisplay);

    } catch (error) {
        console.error('Weather fetch error:', error);
        forecastContainer.innerHTML = `<p class="error">${error.message}</p>`;
        detailedWeatherContainer.classList.remove('show');
    }
}

function getWeather(city = cityInput.value.trim()) {
    if (!city) return;
    fetchAndProcessWeather(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric&lang=en`);
    cityInput.value = '';
    suggestions.classList.remove('show');
    cityInput.blur();
}

function getWeatherByLocation() {
    if (!navigator.geolocation) {
        forecastContainer.innerHTML = `<p class="error">Geolocation is not supported</p>`;
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => fetchAndProcessWeather(`https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${weatherApiKey}&units=metric&lang=en`),
        err => {
            console.error('Location error:', err);
            forecastContainer.innerHTML = `<p class="error">Unable to retrieve your location</p>`;
        }
    );
}

function displayForecast(dailyData, cityInfo) {
    forecastContainer.innerHTML = '';
    dailyData.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = getWeatherIcon(day.weather[0].icon) + `
            <p class="day-name">${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <p>${Math.round(day.main.temp)}°C</p>
        `;
        if (index === 0) card.classList.add('selected');
        card.addEventListener('click', () => {
            document.querySelector('.forecast-card.selected').classList.remove('selected');
            card.classList.add('selected');
            updateDetailedView(day, cityInfo);
            setWeatherBackground(day.weather[0].main);
        });
        forecastContainer.appendChild(card);
    });
}

function updateDetailedView(dayData, cityInfo) {
    const sunrise = new Date(cityInfo.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(cityInfo.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    detailedWeatherContainer.innerHTML = `
        <div class="details-grid">
            <div class="detail-item"><div class="label">Wind</div><div class="value">${dayData.wind.speed.toFixed(1)}<span class="unit">m/s</span></div></div>
            <div class="detail-item"><div class="label">Humidity</div><div class="value">${dayData.main.humidity}<span class="unit">%</span></div></div>
            <div class="detail-item"><div class="label">Sunrise</div><div class="value">${sunrise}</div></div>
            <div class="detail-item"><div class="label">Sunset</div><div class="value">${sunset}</div></div>
            <div class="detail-item"><div class="label">Feels Like</div><div class="value">${Math.round(dayData.main.feels_like)}<span class="unit">°C</span></div></div>
            <div class="detail-item"><div class="label">Pressure</div><div class="value">${dayData.main.pressure}<span class="unit">hPa</span></div></div>
        </div>`;
    detailedWeatherContainer.classList.add('show');
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '<svg class="weather-icon" viewBox="0 0 64 64"><circle class="sun" cx="32" cy="32" r="14"/></svg>',
        '01n': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="moon" d="M42.2,33.7C40,35.5,37.1,36.5,34,36.5c-6.1,0-11-4.9-11-11c0-2.8,1.1-5.5,2.9-7.5c-1.8-0.8-3.8-1.3-5.9-1.3c-7.7,0-14,6.3-14,14s6.3,14,14,14s14-6.3,14-14C43.5,35.4,43,34.5,42.2,33.7z"/></svg>',
        '02d': '<svg class="weather-icon" viewBox="0 0 64 64"><circle class="sun" cx="32" cy="22" r="9"/><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/></svg>',
        '02n': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="moon" d="M38.2,29.7C36,31.5,33.1,32.5,30,32.5c-6.1,0-11-4.9-11-11c0-2.8,1.1-5.5,2.9-7.5c-1.8-0.8-3.8-1.3-5.9-1.3c-7.7,0-14,6.3-14,14s6.3,14,14,14h27c4.7,0,8.5-3.8,8.5-8.5c0-4-2.7-7.2-6.4-8.2C40.2,29.5,39.2,29.7,38.2,29.7z"/><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/></svg>',
        '03d': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/></svg>',
        '04d': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/><path class="cloud" d="M37.7,44.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C34,52.9,37.7,49.1,37.7,44.4z"/></svg>',
        '09d': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/><line class="rain" x1="24" y1="50" x2="24" y2="60"/><line class="rain" x1="32" y1="50" x2="32" y2="60"/><line class="rain" x1="40" y1="50" x2="40" y2="60"/></svg>',
        '10d': '<svg class="weather-icon" viewBox="0 0 64 64"><circle class="sun" cx="32" cy="22" r="9"/><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/><line class="rain" x1="32" y1="50" x2="32" y2="60"/></svg>',
        '11d': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/><polygon class="lightning" points="32,46 28,54 36,54 32,62"/></svg>',
        '13d': '<svg class="weather-icon" viewBox="0 0 64 64"><path class="cloud" d="M47.7,34.4c0-4.6-3.7-8.3-8.3-8.3c-1,0-2,0.2-2.9,0.5c-0.4-4.8-4.3-8.6-9.2-8.6c-5.1,0-9.2,4.1-9.2,9.2v0.1c-3.7,1-6.4,4.2-6.4,8.2c0,4.7,3.8,8.5,8.5,8.5h27C44,42.9,47.7,39.1,47.7,34.4z"/><line class="snow" x1="24" y1="50" x2="24" y2="60"/><line class="snow" x1="22" y1="55" x2="26" y2="55"/><line class="snow" x1="32" y1="50" x2="32" y2="60"/><line class="snow" x1="30" y1="55" x2="34" y2="55"/><line class="snow" x1="40" y1="50" x2="40" y2="60"/><line class="snow" x1="38" y1="55" x2="42" y2="55"/></svg>',
        '50d': '<svg class="weather-icon" viewBox="0 0 64 64"><line class="fog" x1="16" y1="42" x2="48" y2="42"/><line class="fog" x1="18" y1="48" x2="46" y2="48"/><line class="fog" x1="20" y1="54" x2="44" y2="54"/></svg>', // <<<<<<<<<<<<<<<< ИСПРАВЛЕНИЕ: Добавлена запятая
    };
    const code = iconCode.slice(0, 2) + 'd'; // Force day icons for consistency, night icons are just moon
    return iconMap[iconCode] || iconMap[code] || iconMap['03d']; // Fallback to cloudy
}

// --- City Search and Suggestions ---
async function fetchCities(query) {
    suggestions.innerHTML = '';
    if (query.length < 2) {
        suggestions.classList.remove('show');
        return;
    }
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${openCageApiKey}&language=en&limit=5`);
        const data = await response.json();
        if (data.results.length > 0) {
            data.results.forEach(result => {
                const city = result.components.city || result.components.town || result.components.village;
                if (city) {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.className = 'suggestion';
                    suggestionDiv.textContent = `${city}, ${result.components.country}`;
                    suggestionDiv.addEventListener('click', () => getWeather(city));
                    suggestions.appendChild(suggestionDiv);
                }
            });
            suggestions.classList.add('show');
        } else {
            suggestions.innerHTML = '<div class="suggestion">No matches found</div>';
        }
    } catch (error) {
        console.error('City suggestion error:', error);
    }
}

// --- Assigning all event listeners ---
themeToggle.addEventListener('click', toggleTheme);
getWeatherBtn.addEventListener('click', () => getWeather());
getLocationBtn.addEventListener('click', getWeatherByLocation);
cityInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') getWeather(); });
cityInput.addEventListener('input', (e) => fetchCities(e.target.value));
