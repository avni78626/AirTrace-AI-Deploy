const API_BASE_URL = "https://airtrace-ai-deploy.onrender.com";

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `API request failed: ${response.status} ${errorText}`
            );
        }


        return await response.json();

    } catch (error) {

        console.error(
            "AirTrace API Error:",
            error
        );

        throw error;
    }
}


/* ================= HEALTH ================= */

async function getHealth() {

    return await apiRequest(
        "/health"
    );

}


/* ================= AIR QUALITY ================= */

async function getAirQuality(city) {

    return await apiRequest(
        `/api/air-quality/${encodeURIComponent(city)}`
    );

}


/* ================= REAL AIR QUALITY ================= */

async function getRealAirQuality(city) {

    return await apiRequest(
        `/api/real-air-quality/${encodeURIComponent(city)}`
    );

}


/* ================= PREDICTION ================= */

async function getPrediction(city) {

    return await apiRequest(
        `/api/prediction/${encodeURIComponent(city)}`
    );

}


/* ================= AI ANALYSIS ================= */

async function getAIAnalysis(city) {

    return await apiRequest(
        `/api/ai-analysis/${encodeURIComponent(city)}`
    );

}


/* ================= HOTSPOTS ================= */

async function getHotspots() {

    return await apiRequest(
        "/api/hotspots"
    );

}


/* ================= HOTSPOT INTELLIGENCE ================= */

async function getHotspotIntelligence() {

    return await apiRequest(
        "/api/hotspot-intelligence"
    );

}


/* ================= MAP HOTSPOTS ================= */

async function getMapHotspots() {

    return await apiRequest(
        "/api/map-hotspots"
    );

}


/* ================= CITIZEN REPORTS ================= */

async function getCitizenReports() {

    return await apiRequest(
        "/api/citizen-reports"
    );

}


/* ================= SUBMIT CITIZEN REPORT ================= */

async function submitCitizenReport(report) {

    console.log(
        "Sending citizen report:",
        report
    );

    return await apiRequest(
        "/api/citizen-report",
        {
            method: "POST",

            body: JSON.stringify(report)
        }
    );

}