import { getRequest, postRequest } from './Requests.js';

export default class Form {
	constructor(formID, containerSelector = '.form-container', afterInitCallback = null) {
		this.formID = formID;
		this.container = document.querySelector(containerSelector);
		this.fields = [];
		this.afterInitCallback = afterInitCallback;

		this.init();
	}

	async init() {
		this.container.classList.add('form');
		await this.getFormData();
		this.renderForm();

		if (this.afterInitCallback && typeof this.afterInitCallback === 'function') {
			this.afterInitCallback();
		}
	}

	async getFormData() {
		try {
			this.formData = await getRequest(`/api/forms/${this.formID}`);
			this.formData = this.formData.data; // Access the 'data' property of the response
			this.successMessage = this.formData.SuccessMessage || 'Thank you for your submission!';
			this.errorMessage = this.formData.ErrorMessage || 'There was an error submitting the form. Please try again.';
		} catch (error) {
			console.error('Error fetching form data:', error);
		}
	}

	generateLetterID(length = 10) {
		const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * letters.length);
			result += letters.charAt(randomIndex);
		}

		return result;
	}

	renderForm() {
		if (!this.formData || !this.formData.Fields || this.formData.Fields.length === 0) {
			console.error('No form data available to render.');
			return;
		}

		// Adding fields to the form based on the fetched data
		Object.values(this.formData.Fields).forEach((field) => {
			const formElement = this.createFormElement(field.Label, field.Type, field.Placeholder || '');
			this.container.appendChild(formElement);
		});

		// Adding a submit button to the form
		const submitButton = document.createElement('a');
		submitButton.classList.add('btn', 'btn-primary', 'btn-lg');
		submitButton.id = this.formID;
		submitButton.textContent = this.formData.SubmitText || 'Submit';
		submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.submitForm();
		});

		this.container.appendChild(submitButton);
	}

	createFormElement(label, type, placeholder = '') {
		const element = document.createElement('div');
		const randomId = this.generateLetterID();

		if (type === 'textarea') {
			element.innerHTML = `<label for="${randomId}">${label}</label>
            <textarea id="${randomId}" placeholder="${placeholder ? placeholder : label}" name="${label}"></textarea>`;
			this.fields.push({ id: randomId, type: 'textarea', name: label });
		} else if (type === 'text' || type === 'email' || type === 'number' || type === 'tel') {
			element.innerHTML = `<label for="${randomId}">${label}</label>
            <input type="${type}" id="${randomId}" placeholder="${placeholder ? placeholder : label}" class="input" name="${label}" />`;
			this.fields.push({ id: randomId, type: type, name: label });
		} else if (type === 'hidden') {
			element.innerHTML = `<input type="hidden" id="${randomId}" value="${placeholder}" name="${label}" />`;
			this.fields.push({ id: randomId, type: 'hidden', name: label });
		} else if (type === 'stars') {
			element.innerHTML = `<label>${label}</label>
            <div class="review-stars">
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
            </div>
            <div id="review-rating-error" style="display: none; color: red;">Please select a rating.</div>`;

			this.addStarRatingListener(element.querySelectorAll('.review-stars i'));
			this.fields.push({ id: randomId, type: 'stars', name: label });
		}

		return element;
	}

	addStarRatingListener(stars) {
		stars.forEach((star) => {
			star.addEventListener('click', () => {
				stars.forEach((s) => s.classList.replace('fa-solid', 'fa-regular'));
				const starIndex = Array.from(stars).indexOf(star);

				for (let i = 0; i <= starIndex; i++) {
					stars[i].classList.replace('fa-regular', 'fa-solid');
				}
			});
		});
	}

	getStarRating() {
		const stars = document.querySelectorAll('.review-stars i');
		const selectedStars = Array.from(stars).filter((star) => star.classList.contains('fa-solid'));
		return selectedStars.length;
	}

	submitForm() {
		const isValid = this.validateForm();

		if (!isValid) {
			console.error('Form validation failed. Please correct the errors and try again.');
			return;
		}

		const payload = this.generatePayload();

		try {
			postRequest(`/api/forms/submissions/add`, payload)
				.then((response) => {
					this.showSuccessMessage();
				})
				.catch((error) => {
					console.error('Error during form submission:', error);
					this.showErrorMessage();
				});
		} catch (error) {
			console.error('Unexpected error during form submission:', error);
		}
	}

	validateForm() {
		let isValid = true;

		for (const field of this.fields) {
			if (field.type !== 'stars' && field.type !== 'hidden') {
				const element = document.getElementById(field.id);
				const value = element.value;
				element.classList.remove('error');

				if (field.type === 'email' && !this.validateEmail(value)) {
					isValid = false;
					element.classList.add('error');
				}

				if (field.type === 'tel' && !this.validatePhone(value)) {
					isValid = false;
					element.classList.add('error');
				}

				if (field.type === 'number') {
					if (isNaN(value)) {
						isValid = false;
						element.classList.add('error');
					}
				}

				if (field.type === 'text' && value.length < 2) {
					isValid = false;
					element.classList.add('error');
				}

				if (field.type === 'textarea' && value.length < 1) {
					isValid = false;
					element.classList.add('error');
				}
			} else if (field.type === 'stars' && this.getStarRating() === 0) {
				isValid = false;
				document.getElementById('review-rating-error').style.display = 'block';
			} else if (field.type === 'hidden' && !document.getElementById(field.id).value) {
				isValid = false;
			}
		}
		return isValid;
	}

	validateEmail(email) {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailPattern.test(email);
	}

	validatePhone(phone) {
		const phonePattern = /^\+?[0-9\s\-()]{7,}$/;
		return phonePattern.test(phone);
	}

	generatePayload() {
		const payload = {};

		for (const field of this.fields) {
			const element = document.getElementById(field.id);

			if (field.type === 'stars') {
				payload[field.name] = this.getStarRating();
			}

			if (field.type === 'number') {
				payload[field.name] = parseInt(element.value.trim());
			}

			if (field.type === 'hidden' || field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'textarea') {
				payload[field.name] = element.value.trim();
			}
		}

		return {
			FormId: this.formID,
			Values: payload,
		};
	}

	showSuccessMessage() {
		this.container.innerHTML = `<p>${this.successMessage}</p>`;
	}

	showErrorMessage() {
		this.container.innerHTML = `<p>${this.errorMessage}</p>`;
	}

	setFieldValue(fieldName, value) {
		const field = this.fields.find((f) => f.name === fieldName);
		if (field) {
			const element = document.getElementById(field.id);
			if (element) {
				element.value = value;
			}
		} else {
			console.warn(`Field with name "${fieldName}" not found.`);
		}
	}
}
