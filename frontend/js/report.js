document.addEventListener("DOMContentLoaded", () => {
    const reportForm = document.getElementById("reportForm");
    const locationInput = document.getElementById("location");
    const problemInput = document.getElementById("problem");
    const descriptionInput = document.getElementById("description");
    const successMessage = document.getElementById("successMessage");

    if (!reportForm) {
        console.error("AirTrace report form not found.");
        return;
    }

    // Coordinates for common Indian cities.
    // This avoids depending on Open-Meteo just to submit a citizen report.
    const CITY_COORDINATES = {
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
        "Srinagar": [34.0837, 74.7973],
        "Kathua": [32.3694, 75.5254]
    };

    reportForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const city = locationInput.value.trim();
        const problem = problemInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!city || !problem || !description) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            successMessage.style.display = "block";
            successMessage.textContent = "Preparing report...";

            // Find coordinates locally first.
            const cityKey = Object.keys(CITY_COORDINATES).find(
                name => name.toLowerCase() === city.toLowerCase()
            );

            if (!cityKey) {
                throw new Error(
                    "City not available in the current report database."
                );
            }

            const [latitude, longitude] = CITY_COORDINATES[cityKey];

            const fullDescription = `${problem}: ${description}`;

            const report = {
                city: cityKey,
                description: fullDescription,
                latitude: latitude,
                longitude: longitude
            };

            console.log("Submitting AirTrace report:", report);

            successMessage.textContent = "Submitting report...";

            const response = await submitCitizenReport(report);

            console.log("AirTrace backend response:", response);

            successMessage.textContent = "Report submitted successfully!";

            reportForm.reset();

            setTimeout(() => {
                successMessage.style.display = "none";
            }, 5000);

        } catch (error) {
            console.error("AirTrace report submission failed:", error);

            successMessage.style.display = "block";
            successMessage.textContent =
                error.message || "Unable to submit report.";
        }
    });
});