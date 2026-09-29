// ======================================================
// AIRTRACE AI - DASHBOARD
// ======================================================


// ------------------------------------------------------
// DEFAULT CHART DATA
// ------------------------------------------------------

const days = [
    "Sep 28",
    "Sep 29",
    "Sep 30",
    "Oct 1",
    "Oct 2",
    "Oct 3",
    "Oct 4"
];

const riskData = [
    55,
    62,
    68,
    72,
    78,
    81,
    85
];

const temperatureData = [
    32,
    33,
    34,
    35,
    36,
    37,
    38
];


// ------------------------------------------------------
// CHARTS
// ------------------------------------------------------

const predictionCanvas =
    document.getElementById("predictionChart");

const temperatureCanvas =
    document.getElementById("temperatureChart");


// Prediction chart

if (predictionCanvas) {

    new Chart(
        predictionCanvas,
        {
            type: "line",

            data: {

                labels: days,

                datasets: [
                    {
                        label: "Risk Score",

                        data: riskData,

                        tension: 0.3
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true,

                        max: 100
                    }

                }
            }
        }
    );
}


// Temperature chart

if (temperatureCanvas) {

    new Chart(
        temperatureCanvas,
        {
            type: "line",

            data: {

                labels: days,

                datasets: [
                    {
                        label: "Temperature °C",

                        data: temperatureData,

                        tension: 0.3
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: false
                    }

                }
            }
        }
    );
}



// ======================================================
// REAL ENVIRONMENTAL DATA
// ======================================================


async function loadRealEnvironmentalData(city) {

    console.log(
        "Loading real environmental data for:",
        city
    );


    const cityStatus =
        document.getElementById("cityStatus");

    const dataSource =
        document.getElementById("dataSource");


    try {

        if (cityStatus) {

            cityStatus.textContent =
                `Loading environmental data for ${city}...`;

        }


        // ------------------------------------------------
        // CALL AIRTRACE BACKEND
        // ------------------------------------------------

        const data =
            await apiRequest(
                `/api/real-air-quality/${encodeURIComponent(city)}`
            );


        console.log(
            "AirTrace environmental data:",
            data
        );


        // ------------------------------------------------
        // HANDLE ERROR
        // ------------------------------------------------

        if (data.error) {

            throw new Error(
                data.error
            );

        }


        // ------------------------------------------------
        // UPDATE MAIN DASHBOARD CARDS
        // ------------------------------------------------

        const temperature =
            document.getElementById("temperature");

        const humidity =
            document.getElementById("humidity");

        const pollution =
            document.getElementById("pollution");

        const pm10 =
            document.getElementById("pm10");

        const aqi =
            document.getElementById("aqi");

        const wind =
            document.getElementById("wind");

        const risk =
            document.getElementById("risk");


        if (temperature) {

            temperature.textContent =
                `${data.temperature}°C`;

        }


        if (humidity) {

            humidity.textContent =
                `${data.humidity}%`;

        }


        if (pollution) {

            pollution.textContent =
                data.pm25;

        }


        if (pm10) {

            pm10.textContent =
                data.pm10;

        }


        if (aqi) {

            aqi.textContent =
                data.us_aqi;

        }


        if (wind) {

            wind.textContent =
                `${data.wind_speed} km/h`;

        }


        if (risk) {

            risk.textContent =
                data.risk;

        }


        // ------------------------------------------------
        // UPDATE LOCATION INFORMATION
        // ------------------------------------------------

        const cityName =
            document.getElementById("cityName");

        const countryName =
            document.getElementById("countryName");

        const latitude =
            document.getElementById("latitude");

        const longitude =
            document.getElementById("longitude");


        if (cityName) {

            cityName.textContent =
                data.city;

        }


        if (countryName) {

            countryName.textContent =
                data.country;

        }


        if (latitude) {

            latitude.textContent =
                Number(data.latitude).toFixed(4);

        }


        if (longitude) {

            longitude.textContent =
                Number(data.longitude).toFixed(4);

        }


        // ------------------------------------------------
        // UPDATE STATUS
        // ------------------------------------------------

        if (cityStatus) {

            cityStatus.textContent =
                `Environmental data loaded for ${data.city}, ${data.country}.`;

        }


        if (dataSource) {

            dataSource.textContent =
                `Source: ${data.data_source}`;

        }


        // ------------------------------------------------
        // UPDATE AI SECTION
        // ------------------------------------------------

        const analysis =
            document.getElementById("analysis");

        const recommendations =
            document.getElementById("recommendations");


        if (analysis) {

            analysis.textContent =
                `AirTrace detected a PM2.5 concentration of ${data.pm25} µg/m³ and a current US AQI of ${data.us_aqi} in ${data.city}. The calculated pollution risk is ${data.risk}. Temperature is ${data.temperature}°C with ${data.humidity}% humidity and wind speed of ${data.wind_speed} km/h.`;

        }


        if (recommendations) {

            recommendations.innerHTML = "";


            const items = [];


            if (
                data.risk === "VERY HIGH" ||
                data.risk === "HIGH"
            ) {

                items.push(
                    "Prioritize monitoring of local pollution sources."
                );

                items.push(
                    "Consider additional air-quality measurements in high-risk areas."
                );

                items.push(
                    "Authorities should investigate unusual pollution observations."
                );

            } else {

                items.push(
                    "Continue monitoring local air-quality conditions."
                );

                items.push(
                    "Maintain regular environmental monitoring."
                );

                items.push(
                    "Investigate citizen reports if unusual pollution is observed."
                );

            }


            items.forEach(
                item => {

                    const li =
                        document.createElement("li");

                    li.textContent =
                        item;

                    recommendations.appendChild(li);

                }
            );

        }


    } catch (error) {

        console.error(
            "AirTrace environmental data error:",
            error
        );


        if (cityStatus) {

            cityStatus.textContent =
                `Unable to load environmental data for ${city}.`;

        }


        if (dataSource) {

            dataSource.textContent =
                "Please check the city name and make sure the AirTrace backend is running.";

        }

    }

}



// ======================================================
// CITY SELECTOR
// ======================================================


document.addEventListener(
    "DOMContentLoaded",
    () => {


        const cityInput =
            document.getElementById("cityInput");

        const loadCityBtn =
            document.getElementById("loadCityBtn");


        if (!cityInput || !loadCityBtn) {

            console.error(
                "AirTrace city selector not found."
            );

            return;

        }


        // ----------------------------------------------
        // LOAD DEFAULT CITY
        // ----------------------------------------------

        loadRealEnvironmentalData(
            cityInput.value.trim()
        );


        // ----------------------------------------------
        // LOAD CITY BUTTON
        // ----------------------------------------------

        loadCityBtn.addEventListener(
            "click",
            () => {

                const city =
                    cityInput.value.trim();


                if (!city) {

                    alert(
                        "Please enter a city name."
                    );

                    return;

                }


                loadRealEnvironmentalData(
                    city
                );

            }
        );


        // ----------------------------------------------
        // PRESS ENTER TO LOAD
        // ----------------------------------------------

        cityInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    loadCityBtn.click();

                }

            }
        );

    }
);