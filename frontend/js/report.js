document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("reportForm");

    if (!form) {
        console.error("Report form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const cityInput = document.getElementById("city");
        const problemInput = document.getElementById("problem");
        const descriptionInput = document.getElementById("description");

        const city = cityInput.value.trim();
        const problem = problemInput ? problemInput.value.trim() : "";
        const description = descriptionInput.value.trim();

        if (!city) {
            alert("Please enter a city.");
            return;
        }

        if (!description) {
            alert("Please describe the pollution problem.");
            return;
        }

        /*
         * We no longer restrict reports to five cities.
         * The backend can process cities dynamically.
         */

        const finalDescription = problem
            ? `${problem}: ${description}`
            : description;

        try {

            // Get real coordinates for the entered city
            const locationResponse = await fetch(
                `${API_BASE_URL}/api/real-air-quality/${encodeURIComponent(city)}`
            );

            if (!locationResponse.ok) {
                throw new Error(
                    `Unable to find environmental data for ${city}`
                );
            }

            const locationData = await locationResponse.json();

            if (
                locationData.error ||
                locationData.latitude === undefined ||
                locationData.longitude === undefined
            ) {
                throw new Error(
                    `Could not locate ${city}. Please check the spelling.`
                );
            }

            const report = {
                city: city,
                description: finalDescription,
                latitude: locationData.latitude,
                longitude: locationData.longitude
            };

            console.log("Submitting citizen report:", report);

            const result = await submitCitizenReport(report);

            console.log("Report submitted successfully:", result);

            alert("Citizen pollution report submitted successfully! 🌱");

            form.reset();

        } catch (error) {

            console.error("Citizen report submission error:", error);

            alert(
                "Unable to submit report.\n\n" +
                "Please check the city name and try again."
            );
        }
    });
});