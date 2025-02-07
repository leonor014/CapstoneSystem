import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  // Handle form submission
document.getElementById("registrationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const isGroup = document.getElementById("groupRegistration").value === "group";
    const registrationNumber = `REG-${Date.now()}${isGroup ? "-G" : "-I"}`;

    const formData = {
        registrationNumber: registrationNumber,
        dateOfRegistration: document.getElementById("dateOfRegistration").value,
        registrationType: isGroup ? "group" : "individual",
    };

    // Get other fields based on registration type
    if (isGroup) {
        formData.groupName = document.getElementById("groupName").value;
        formData.groupSize = document.getElementById("groupSize").value;
        formData.groupCountry = document.getElementById("groupCountry").value;
        formData.groupRegion = document.getElementById("groupRegion").value;
        formData.groupContact = document.getElementById("groupContact").value;
        formData.groupEmail = document.getElementById("groupEmail").value;
        
        // Handle the photo as Base64
        const groupPhotoFile = document.getElementById("groupPhoto").files[0];
        if (groupPhotoFile) {
            convertToBase64(groupPhotoFile, (base64Photo) => {
                formData.groupPhoto = base64Photo;

                // Proceed with Firestore submission after conversion
                submitToFirestore(formData, registrationNumber);
            });
        } else {
            // No group photo provided
            formData.groupPhoto = null;
            submitToFirestore(formData, registrationNumber);
        }

        const members = [];
        for (let i = 1; i <= formData.groupSize; i++) {
            members.push({
                memberName: document.querySelector(`[name="memberName${i}"]`).value,
                memberDOB: document.querySelector(`[name="memberDOB${i}"]`).value,
                memberSex: document.querySelector(`[name="memberSex${i}"]`).value
            });
        }
        formData.groupMembers = members;
    } else {
        formData.fullName = document.getElementById("fullName").value;
        formData.dateOfBirth = document.getElementById("dateOfBirth").value;
        formData.sex = document.getElementById("sex").value;
        formData.country = document.getElementById("country").value;
        formData.region = document.getElementById("region").value;
        formData.contactNumber = document.getElementById("contactNumber").value;
        formData.email = document.getElementById("email").value;
        
        // Handle individual photo as Base64
        const uploadPhotoFile = document.getElementById("uploadPhoto").files[0];
        if (uploadPhotoFile) {
            convertToBase64(uploadPhotoFile, (base64Photo) => {
                formData.uploadPhoto = base64Photo;

                // Proceed with Firestore submission after conversion
                submitToFirestore(formData, registrationNumber);
            });
        } else {
            // No individual photo provided
            formData.uploadPhoto = null;
            submitToFirestore(formData, registrationNumber);
        }
    }
});

// Function to convert a file to Base64
function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onloadend = function () {
        callback(reader.result); // This will be the Base64 string
    };
    reader.readAsDataURL(file); // Convert the file to Base64
}

// Function to submit data to Firestore
function submitToFirestore(formData, registrationNumber) {
    try {
        // Push data to Firestore collection
        const registrationsCollection = collection(db, "registrations"); // Get the 'registrations' collection
        addDoc(registrationsCollection, formData) // Add the form data to Firestore
            .then(() => {
                alert(`Registration successful! Your registration number is: ${registrationNumber}`);
                document.getElementById("registrationForm").reset(); // Reset form after submission
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    } catch (error) {
        console.error("Error in Firestore submission:", error);
    }
}