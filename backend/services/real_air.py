import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen


# ==========================================
# OPEN-METEO GEOCODING
# ==========================================

GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)


# ==========================================
# OPEN-METEO AIR QUALITY
# ==========================================

AIR_QUALITY_URL = (
    "https://air-quality-api.open-meteo.com/v1/air-quality"
)


# ==========================================
# OPEN-METEO WEATHER
# ==========================================

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


# ==========================================
# HTTP HELPER
# ==========================================

def fetch_json(url, params):

    query = urlencode(params)

    full_url = f"{url}?{query}"

    request = Request(
        full_url,
        headers={
            "User-Agent": "AirTrace-AI/1.0"
        }
    )

    with urlopen(
        request,
        timeout=15
    ) as response:

        data = response.read()

        return json.loads(data)


# ==========================================
# CITY → COORDINATES
# ==========================================

def geocode_city(city):

    data = fetch_json(
        GEOCODING_URL,
        {
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json"
        }
    )

    results = data.get(
        "results",
        []
    )

    if not results:
        return None

    location = results[0]

    return {
        "name": location.get("name"),
        "country": location.get("country"),
        "country_code": location.get("country_code"),
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "timezone": location.get("timezone")
    }


# ==========================================
# RISK FROM PM2.5
# ==========================================

def calculate_pm25_risk(pm25):

    if pm25 is None:
        return "UNKNOWN"

    if pm25 >= 75:
        return "VERY HIGH"

    if pm25 >= 50:
        return "HIGH"

    if pm25 >= 35:
        return "MODERATE"

    return "LOW"


# ==========================================
# REAL ENVIRONMENTAL DATA
# ==========================================

def get_real_air_quality(city):

    location = geocode_city(city)

    if location is None:

        return {
            "error": "City not found"
        }


    latitude = location["latitude"]

    longitude = location["longitude"]


    # ======================================
    # AIR QUALITY
    # ======================================

    air_data = fetch_json(

        AIR_QUALITY_URL,

        {
            "latitude": latitude,
            "longitude": longitude,

            "current": (
                "pm2_5,"
                "pm10,"
                "us_aqi"
            ),

            "timezone": "auto"
        }
    )


    current_air = air_data.get(
        "current",
        {}
    )


    # ======================================
    # WEATHER
    # ======================================

    weather_data = fetch_json(

        WEATHER_URL,

        {
            "latitude": latitude,
            "longitude": longitude,

            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "wind_speed_10m"
            ),

            "timezone": "auto"
        }
    )


    current_weather = weather_data.get(
        "current",
        {}
    )


    # ======================================
    # EXTRACT VALUES
    # ======================================

    pm25 = current_air.get(
        "pm2_5"
    )

    pm10 = current_air.get(
        "pm10"
    )

    us_aqi = current_air.get(
        "us_aqi"
    )

    temperature = current_weather.get(
        "temperature_2m"
    )

    humidity = current_weather.get(
        "relative_humidity_2m"
    )

    wind_speed = current_weather.get(
        "wind_speed_10m"
    )


    # ======================================
    # RISK
    # ======================================

    risk = calculate_pm25_risk(
        pm25
    )


    return {

        "city":
        location["name"],

        "country":
        location["country"],

        "country_code":
        location["country_code"],

        "latitude":
        latitude,

        "longitude":
        longitude,

        "pm25":
        pm25,

        "pm10":
        pm10,

        "us_aqi":
        us_aqi,

        "temperature":
        temperature,

        "humidity":
        humidity,

        "wind_speed":
        wind_speed,

        "risk":
        risk,

        "data_source":
        "Open-Meteo environmental model data"

    }