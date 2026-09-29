document.addEventListener("DOMContentLoaded", () => {

    const reportForm =
        document.getElementById("reportForm");

    const locationInput =
        document.getElementById("location");

    const problemInput =
        document.getElementById("problem");

    const descriptionInput =
        document.getElementById("description");

    const successMessage =
        document.getElementById("successMessage");


    // ==========================================
    // CHECK FORM
    // ==========================================

    if (!reportForm) {

        console.error(
            "AirTrace report form not found."
        );

        return;
    }


    // ==========================================
    // SUBMIT REPORT
    // ==========================================

    reportForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ======================================
            // READ FORM VALUES
            // ======================================

            const city =
                locationInput.value.trim();

            const problem =
                problemInput.value.trim();

            const description =
                descriptionInput.value.trim();


            // ======================================
            // VALIDATION
            // ======================================

            if (!city ||
                !problem ||
                !description) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            try {

                // ==================================
                // SHOW LOADING
                // ==================================

                successMessage.style.display =
                    "block";

                successMessage.textContent =
                    "Finding city location...";


                // ==================================
                // GET REAL CITY DATA
                // ==================================

                const locationData =
                    await apiRequest(
                        `/api/real-air-quality/${encodeURIComponent(city)}`
                    );


                console.log(
                    "Environmental data:",
                    locationData
                );


                // ==================================
                // CHECK CITY
                // ==================================

                if (
                    !locationData ||
                    locationData.error ||
                    locationData.latitude === undefined ||
                    locationData.longitude === undefined
                ) {

                    throw new Error(
                        `Could not find location for ${city}`
                    );

                }


                // ==================================
                // GET COORDINATES
                // ==================================

                const latitude =
                    locationData.latitude;

                const longitude =
                    locationData.longitude;


                // ==================================
                // COMBINE PROBLEM + DESCRIPTION
                // ==================================

                const fullDescription =
                    `${problem}: ${description}`;


                // ==================================
                // CREATE REPORT
                // ==================================

                const report = {

                    city: city,

                    description:
                        fullDescription,

                    latitude:
                        latitude,

                    longitude:
                        longitude

                };


                console.log(
                    "Submitting AirTrace report:",
                    report
                );


                // ==================================
                // SHOW SUBMITTING
                // ==================================

                successMessage.textContent =
                    "Submitting report...";


                // ==================================
                // SEND TO BACKEND
                // ==================================

                const response =
                    await submitCitizenReport(
                        report
                    );


                console.log(
                    "AirTrace backend response:",
                    response
                );


                // ==================================
                // SUCCESS
                // ==================================

                successMessage.style.display =
                    "block";

                successMessage.textContent =
                    "Report submitted successfully!";


                // ==================================
                // RESET FORM
                // ==================================

                reportForm.reset();


                // ==================================
                // HIDE MESSAGE AFTER 5 SECONDS
                // ==================================

                setTimeout(() => {

                    successMessage.style.display =
                        "none";

                }, 5000);


            } catch (error) {

                // ==================================
                // ERROR
                // ==================================

                console.error(
                    "AirTrace report submission failed:",
                    error
                );


                successMessage.style.display =
                    "block";

                successMessage.textContent =
                    "Unable to submit report. Please check the city name and try again.";

            }

        }
    );

});