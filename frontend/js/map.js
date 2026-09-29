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
                "Unable to analyze city:",
                error
            );

            if (mapStatus) {
                mapStatus.textContent =
                    "Unable to load city data.";
            }

            alert(
                "Could not load environmental data for this city."
            );
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