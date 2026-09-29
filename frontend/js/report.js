document.addEventListener("DOMContentLoaded", () => {

    const reportForm = document.getElementById("reportForm");

    const locationInput =
        document.getElementById("location");

    const problemInput =
        document.getElementById("problem");

    const descriptionInput =
        document.getElementById("description");

    const successMessage =
        document.getElementById("successMessage");


    if (!reportForm) {

        console.error(
            "AirTrace report form not found."
        );

        return;
    }


    reportForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const city =
                locationInput.value.trim();

            const problem =
                problemInput.value.trim();

            const description =
                descriptionInput.value.trim();


            if (!city ||
                !problem ||
                !description) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            /*
             * Prototype city coordinates.
             *
             * Later we can replace this
             * with real browser GPS.
             */

            const CITY_COORDINATES = {

                "Delhi": {
                    latitude: 28.6139,
                    longitude: 77.2090
                },

                "Mumbai": {
                    latitude: 19.0760,
                    longitude: 72.8777
                },

                "Kolkata": {
                    latitude: 22.5726,
                    longitude: 88.3639
                },

                "Bengaluru": {
                    latitude: 12.9716,
                    longitude: 77.5946
                },

                "Hyderabad": {
                    latitude: 17.3850,
                    longitude: 78.4867
                }

            };


            /*
             * Match the typed city
             * with our supported cities.
             */

            const cityKey =
                Object.keys(CITY_COORDINATES)
                    .find(
                        name =>
                            name.toLowerCase() ===
                            city.toLowerCase()
                    );


            if (!cityKey) {

                alert(
                    "For the current prototype, please enter Delhi, Mumbai, Kolkata, Bengaluru, or Hyderabad."
                );

                return;
            }


            const coordinates =
                CITY_COORDINATES[cityKey];


            /*
             * Combine problem type
             * and citizen description.
             */

            const fullDescription =
                `${problem}: ${description}`;


            /*
             * Data sent to FastAPI.
             */

            const report = {

                city: cityKey,

                description:
                    fullDescription,

                latitude:
                    coordinates.latitude,

                longitude:
                    coordinates.longitude

            };


            console.log(
                "Submitting AirTrace report:",
                report
            );


            try {

                /*
                 * Show submitting state.
                 */

                successMessage.style.display =
                    "block";

                successMessage.textContent =
                    "Submitting report...";


                /*
                 * Send report to FastAPI.
                 */

                const response =
                    await submitCitizenReport(
                        report
                    );


                console.log(
                    "AirTrace backend response:",
                    response
                );


                /*
                 * Show success.
                 */

                successMessage.textContent =
                    "Report submitted successfully!";


                /*
                 * Clear form.
                 */

                reportForm.reset();


                /*
                 * Keep success message
                 * visible for a few seconds.
                 */

                setTimeout(() => {

                    successMessage.style.display =
                        "none";

                }, 5000);


            } catch (error) {

                console.error(
                    "AirTrace report submission failed:",
                    error
                );


                successMessage.style.display =
                    "block";

                successMessage.textContent =
                    "Unable to submit report. Please make sure the AirTrace backend is running.";

            }

        }
    );

});