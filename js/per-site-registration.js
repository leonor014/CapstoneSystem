
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCt1EginvMZvYdlrseVPBiyvfto4bvED5Y",
    authDomain: "sagadatouristregister.firebaseapp.com",
    projectId: "sagadatouristregister",
    storageBucket: "sagadatouristregister.firebasestorage.app",
    messagingSenderId: "875774905793",
    appId: "1:875774905793:web:d4fe2ea42fedba8d473340",
    measurementId: "G-2VF5GCQGZ1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Getting Firestore instance

     // Ensure that script only runs after the DOM is fully loaded
    document.addEventListener("DOMContentLoaded", function () {
        
        // Handle fetch details when user clicks "Fetch Details"
        document.getElementById("fetchDetails").addEventListener("click", async () => {
            const regNumber = document.getElementById("registrationNumber").value; // Get registration number from input

            try {
                // Query Firestore to find documents where 'registrationNumber' field matches the input value
                const q = query(collection(db, "registrations"), where("registrationNumber", "==", regNumber));
                
                const querySnapshot = await getDocs(q); // Execute the query

                if (!querySnapshot.empty) {
                    // Document found, process it
                    const tourist = querySnapshot.docs[0].data(); // Get the first document's data
                    console.log(tourist);  // Log tourist data to the console for debugging

                    const detailsSection = document.getElementById("detailsSection");
                    const touristDetails = document.getElementById("touristDetails");
                    const attendanceSection = document.getElementById("attendanceSection");

                    touristDetails.innerHTML = ""; // Clear previous content
                    attendanceSection.innerHTML = ""; // Clear previous attendance content

                    // Check if tourist data exists and is valid
                    if (tourist.type === "Individual") {
                        const details = tourist.details;
                        console.log("Rendering Individual details");
                        touristDetails.innerHTML = `
                            <p><strong>Name:</strong> ${details.name}</p>
                            <p><strong>Date of Birth:</strong> ${details.dob}</p>
                            <p><strong>Sex:</strong> ${details.sex}</p>
                            <p><strong>Country:</strong> ${details.country}</p>
                            <p><strong>Region:</strong> ${details.region}</p>
                            <p><strong>Contact:</strong> ${details.contact}</p>
                            <p><strong>Email:</strong> ${details.email}</p>
                        `;

                        // Add attendance section for individual
                        attendanceSection.innerHTML = `
                            <div class="member">
                                <label>
                                    <input type="checkbox" name="attendance" value="${details.name}" checked> ${details.name}
                                </label>
                            </div>
                        `;
                    } else if (tourist.type === "Group") {
                        const groupDetails = tourist.details;
                        touristDetails.innerHTML = `
                            <p><strong>Group Name:</strong> ${groupDetails.groupName}</p>
                            <p><strong>Country:</strong> ${groupDetails.country}</p>
                            <p><strong>Region:</strong> ${groupDetails.region}</p>
                            <p><strong>Contact:</strong> ${groupDetails.contact}</p>
                            <p><strong>Email:</strong> ${groupDetails.email}</p>
                        `;

                        // Add attendance section for each group member
                        tourist.members.forEach(member => {
                            attendanceSection.innerHTML += `
                                <div class="member">
                                    <p><strong>Name:</strong> ${member.name}</p>
                                    <p><strong>Date of Birth:</strong> ${member.dob}</p>
                                    <p><strong>Sex:</strong> ${member.sex}</p>
                                    <label>
                                        <input type="checkbox" name="attendance" value="${member.name}" checked> Mark Present
                                    </label>
                                </div>
                            `;
                        });
                    }

                    // Make sure the details section is visible
                    detailsSection.style.display = "block";
                } else {
                    alert("Registration number not found.");
                }
            } catch (error) {
                console.error("Error fetching data from Firebase:", error);
                alert("There was an error fetching the details. Please try again later.");
            }
        });

        // Handle attendance submission
        document.getElementById("siteRegistrationForm").addEventListener("submit", (event) => {
            event.preventDefault();
            const attendance = Array.from(document.querySelectorAll("input[name='attendance']:checked"))
                .map(input => input.value);

            alert(`Attendance submitted for: ${attendance.join(", ")}`);
        });
    });