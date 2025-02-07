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



const reviewForm = document.getElementById('reviewForm');
    const reviewList = document.getElementById('reviewList');
    const USER_ID = `user_${Date.now()}`; // Unique user ID for this session

    // Load reviews from Firestore
    async function loadReviews() {
        const reviewsSnapshot = await db.collection('reviews').get();
        reviewsSnapshot.forEach(doc => {
            const review = doc.data();
            displayReview(review);
        });
    }

    // Display a single review
    function displayReview(review) {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');

        const commentPara = document.createElement('p');
        commentPara.textContent = `Comment: ${review.comment}`;
        commentPara.setAttribute('contenteditable', 'false');

        const ratingPara = document.createElement('p');
        ratingPara.textContent = `Rating: ${review.rating || 'No rating'}`;

        const datePara = document.createElement('p');
        datePara.textContent = `Date: ${review.date}`;

        if (review.image) {
            const imageElement = document.createElement('img');
            imageElement.src = review.image;
            imageElement.alt = "Attached Image";
            reviewDiv.appendChild(imageElement);
        }

        // Add buttons only if the review belongs to the current user
        if (review.userId === USER_ID) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => {
                commentPara.contentEditable = "true";
                commentPara.focus();
            });

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.classList.add('save-btn');
            saveButton.addEventListener('click', () => {
                commentPara.contentEditable = "false";
                review.comment = commentPara.textContent.replace('Comment: ', '');
                updateReview(review);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => {
                deleteReview(review);
                reviewList.removeChild(reviewDiv);
            });

            reviewDiv.appendChild(editButton);
            reviewDiv.appendChild(saveButton);
            reviewDiv.appendChild(deleteButton);
        }

        reviewDiv.appendChild(commentPara);
        reviewDiv.appendChild(ratingPara);
        reviewDiv.appendChild(datePara);

        reviewList.appendChild(reviewDiv);
    }

    // Add a new review
    reviewForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const comment = document.getElementById('comment').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const date = new Date().toLocaleString();
        const imageInput = document.getElementById('image');
        const imageFile = imageInput.files[0];

        let imageBase64 = null;
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = async function(event) {
                imageBase64 = event.target.result; // Base64 encoded string
                const newReview = {
                    comment,
                    rating,
                    date,
                    image: imageBase64,
                    userId: USER_ID
                };

                await saveAndDisplayReview(newReview);
            };
            reader.readAsDataURL(imageFile);
        } else {
            const newReview = { comment, rating, date, image: null, userId: USER_ID };
            await saveAndDisplayReview(newReview);
        }

        reviewForm.reset();
    });

    // Save and display the review
    async function saveAndDisplayReview(newReview) {
        try {
            const docRef = await db.collection('reviews').add(newReview);
            newReview.id = docRef.id;  // Add Firestore document ID
            displayReview(newReview);
        } catch (error) {
            console.error('Error saving review: ', error);
        }
    }

    // Update a review in Firestore
    async function updateReview(updatedReview) {
        try {
            const reviewRef = db.collection('reviews').doc(updatedReview.id);
            await reviewRef.update({
                comment: updatedReview.comment,
            });
        } catch (error) {
            console.error('Error updating review: ', error);
        }
    }

    // Delete a review from Firestore
    async function deleteReview(reviewToDelete) {
        try {
            const reviewRef = db.collection('reviews').doc(reviewToDelete.id);
            await reviewRef.delete();
        } catch (error) {
            console.error('Error deleting review: ', error);
        }
    }

    // Load reviews on page load
    loadReviews();