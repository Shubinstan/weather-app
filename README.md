# ☀️ Dynamic Weather Forecast App
https://github.com/Shubinstan/weather-app/blob/main/screenshots/weather_screenshot.png?raw=true

A sleek, responsive, and secure single-page weather application built with modern front-end technologies. This project fetches and displays real-time weather data from the OpenWeatherMap API, featuring a dynamic UI that adapts to weather conditions and user preferences.

---

## 🚀 Live Demo

[weather-app-murex-five-33.vercel.app](https://weather-app-murex-five-33.vercel.app/)

---

## ✨ Key Features

-   **Real-time Data:** Fetches current weather and a 5-day forecast from the OpenWeatherMap API.
-   **Dynamic UI:** The background and animated effects (rain, snow, clouds) change based on the selected day's weather.
-   **Secure API Key Handling:** All API keys are securely managed using environment variables (`.env`) and are not exposed on the client-side.
-   **City Search & Geolocation:** Users can search for any city worldwide or get instant weather data for their current location.
-   **Scroll-Aware Header:** The header title elegantly transitions from "SUNDAY" to the current city name upon scrolling.
-   **Modern Glassmorphism Design:** A beautiful, semi-transparent interface that provides a sense of depth.
-   **Custom SVG Icons:** Minimalistic, custom-styled SVG icons for a clean and modern look.
-   **Light & Dark Mode:** A persistent theme toggle for optimal user experience in any lighting condition.
-   **Fully Responsive:** Meticulously crafted to provide a seamless experience on mobile, tablet, and desktop devices.

---

## 🛠️ Tech Stack & Skills Demonstrated

This project showcases a comprehensive set of modern front-end development skills:

### Core Technologies

-   **HTML5:** Semantic and accessible markup.
-   **CSS3:** Advanced styling, including:
    -   **Responsive Design:** Flexbox and Media Queries.
    -   **Animations & Transitions:** Smooth, performant animations for UI elements and weather effects.
    -   **CSS Variables:** For efficient and scalable theming (Light & Dark modes).
    -   **Glassmorphism:** Modern design techniques using `backdrop-filter`.
-   **JavaScript (ES6+):**
    -   **Asynchronous JS:** `async/await` and the `Fetch API` for handling network requests.
    -   **DOM Manipulation:** Efficiently creating and managing UI elements.
    -   **`IntersectionObserver`:** Modern API for performance-optimized scroll-based animations.
    -   **Modular & Organized Code:** Well-structured functions and event handling.

### Development & Build Tools

-   **Vite:** A next-generation, high-performance build tool for modern web projects.
-   **Node.js / npm:** For dependency management and running the local development server.
-   **Git & GitHub:** For version control and source code management.

### APIs & Data

-   **REST APIs:** Proficient consumption of third-party APIs.
-   **OpenWeatherMap API:** For weather and forecast data.
-   **OpenCage Geocoding API:** For city search suggestions.

---

## 📦 Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Shubinstan/secure-weather-app.git](https://github.com/Shubinstan/secure-weather-app.git)
    cd secure-weather-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a `.env` file in the root of the project.
    -   Add your API keys to the `.env` file:
        ```
        VITE_WEATHER_API_KEY=your_openweathermap_api_key
        VITE_OPENCAGE_API_KEY=your_opencage_api_key
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.
