from services.real_air import get_real_air_quality


# Temporary storage.
# Later we can replace this with a database.
CITIZEN_REPORTS = []


def add_citizen_report(report):
    """
    Store a citizen pollution report.
    """

    CITIZEN_REPORTS.append(report)

    return report


def get_citizen_reports():
    """
    Return all citizen pollution reports.
    """

    return CITIZEN_REPORTS


def determine_report_risk(description):
    """
    Estimate risk from the citizen's description.
    This is a prototype rule-based signal.
    """

    description = description.lower()

    if any(word in description for word in [
        "heavy",
        "thick",
        "severe",
        "large fire",
        "strong smoke"
    ]):
        return "HIGH"

    if any(word in description for word in [
        "smoke",
        "burning",
        "fire",
        "dust",
        "chemical",
        "gas",
        "industrial",
        "factory"
    ]):
        return "MODERATE"

    return "LOW"


def determine_environmental_risk(pm25):
    """
    Estimate environmental risk from current PM2.5.
    """

    if pm25 is None:
        return "UNKNOWN"

    if pm25 >= 75:
        return "VERY HIGH"

    if pm25 >= 50:
        return "HIGH"

    if pm25 >= 35:
        return "MODERATE"

    return "LOW"


def combine_risk(environmental_risk, citizen_risk, report_count):
    """
    Combine environmental and citizen signals
    into one hotspot risk level.
    """

    environmental_score = {
        "LOW": 1,
        "MODERATE": 2,
        "HIGH": 3,
        "VERY HIGH": 4
    }

    citizen_score = {
        "LOW": 0,
        "MODERATE": 1,
        "HIGH": 2
    }

    score = environmental_score.get(
        environmental_risk,
        0
    )

    score += citizen_score.get(
        citizen_risk,
        0
    )

    # More citizen reports increase confidence
    # that the location deserves attention.
    if report_count >= 3:
        score += 2

    elif report_count >= 2:
        score += 1

    if score >= 6:
        return "VERY HIGH"

    if score >= 4:
        return "HIGH"

    if score >= 2:
        return "MODERATE"

    return "LOW"


def calculate_hotspot_intelligence():
    """
    Combine current environmental data
    with citizen observations.
    """

    hotspots = []

    # -------------------------------------------------
    # CITIZEN SIGNALS
    # -------------------------------------------------

    for report in CITIZEN_REPORTS:

        city = report["city"]

        description = report["description"]

        citizen_risk = determine_report_risk(
            description
        )

        # ---------------------------------------------
        # Get current environmental data
        # ---------------------------------------------

        try:

            air_data = get_real_air_quality(city)

        except Exception:

            air_data = None

        if air_data:

            pm25 = air_data.get("pm25")

            environmental_risk = (
                determine_environmental_risk(pm25)
            )

            latitude = air_data.get(
                "latitude",
                report["latitude"]
            )

            longitude = air_data.get(
                "longitude",
                report["longitude"]
            )

        else:

            pm25 = None

            environmental_risk = "UNKNOWN"

            latitude = report["latitude"]

            longitude = report["longitude"]

        # ---------------------------------------------
        # Count reports from the same city
        # ---------------------------------------------

        report_count = sum(
            1
            for item in CITIZEN_REPORTS
            if item["city"].lower() == city.lower()
        )

        final_risk = combine_risk(
            environmental_risk,
            citizen_risk,
            report_count
        )

        evidence = []

        if pm25 is not None:

            evidence.append(
                f"Current PM2.5: {pm25}"
            )

        evidence.append(
            f"Citizen observation: {description}"
        )

        evidence.append(
            f"Citizen reports from this city: {report_count}"
        )

        # ---------------------------------------------
        # Recommended action
        # ---------------------------------------------

        if final_risk == "VERY HIGH":

            recommended_action = (
                "Prioritize immediate verification of "
                "this location using local air-quality "
                "measurements and field inspection."
            )

        elif final_risk == "HIGH":

            recommended_action = (
                "Prioritize verification of this location "
                "using local air-quality measurements and "
                "field inspection."
            )

        elif final_risk == "MODERATE":

            recommended_action = (
                "Monitor this location and collect additional "
                "environmental and citizen observations."
            )

        else:

            recommended_action = (
                "Continue monitoring local environmental "
                "conditions."
            )

        # ---------------------------------------------
        # Data source
        # ---------------------------------------------

        if air_data:

            source = (
                "Open-Meteo environmental data "
                "+ Citizen observations"
            )

        else:

            source = "Citizen observation"

        hotspots.append({

            "city": city,

            "latitude": latitude,

            "longitude": longitude,

            "risk": final_risk,

            "pm25": pm25,

            "citizen_reports": report_count,

            "environmental_risk": environmental_risk,

            "citizen_risk": citizen_risk,

            "evidence": evidence,

            "source": source,

            "recommended_action": recommended_action

        })

    return hotspots


def get_map_hotspots():
    """
    Return geographic citizen hotspot points
    for frontend map visualization.
    """

    map_points = []

    for report in CITIZEN_REPORTS:

        risk = determine_report_risk(
            report["description"]
        )

        map_points.append({

            "city": report["city"],

            "latitude": report["latitude"],

            "longitude": report["longitude"],

            "risk": risk,

            "description": report["description"],

            "source": "Citizen observation"

        })

    return map_points