import { postRequest } from '../modules/Requests.js';

const rentForm = document.querySelector('.rent-form');
const rentFormNext = document.querySelector('.rent-form-next');
let rentFormValues = {};

// Get next section
function getNextSection(section) {
	const currentSectionID = section.id;
	let nextSectionID = '';

	if (currentSectionID === 'rent-form-space') {
		const space = section.querySelector('input:checked').id;

		if (space === 'rent-form-space-1') {
			nextSectionID = 'rent-form-eventType';
		} else if (space === 'rent-form-space-2') {
			nextSectionID = 'rent-form-email';
		}
	} else if (currentSectionID === 'rent-form-eventType') {
		const eventType = section.querySelector('input:checked').id;

		if (eventType === 'rent-form-eventType-1') {
			nextSectionID = 'rent-form-private-date';
		} else if (eventType === 'rent-form-eventType-2') {
			nextSectionID = 'rent-form-public-date';
		}
	} else if (currentSectionID === 'rent-form-private-date') {
		nextSectionID = 'rent-form-private-name';
	} else if (currentSectionID === 'rent-form-public-date') {
		nextSectionID = 'rent-form-public-name';
	} else if (currentSectionID === 'rent-form-private-name') {
		nextSectionID = 'rent-form-submit';
	} else if (currentSectionID === 'rent-form-public-name') {
		nextSectionID = 'rent-form-public-participants';
	} else if (currentSectionID === 'rent-form-public-participants') {
		nextSectionID = 'rent-form-submit';
	} else if (currentSectionID === 'rent-form-submit') {
		// Submit form
		submitForm();
	}

	return document.getElementById(nextSectionID);
}

// Add values to rentFormValues
function addValuesToRentFormValues(section) {
	const currentSectionID = section.id;

	if (currentSectionID === 'rent-form-space') {
		const space = section.querySelector('input:checked').id;

		if (space === 'rent-form-space-1') {
			rentFormValues.Space = 'Boomgaard & Horecablok';
		} else if (space === 'rent-form-space-2') {
			rentFormValues.Space = 'Woonhuis / vergaderzaal';
		} else if (space === 'rent-form-space-3') {
			rentFormValues.Space = 'Polyvalente ruimtes';
		}
	} else if (currentSectionID === 'rent-form-eventType') {
		const eventType = section.querySelector('input:checked').id;

		if (eventType === 'rent-form-eventType-1') {
			rentFormValues.Type = 'Privé';
		} else if (eventType === 'rent-form-eventType-2') {
			rentFormValues.Type = 'Publiek';
		}
	} else if (currentSectionID === 'rent-form-private-date') {
		rentFormValues.Date = section.querySelector('input').value;
	} else if (currentSectionID === 'rent-form-public-date') {
		rentFormValues.Date = section.querySelector('input').value;
	} else if (currentSectionID === 'rent-form-private-name') {
		rentFormValues.Name = section.querySelector('input').value;
	} else if (currentSectionID === 'rent-form-public-name') {
		rentFormValues.Name = section.querySelector('input').value;
	} else if (currentSectionID === 'rent-form-public-participants') {
		rentFormValues.EstimatedParticipants = section.querySelector('input').value;
	} else if (currentSectionID === 'rent-form-submit') {
		rentFormValues.Applicant = {
			Name: section.querySelector('#rent-form-submit-name').value,
			Email: section.querySelector('#rent-form-submit-email').value,
			Phone: section.querySelector('#rent-form-submit-phone').value,
		};
	}
}

// Submit form
async function submitForm() {
	// Send rentFormValues to backend
	console.log(rentFormValues);

	postRequest('/api/events/request', rentFormValues)
		.then((response) => {
			if (response.status === 200) {
				console.log('Success:', response.data);
			} else {
				console.log('Error:', response.data);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

// Space
document
	.querySelector('.rent-form-section#rent-form-space')
	.querySelectorAll('input')
	.forEach(function (input) {
		input.addEventListener('change', function () {
			rentFormNext.classList.add('active');
		});
	});

// Event type
document
	.querySelector('.rent-form-section#rent-form-eventType')
	.querySelectorAll('input')
	.forEach(function (input) {
		input.addEventListener('change', function () {
			rentFormNext.classList.add('active');
		});
	});

// Private date
document
	.querySelector('.rent-form-section#rent-form-private-date')
	.querySelector('input')
	.addEventListener('change', function () {
		rentFormNext.classList.add('active');
	});

// Public date
document
	.querySelector('.rent-form-section#rent-form-public-date')
	.querySelector('input')
	.addEventListener('change', function () {
		rentFormNext.classList.add('active');
	});

// Private name
document
	.querySelector('.rent-form-section#rent-form-private-name')
	.querySelector('input')
	.addEventListener('input', function (e) {
		// Check if the input is empty
		if (e.target.value === '') {
			rentFormNext.classList.remove('active');
			return;
		}
		rentFormNext.classList.add('active');
	});

// Public name
document
	.querySelector('.rent-form-section#rent-form-public-name')
	.querySelector('input')
	.addEventListener('input', function (e) {
		// Check if the input is empty
		if (e.target.value === '') {
			rentFormNext.classList.remove('active');
			return;
		}
		rentFormNext.classList.add('active');
	});

// Public participants
document
	.querySelector('.rent-form-section#rent-form-public-participants')
	.querySelector('input')
	.addEventListener('input', function (e) {
		// Check if the input is empty
		if (e.target.value === '' || e.target.value < 1) {
			rentFormNext.classList.remove('active');
			return;
		}
		rentFormNext.classList.add('active');
	});

// Submit
document
	.querySelector('.rent-form-section#rent-form-submit')
	.querySelectorAll('input')
	.forEach(function (input) {
		input.addEventListener('input', function () {
			// Check if all inputs are filled
			const inputs = document.querySelectorAll('.rent-form-section#rent-form-submit input');
			let allFilled = true;

			inputs.forEach(function (input) {
				if (input.value === '') {
					allFilled = false;
				}
			});

			if (allFilled) {
				rentFormNext.classList.add('active');
				return;
			}

			rentFormNext.classList.remove('active');
		});
	});

// Next
rentFormNext.addEventListener('click', function () {
	if (!rentFormNext.classList.contains('active')) return;

	const activeSection = document.querySelector('.rent-form-section.active');

	// Add values to rentFormValues
	addValuesToRentFormValues(activeSection);

	const nextSection = getNextSection(activeSection);

	activeSection.classList.remove('active');
	nextSection.classList.add('active');

	if (nextSection.id === 'rent-form-submit') {
		rentFormNext.innerHTML = 'Verstuur';
	}

	rentFormNext.classList.remove('active');
});
