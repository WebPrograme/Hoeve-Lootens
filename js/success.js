import { postRequest } from '../modules/Requests.js';

const stars = document.querySelectorAll('.review-stars i');

stars.forEach((star) => {
	star.addEventListener('click', () => {
		stars.forEach((s) => s.classList.replace('fa-solid', 'fa-regular'));
		const starIndex = Array.from(stars).indexOf(star);

		for (let i = 0; i <= starIndex; i++) {
			stars[i].classList.replace('fa-regular', 'fa-solid');
		}
	});
});

const validateReview = () => {
	const selectedStars = Array.from(stars).filter((star) => star.classList.contains('fa-solid'));
	const feedback = document.querySelector('.review textarea').value;

	if (selectedStars.length === 0) {
		document.getElementById('review-rating-error').style.display = 'block';
		return false;
	}

	if (feedback.trim() === '') {
		document.getElementById('review-feedback-error').style.display = 'block';
		return false;
	}

	return true;
};

document.querySelector('.review-submit').addEventListener('click', () => {
	const selectedStars = Array.from(stars).filter((star) => star.classList.contains('fa-solid'));
	const rating = selectedStars.length;
	const feedback = document.querySelector('.review textarea').value;
	const userCode = new URLSearchParams(window.location.search).get('usercode');
	const event = new URLSearchParams(window.location.search).get('event');

	if (!validateReview()) {
		return;
	}

	postRequest('/api/feedback/submit', {
		Rating: rating,
		Comment: feedback,
		UserCode: userCode,
		Event: event,
	}).then((response) => {
		document.querySelector('.review').style.display = 'none';
		document.querySelector('.review-submitted').style.display = 'flex';
	});
});
