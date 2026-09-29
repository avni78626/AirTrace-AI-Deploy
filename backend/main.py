from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.climate import (
    get_air_quality,
    get_hotspots
)

from services.hotspots import (
    add_citizen_report,
    get_citizen_reports,
    calculate_hotspot_intelligence,
    get_map_hotspots
)

from services.real_air import (
    get_real_air_quality
)

from models import CitizenReport

import os

from dotenv import load_dotenv

from google import genai


# ==========================================
# ENVIRONMENT CONFIGURATION
# ==========================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured in .env"
    )


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AirTrace AI",
    description=(
        "AI-powered climate and "
        "air-quality intelligence platform"
    ),
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "AirTrace AI backend is running"
    }


# ==========================================
# HEALTH
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# EXISTING AIR QUALITY
# ==========================================

@app.get("/api/air-quality/{city}")
def air_quality(city: str):

    result = get_air_quality(city)

    if result is None:

        return {
            "error": "City not found",
            "available_cities": [
                "Delhi",
                "Mumbai",
                "Kolkata",
                "Bengaluru",
                "Hyderabad"
            ]
        }

    return result


# ==========================================
# NEW REAL AIR QUALITY - ANY CITY
# ==========================================

@app.get("/api/real-air-quality/{city}")
def real_air_quality(city: str):

    try:

        result = get_real_air_quality(city)

        return result

    except Exception as e:

        return {
            "error": (
                "Unable to retrieve "
                "environmental data"
            ),
            "details": str(e)
        }


# ==========================================
# BASIC HOTSPOTS
# ==========================================

@app.get("/api/hotspots")
def hotspots():

    return {
        "hotspots": get_hotspots()
    }


# ==========================================
# HOTSPOT INTELLIGENCE
# ==========================================

@app.get("/api/hotspot-intelligence")
def hotspot_intelligence():

    hotspots_data = calculate_hotspot_intelligence()

    return {
        "message":
            "AirTrace hotspot intelligence generated",

        "total_hotspots":
            len(hotspots_data),

        "hotspots":
            hotspots_data
    }


# ==========================================
# MAP HOTSPOTS
# ==========================================

@app.get("/api/map-hotspots")
def map_hotspots():

    points = get_map_hotspots()

    return {
        "message":
            "Map-ready hotspot data generated",

        "total_points":
            len(points),

        "points":
            points
    }


# ==========================================
# CITIZEN REPORTS
# ==========================================

@app.get("/api/citizen-reports")
def citizen_reports():

    reports = get_citizen_reports()

    return {
        "total_reports":
            len(reports),

        "reports":
            reports
    }


# ==========================================
# PREDICTION
# ==========================================

@app.get("/api/prediction/{city}")
def prediction(city: str):

    result = get_air_quality(city)

    if result is None:

        return {
            "error": "City not found",

            "available_cities": [
                "Delhi",
                "Mumbai",
                "Kolkata",
                "Bengaluru",
                "Hyderabad"
            ]
        }

    pm25 = result["pm25"]

    humidity = result["humidity"]

    temperature = result["temperature"]

    risk_score = 0


    # ======================================
    # PM2.5
    # ======================================

    if pm25 >= 75:

        risk_score += 50

    elif pm25 >= 50:

        risk_score += 30

    else:

        risk_score += 10


    # ======================================
    # TEMPERATURE
    # ======================================

    if temperature >= 35:

        risk_score += 20

    elif temperature >= 30:

        risk_score += 10


    # ======================================
    # HUMIDITY
    # ======================================

    if humidity < 45:

        risk_score += 10


    # ======================================
    # PREDICTION
    # ======================================

    if risk_score >= 60:

        prediction_result = (
            "HIGH POSSIBILITY OF AIR QUALITY SPIKE"
        )

    elif risk_score >= 35:

        prediction_result = (
            "MODERATE POSSIBILITY OF AIR QUALITY SPIKE"
        )

    else:

        prediction_result = (
            "LOW POSSIBILITY OF AIR QUALITY SPIKE"
        )


    return {

        "city":
            city,

        "current_pm25":
            pm25,

        "temperature":
            temperature,

        "humidity":
            humidity,

        "risk_score":
            risk_score,

        "prediction":
            prediction_result
    }


# ==========================================
# GEMINI AIR QUALITY ANALYSIS
# ==========================================

@app.get("/api/ai-analysis/{city}")
def ai_analysis(city: str):

    result = get_air_quality(city)

    if result is None:

        return {
            "error": "City not found",

            "available_cities": [
                "Delhi",
                "Mumbai",
                "Kolkata",
                "Bengaluru",
                "Hyderabad"
            ]
        }


    prompt = f"""
You are the environmental intelligence engine
for AirTrace AI.

Analyze the following air-quality conditions
for {city}:

PM2.5: {result["pm25"]}
PM10: {result["pm10"]}
Temperature: {result["temperature"]} °C
Humidity: {result["humidity"]} %

Give a concise environmental assessment.

Return:

1. Risk assessment
2. Why the conditions may be concerning
3. One practical intervention for authorities

Do not invent measurements that were not provided.
"""


    try:

        response = client.models.generate_content(

            model="gemini-3.8-flash",

            contents=prompt
        )

        return {

            "city":
                city,

            "air_quality":
                result,

            "ai_analysis":
                response.text
        }


    except Exception as e:

        return {

            "city":
                city,

            "air_quality":
                result,

            "error":
                "Gemini AI analysis temporarily unavailable",

            "details":
                str(e)
        }


# ==========================================
# CITIZEN POLLUTION REPORT
# ==========================================

@app.post("/api/citizen-report")
def citizen_report(report: CitizenReport):

    report_data = {

        "city":
            report.city,

        "description":
            report.description,

        "latitude":
            report.latitude,

        "longitude":
            report.longitude
    }


    # ======================================
    # STORE REPORT
    # ======================================

    add_citizen_report(
        report_data
    )


    # ======================================
    # GEMINI ANALYSIS PROMPT
    # ======================================

    prompt = f"""
You are the environmental intelligence engine
for AirTrace AI.

A citizen has submitted the following
pollution report:

City:
{report.city}

Description:
{report.description}

Latitude:
{report.latitude}

Longitude:
{report.longitude}

Analyze this citizen report.

Return:

1. Pollution type

2. Severity:
LOW, MODERATE, HIGH, or VERY HIGH

3. Possible pollution source

4. Environmental explanation

5. Recommended action for local authorities

Important:

- Base your analysis only on the information provided.
- Clearly state when something is uncertain.
- Do not invent sensor measurements.
- Do not invent satellite observations.
- Do not claim that a pollution source is confirmed.
- Keep the response concise.
"""


    # ======================================
    # GEMINI
    # ======================================

    try:

        response = client.models.generate_content(

            model="gemini-3.8-flash",

            contents=prompt
        )

        return {

            "message":
                "Citizen pollution report analyzed successfully",

            "analysis_source":
                "Gemini AI",

            "report":
                report_data,

            "ai_analysis":
                response.text
        }


    except Exception:

        # ==================================
        # LOCAL FALLBACK
        # ==================================

        description = (
            report.description.lower()
        )


        # ==================================
        # POLLUTION TYPE
        # ==================================

        if any(
            word in description
            for word in [
                "smoke",
                "burning",
                "fire",
                "burn"
            ]
        ):

            pollution_type = (
                "Smoke / combustion-related pollution"
            )

        elif any(
            word in description
            for word in [
                "dust",
                "construction",
                "road"
            ]
        ):

            pollution_type = (
                "Dust / particulate pollution"
            )

        elif any(
            word in description
            for word in [
                "chemical",
                "gas",
                "industrial",
                "factory"
            ]
        ):

            pollution_type = (
                "Possible industrial pollution"
            )

        else:

            pollution_type = (
                "Unknown pollution type"
            )


        # ==================================
        # SEVERITY
        # ==================================

        if any(
            word in description
            for word in [
                "heavy",
                "thick",
                "severe",
                "strong"
            ]
        ):

            severity = "HIGH"

        elif any(
            word in description
            for word in [
                "smoke",
                "burning",
                "bad",
                "strong smell"
            ]
        ):

            severity = "MODERATE"

        else:

            severity = "LOW"


        # ==================================
        # FALLBACK RESPONSE
        # ==================================

        return {

            "message":
                "Citizen pollution report received "
                "and analyzed using fallback intelligence",

            "analysis_source":
                "AirTrace local fallback",

            "report":
                report_data,

            "ai_analysis": {

                "pollution_type":
                    pollution_type,

                "severity":
                    severity,

                "possible_source":
                    (
                        "Possible local combustion, "
                        "industrial, traffic, construction, "
                        "or other source. Source is not "
                        "confirmed from the citizen report alone."
                    ),

                "environmental_explanation":
                    (
                        "The reported observation may "
                        "indicate localized air pollution. "
                        "Additional sensor or environmental "
                        "data would be needed for confirmation."
                    ),

                "recommended_action":
                    (
                        "Authorities should verify the "
                        "reported location using local "
                        "air-quality measurements and "
                        "field inspection."
                    )
            }
        }