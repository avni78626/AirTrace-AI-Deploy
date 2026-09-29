CITY_DATA = {
    "Delhi": {
        "pm25": 78,
        "pm10": 126,
        "temperature": 36,
        "humidity": 42
    },

    "Mumbai": {
        "pm25": 52,
        "pm10": 91,
        "temperature": 31,
        "humidity": 68
    },

    "Kolkata": {
        "pm25": 64,
        "pm10": 108,
        "temperature": 33,
        "humidity": 61
    },

    "Bengaluru": {
        "pm25": 32,
        "pm10": 57,
        "temperature": 28,
        "humidity": 70
    },

    "Hyderabad": {
        "pm25": 45,
        "pm10": 76,
        "temperature": 30,
        "humidity": 55
    }
}


def get_air_quality(city: str):
    city_data = CITY_DATA.get(city)

    if city_data is None:
        return None

    pm25 = city_data["pm25"]

    if pm25 >= 75:
        risk = "VERY HIGH"
    elif pm25 >= 50:
        risk = "HIGH"
    elif pm25 >= 35:
        risk = "MODERATE"
    else:
        risk = "LOW"

    return {
        "city": city,
        "pm25": city_data["pm25"],
        "pm10": city_data["pm10"],
        "temperature": city_data["temperature"],
        "humidity": city_data["humidity"],
        "risk": risk
    }


def get_hotspots():
    hotspots = []

    for city, data in CITY_DATA.items():

        pm25 = data["pm25"]

        if pm25 >= 75:
            risk = "VERY HIGH"
        elif pm25 >= 50:
            risk = "HIGH"
        elif pm25 >= 35:
            risk = "MODERATE"
        else:
            risk = "LOW"

        if risk in ["VERY HIGH", "HIGH"]:
            hotspots.append({
                "city": city,
                "pm25": pm25,
                "pm10": data["pm10"],
                "risk": risk
            })

    return hotspots