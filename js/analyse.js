import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js';

const cookiesAgree = localStorage.getItem('cookiesAgree');
let analytics;

if (cookiesAgree === 'true') {
	document.querySelector('.cookie').style.display = 'none';

	const firebaseConfig = {
		apiKey: 'AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA',
		authDomain: 'hoeve-lootens-497f9.firebaseapp.com',
		projectId: 'hoeve-lootens-497f9',
		storageBucket: 'hoeve-lootens-497f9.appspot.com',
		messagingSenderId: '175696391830',
		appId: '1:175696391830:web:6e836280bf7b23259a1cb7',
		measurementId: 'G-6LXS0WL2CT',
	};

	// Initialize Firebase
	const app = initializeApp(firebaseConfig);
	analytics = getAnalytics(app);
} else {
	document.querySelector('.cookie').style.display = 'block';
}

// Function to log event
function log(event, data = {}) {
	logEvent(analytics, event, data);
}

export default { log };
