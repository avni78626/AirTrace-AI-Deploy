document.addEventListener("DOMContentLoaded", async function () {

    console.log("AirTrace Map starting...");

    // ================================
    // MAP SETUP
    // ================================

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        console.error("Map element not found.");
        return;
    }

    const map = L.map("map").setView([22.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);


    // ================================
    // MARKER STORAGE
    // ================================

    let intelligenceMarkers = [];
    let citizenMarkers = [];
    let cityMarker = null;


    // ================================
    // RISK COLORS
    // ================================

    function getRiskColor(risk) {

        if (!risk) {
            return "gray";
        }

        const normalizedRisk = risk.toUpperCase();

        if (normalizedRisk === "VERY HIGH") {
            return "red";
        }

        if (normalizedRisk === "HIGH") {
            return "red";
        }

        if (normalizedRisk === "MODERATE") {
            return "orange";
        }

        if (normalizedRisk === "LOW") {
            return "green";
        }

        return "gray";
    }


    // ================================
    // MAP INDICATORS
    // ================================

    function updateMapIndicators(data) {

        const temperature = document.getElementById("mapTemperature");
        const pm25 = document.getElementById("mapPM25");
        const aqi = document.getElementById("mapAQI");
        const risk = document.getElementById("mapRisk");
        const pm10 = document.getElementById("mapPM10");
        const humidity = document.getElementById("mapHumidity");
        const wind = document.getElementById("mapWind");
        const coordinates = document.getElementById("mapCoordinates");

        if (temperature) {
            temperature.textContent =
                data.temperature !== undefined
                    ? `${data.temperature}°C`
                    : "Unavailable";
        }

        if (pm25) {
            pm25.textContent =
                data.pm25 !== undefined
                    ? `${data.pm25} µg/m³`
                    : "Unavailable";
        }

        if (aqi) {
            aqi.textContent =
                data.us_aqi !== undefined
                    ? data.us_aqi
                    : "Unavailable";
        }

        if (risk) {
            risk.textContent =
                data.risk !== undefined
                    ? data.risk
                    : "Unavailable";
        }

        if (pm10) {
            pm10.textContent =
                data.pm10 !== undefined
                    ? `${data.pm10} µg/m³`
                    : "Unavailable";
        }

        if (humidity) {
            humidity.textContent =
                data.humidity !== undefined
                    ? `${data.humidity}%`
                    : "Unavailable";
        }

        if (wind) {
            wind.textContent =
                data.wind_speed !== undefined
                    ? `${data.wind_speed} km/h`
                    : "Unavailable";
        }

        if (coordinates) {
            if (
                data.latitude !== undefined &&
                data.longitude !== undefined
            ) {
                coordinates.textContent =
                    `${data.latitude}, ${data.longitude}`;
            } else {
                coordinates.textContent = "Unavailable";
            }
        }
    }


    // ================================
    // CITY ANALYSIS
    // ================================

    async function analyzeCity(city) {

        const mapStatus = document.getElementById("mapStatus");
        const mapDataSource = document.getElementById("mapDataSource");

        if (!city || city.trim() === "") {
            alert("Please enter a city.");
            return;
        }

        city = city.trim();

        console.log("Analyzing city:", city);

        if (mapStatus) {
            mapStatus.textContent = "Loading environmental data...";
        }

        try {

            const data = await apiRequest(
                `/api/real-air-quality/${encodeURIComponent(city)}`
            );

            console.log("Real air-quality data:", data);

            updateMapIndicators(data);

            if (mapStatus) {
                mapStatus.textContent =
                    `Environmental data loaded for ${data.city}`;
            }

            if (mapDataSource) {
                mapDataSource.textContent =
                    data.data_source || "Open-Meteo";
            }

            // ============================
            // REMOVE OLD CITY MARKER
            // ============================

            if (cityMarker) {
                map.removeLayer(cityMarker);
            }


            // ============================
            // CREATE CITY MARKER
            // ============================

            const markerColor = getRiskColor(data.risk);

            cityMarker = L.circleMarker(
                [
                    Number(data.latitude),
                    Number(data.longitude)
                ],
                {
                    radius: 16,
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.7,
                    weight: 4
                }
            );


            cityMarker.bindPopup(`
                <div style="min-width:260px">

                    <h3>
                        🌍 AirTrace Environmental Analysis
                    </h3>

                    <p>
                        <strong>City:</strong>
                        ${data.city}
                    </p>

                    <p>
                        <strong>PM2.5:</strong>
                        ${data.pm25} µg/m³
                    </p>

                    <p>
                        <strong>PM10:</strong>
                        ${data.pm10} µg/m³
                    </p>

                    <p>
                        <strong>US AQI:</strong>
                        ${data.us_aqi}
                    </p>

                    <p>
                        <strong>Temperature:</strong>
                        ${data.temperature}°C
                    </p>

                    <p>
                        <strong>Humidity:</strong>
                        ${data.humidity}%
                    </p>

                    <p>
                        <strong>Wind:</strong>
                        ${data.wind_speed} km/h
                    </p>

                    <p>
                        <strong>Risk:</strong>
                        ${data.risk}
                    </p>

                    <p>
                        <strong>Source:</strong>
                        ${data.data_source}
                    </p>

                </div>
            `);


            cityMarker.addTo(map);

            map.setView(
                [
                    Number(data.latitude),
                    Number(data.longitude)
                ],
                9
            );

            cityMarker.openPopup();


        } catch (error) {

            console.error(
                "Environmental data unavailable:",
                error
            );

            /*
             * Open-Meteo can temporarily return HTTP 429.
             * Do not break the map when that happens.
             */

            const CITY_COORDINATES = {

                "Kathua": [32.3694, 75.5254],
                "Delhi": [28.6139, 77.2090],
                "Mumbai": [19.0760, 72.8777],
                "Kolkata": [22.5726, 88.3639],
                "Bengaluru": [12.9716, 77.5946],
                "Hyderabad": [17.3850, 78.4867],
                "Chennai": [13.0827, 80.2707],
                "Pune": [18.5204, 73.8567],
                "Surat": [21.1702, 72.8311],
                "Ahmedabad": [23.0225, 72.5714],
                "Jaipur": [26.9124, 75.7873],
                "Lucknow": [26.8467, 80.9462],
                "Kanpur": [26.4499, 80.3319],
                "Nagpur": [21.1458, 79.0882],
                "Indore": [22.7196, 75.8577],
                "Bhopal": [23.2599, 77.4126],
                "Patna": [25.5941, 85.1376],
                "Ranchi": [23.3441, 85.3096],
                "Bhubaneswar": [20.2961, 85.8245],
                "Chandigarh": [30.7333, 76.7794],
                "Amritsar": [31.6340, 74.8723],
                "Ludhiana": [30.9010, 75.8573],
                "Jammu": [32.7266, 74.8570],
                "Srinagar": [34.0837, 74.7973]
            };

            const cityKey = Object.keys(CITY_COORDINATES).find(
                name =>
                    name.toLowerCase() === city.toLowerCase()
            );

            if (!cityKey) {

                if (mapStatus) {
                    mapStatus.textContent =
                        "Environmental data temporarily unavailable.";
                }

                if (mapDataSource) {
                    mapDataSource.textContent =
                        "Live environmental service temporarily unavailable";
                }

                updateMapIndicators({});

                return;
            }

            const [latitude, longitude] =
                CITY_COORDINATES[cityKey];

            if (mapStatus) {
                mapStatus.textContent =
                    `Environmental data temporarily unavailable for ${cityKey}. Showing city location.`;
            }

            if (mapDataSource) {
                mapDataSource.textContent =
                    "City location fallback";
            }

            updateMapIndicators({});

            if (cityMarker) {
                map.removeLayer(cityMarker);
            }

            cityMarker = L.circleMarker(
                [latitude, longitude],
                {
                    radius: 16,
                    color: "orange",
                    fillColor: "orange",
                    fillOpacity: 0.6,
                    weight: 4
                }
            );

            cityMarker.bindPopup(`
                <div style="min-width:260px">

                    <h3>
                        📍 AirTrace City Location
                    </h3>

                    <p>
                        <strong>City:</strong>
                        ${cityKey}
                    </p>

                    <p>
                        <strong>Environmental data:</strong>
                        Temporarily unavailable
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        Live environmental data service is temporarily rate-limited.
                    </p>

                    <p>
                        <strong>Coordinates:</strong>
                        ${latitude}, ${longitude}
                    </p>

                    <p>
                        <strong>AirTrace:</strong>
                        Citizen and hotspot intelligence remains available.
                    </p>

                </div>
            `);

            cityMarker.addTo(map);

            map.setView(
                [latitude, longitude],
                9
            );

            cityMarker.openPopup();
        }
    }


    // ================================
    // CITY SEARCH BUTTON
    // ================================

    const analyzeCityBtn =
        document.getElementById("analyzeCityBtn");

    const mapCityInput =
        document.getElementById("mapCityInput");

    if (analyzeCityBtn) {

        analyzeCityBtn.addEventListener(
            "click",
            function () {

                const city =
                    mapCityInput
                        ? mapCityInput.value
                        : "";

                analyzeCity(city);
            }
        );
    }


    // ================================
    // ENTER KEY SEARCH
    // ================================

    if (mapCityInput) {

        mapCityInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    const city =
                        mapCityInput.value;

                    analyzeCity(city);
                }
            }
        );
    }


    // ================================
    // HOTSPOT INTELLIGENCE
    // ================================

    async function loadHotspotIntelligence() {

        console.log(
            "Loading AirTrace Hotspot Intelligence..."
        );

        try {

            const data =
                await getHotspotIntelligence();

            console.log(
                "Hotspot intelligence response:",
                data
            );

            if (
                !data ||
                !data.hotspots ||
                data.hotspots.length === 0
            ) {

                console.log(
                    "No intelligent hotspots found."
                );

                return;
            }


            data.hotspots.forEach(function (hotspot) {

                if (
                    hotspot.latitude === null ||
                    hotspot.longitude === null ||
                    hotspot.latitude === undefined ||
                    hotspot.longitude === undefined
                ) {
                    return;
                }


                const markerColor =
                    getRiskColor(hotspot.risk);


                // Larger marker
                const marker =
                    L.circleMarker(
                        [
                            Number(hotspot.latitude),
                            Number(hotspot.longitude)
                        ],
                        {
                            radius: 22,
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.35,
                            weight: 6
                        }
                    );


                marker.bindPopup(`
                    <div style="min-width:300px">

                        <h3>
                            🚨 AirTrace Hotspot Intelligence
                        </h3>

                        <p>
                            <strong>City:</strong>
                            ${hotspot.city}
                        </p>

                        <p>
                            <strong>Combined Risk:</strong>
                            ${hotspot.risk}
                        </p>

                        <p>
                            <strong>PM2.5:</strong>
                            ${hotspot.pm25 ?? "Unavailable"}
                            µg/m³
                        </p>

                        <p>
                            <strong>Environmental Risk:</strong>
                            ${hotspot.environmental_risk}
                        </p>

                        <p>
                            <strong>Citizen Risk:</strong>
                            ${hotspot.citizen_risk}
                        </p>

                        <p>
                            <strong>Citizen Reports:</strong>
                            ${hotspot.citizen_reports}
                        </p>

                        <hr>

                        <strong>Evidence:</strong>

                        <ul>
                            ${
                                hotspot.evidence
                                    .map(
                                        item =>
                                            `<li>${item}</li>`
                                    )
                                    .join("")
                            }
                        </ul>

                        <p>
                            <strong>Source:</strong>
                            ${hotspot.source}
                        </p>

                        <p>
                            <strong>
                                Recommended Action:
                            </strong>
                            <br>
                            ${hotspot.recommended_action}
                        </p>

                    </div>
                `);


                marker.addTo(map);

                intelligenceMarkers.push(marker);

            });


            console.log(
                `Loaded ${data.hotspots.length} intelligent hotspot(s).`
            );


        } catch (error) {

            console.error(
                "Unable to load hotspot intelligence:",
                error
            );
        }
    }


    // ================================
    // CITIZEN HOTSPOTS
    // ================================

    async function loadCitizenHotspots() {

        console.log(
            "Loading citizen pollution reports..."
        );

        try {

            const data =
                await getMapHotspots();

            console.log(
                "Citizen hotspot data:",
                data
            );

            if (
                !data ||
                !data.points ||
                data.points.length === 0
            ) {

                console.log(
                    "No citizen pollution reports found."
                );

                return;
            }


            data.points.forEach(function (point) {

                if (
                    point.latitude === undefined ||
                    point.longitude === undefined
                ) {
                    return;
                }


                const markerColor =
                    getRiskColor(point.risk);


                const marker =
                    L.circleMarker(
                        [
                            Number(point.latitude),
                            Number(point.longitude)
                        ],
                        {
                            radius: 12,
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.7,
                            weight: 3
                        }
                    );


                marker.bindPopup(`
                    <div style="min-width:260px">

                        <h3>
                            🚨 Citizen Pollution Report
                        </h3>

                        <p>
                            <strong>City:</strong>
                            ${point.city}
                        </p>

                        <p>
                            <strong>Risk:</strong>
                            ${point.risk}
                        </p>

                        <p>
                            <strong>Observation:</strong>
                            ${point.description}
                        </p>

                        <p>
                            <strong>Source:</strong>
                            Citizen observation
                        </p>

                        <p>
                            <strong>Coordinates:</strong>
                            <br>
                            ${point.latitude},
                            ${point.longitude}
                        </p>

                    </div>
                `);


                marker.addTo(map);

                citizenMarkers.push(marker);

            });


            console.log(
                `Loaded ${data.points.length} citizen report marker(s).`
            );


        } catch (error) {

            console.error(
                "Unable to load citizen hotspots:",
                error
            );
        }
    }


    // ================================
    // DEFAULT CITY
    // ================================

    const defaultCity =
        mapCityInput && mapCityInput.value
            ? mapCityInput.value
            : "Kathua";


    // Load default city first
    await analyzeCity(defaultCity);


    // =================================================
    // IMPORTANT:
    // CITIZEN MARKERS FIRST
    // INTELLIGENCE MARKERS LAST
    // =================================================

    await loadCitizenHotspots();

    await loadHotspotIntelligence();


    console.log(
        "AirTrace Map fully loaded."
    );

});