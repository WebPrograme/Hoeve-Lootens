// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA",
    authDomain: "hoeve-lootens-497f9.firebaseapp.com",
    projectId: "hoeve-lootens-497f9",
    storageBucket: "hoeve-lootens-497f9.appspot.com",
    messagingSenderId: "175696391830",
    appId: "1:175696391830:web:6e836280bf7b23259a1cb7",
    measurementId: "G-6LXS0WL2CT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const cookiesAgree = localStorage.getItem('cookiesAgree');

if (cookiesAgree === 'true') {
    document.querySelector('.cookie').style.display = 'none';
} else {
    document.querySelector('.cookie').style.display = 'block';
}