import { getRequest, postRequest } from '../modules/Requests.js';
import analytics from './analyse.js';

function putRequest(target, data) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', 'https://hoeve-lootens-email.onrender.com/api/v2/' + target, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
		xhr.onload = function () {
			resolve(this);
		};
	});
}

function exctractShifts(start, end) {
	let shifts = [];

	let startHours = parseInt(start.split(':')[0]);
	let startMinutes = parseInt(start.split(':')[1]);

	let endHours = parseInt(end.split(':')[0]);
	let endMinutes = parseInt(end.split(':')[1]);

	let shiftCount = (endHours - startHours) * 2 + (endMinutes - startMinutes) / 30;
	let previousShift = start;

	shifts.push(start);

	for (let i = 0; i < shiftCount; i++) {
		let time = previousShift.split(':');
		let hours = parseInt(time[0]);
		let minutes = parseInt(time[1]) + 30;

		if (minutes >= 60) {
			minutes -= 60;
			hours++;
		}

		if (hours < 10) hours = '0' + hours;
		if (minutes < 10) minutes = '0' + minutes;

		previousShift = hours + ':' + minutes;

		shifts.push(previousShift);
	}

	shifts.pop();

	return shifts;
}

function checkOverlap(shift) {
	const selectedShifts = document.querySelectorAll('.volunteers-shift-selected');
	const selectedShiftsTimeslots = Array.from(selectedShifts).map((selectedCell) => {
		return selectedCell.getAttribute('data-timeslot');
	});

	let shiftTimeslot = shift.getAttribute('data-timeslot');
	let shiftTimeslotStart = shiftTimeslot.split(' - ')[0];
	let shiftTimeslotEnd = shiftTimeslot.split(' - ')[1];
	let shiftTimeslots = exctractShifts(shiftTimeslotStart, shiftTimeslotEnd);

	let extractedShifts = [];
	selectedShiftsTimeslots.forEach((timeslot) => {
		let timeslotStart = timeslot.split(' - ')[0];
		let timeslotEnd = timeslot.split(' - ')[1];

		extractedShifts = extractedShifts.concat(exctractShifts(timeslotStart, timeslotEnd));
	});

	// Check if the selected shifts overlap with the cell shifts
	for (let i = 0; i < shiftTimeslots.length; i++) {
		if (extractedShifts.includes(shiftTimeslots[i])) {
			return true;
		}
	}

	return false;
}

function showShifts(data) {
	const container = document.querySelector('.volunteers');

	Object.keys(data).forEach((date) => {
		const day = document.createElement('div');
		day.classList.add('volunteers-day');

		const dateElement = document.createElement('h2');
		dateElement.classList.add('volunteers-date');
		dateElement.innerHTML = date;

		day.appendChild(dateElement);

		Object.keys(data[date]['Tasks']).forEach((task) => {
			const taskElement = document.createElement('div');
			taskElement.classList.add('volunteers-task');

			const taskTitle = document.createElement('h3');
			taskTitle.classList.add('volunteers-task-title');
			taskTitle.innerHTML = task;

			const taskShifts = document.createElement('div');
			taskShifts.classList.add('volunteers-task-shifts');

			Object.keys(data[date]['Tasks'][task]).forEach((shift) => {
				const shiftElement = document.createElement('div');
				shiftElement.classList.add('volunteers-shift');
				shiftElement.setAttribute('data-date', date);
				shiftElement.setAttribute('data-task', task);
				shiftElement.setAttribute('data-timeslot', shift);

				const shiftTime = document.createElement('span');
				shiftTime.classList.add('volunteers-shift-time');
				shiftTime.innerHTML = shift;

				const shiftCounter = document.createElement('span');
				shiftCounter.classList.add('volunteers-shift-counter');

				const shiftVolunteers = parseInt(data[date]['Tasks'][task][shift]['Volunteers']);
				const shiftMaxVolunteers = parseInt(data[date]['Tasks'][task][shift]['MaxVolunteers']);

				shiftCounter.innerHTML = shiftVolunteers + '/' + shiftMaxVolunteers;

				if (shiftVolunteers >= shiftMaxVolunteers) {
					shiftElement.classList.add('volunteers-shift-full');
					shiftCounter.innerHTML = 'Vol';
				}

				const shiftOverlapIcon = document.createElement('span');
				shiftOverlapIcon.classList.add('volunteers-shift-overlap-icon');
				shiftOverlapIcon.innerHTML = '<i class="fas fa-ban"></i>';

				shiftElement.appendChild(shiftTime);
				shiftElement.appendChild(shiftCounter);
				shiftElement.appendChild(shiftOverlapIcon);

				taskShifts.appendChild(shiftElement);
			});

			taskElement.appendChild(taskTitle);
			taskElement.appendChild(taskShifts);
			day.appendChild(taskElement);
		});
		container.appendChild(day);
	});
}

getRequest('/api/volunteers/init/available', {}).then((res) => {
	if (res.status === 200) {
		const data = res.data;

		showShifts(data);

		document.querySelectorAll('.volunteers .volunteers-shift:not(.volunteers-shift-full)').forEach((cell) => {
			cell.addEventListener('click', (e) => {
				const shift = e.target.closest('div');

				if (shift.classList.contains('volunteers-shift-overlap')) return;

				if (shift.classList.contains('volunteers-shift-selected')) {
					shift.classList.remove('volunteers-shift-selected');
				} else {
					shift.classList.add('volunteers-shift-selected');
				}

				const selectedShifts = document.querySelectorAll('.volunteers-shift-selected');

				if (selectedShifts.length > 0) {
					document.querySelector('.volunteers-signup-add-btn').style.display = 'block';
				} else {
					document.querySelector('.volunteers-signup-add-btn').style.display = 'none';
				}

				const shiftDay = shift.closest('.volunteers-day');
				const otherShifts = shiftDay.querySelectorAll('.volunteers-shift:not(.volunteers-shift-selected, .volunteers-shift-full)');

				otherShifts.forEach((otherShift) => {
					const isOverlaping = checkOverlap(otherShift);

					if (isOverlaping) {
						otherShift.classList.add('volunteers-shift-overlap');
					} else {
						otherShift.classList.remove('volunteers-shift-overlap');
					}
				});
			});
		});

		document.querySelector('.volunteers-signup-add-btn').addEventListener('click', (e) => {
			e.preventDefault();

			document.querySelector('.volunteers-signup-add-btn').style.display = 'none';

			const volunteer = localStorage.getItem('volunteer') ? JSON.parse(localStorage.getItem('volunteer')) : null;
			const selectedShifts = document.querySelectorAll('.volunteers-shift-selected');
			let shifts = {};

			selectedShifts.forEach((shift) => {
				shifts[shift.getAttribute('data-date')] = shifts[shift.getAttribute('data-date')] || {};
				shifts[shift.getAttribute('data-date')][shift.getAttribute('data-task')] = shifts[shift.getAttribute('data-date')][shift.getAttribute('data-task')] || {};

				shifts[shift.getAttribute('data-date')][shift.getAttribute('data-task')][shift.getAttribute('data-timeslot')] = {
					TimeSpan: shift.getAttribute('data-timeslot'),
					Shiftcount: 1,
				};
			});

			const shiftsOptions = document.querySelector('.volunteers-options');
			shiftsOptions.innerHTML = '';

			Object.keys(shifts).forEach((date) => {
				const dateElement = document.createElement('label');
				dateElement.classList.add('volunteers-options-date', 'label');
				dateElement.innerHTML = date;

				const shiftsElement = document.createElement('div');
				shiftsElement.classList.add('volunteers-options-shifts');

				Object.keys(shifts[date]).forEach((task) => {
					const taskElement = document.createElement('div');
					taskElement.classList.add('volunteers-options-shifts-task');

					const taskElementTitle = document.createElement('span');
					taskElementTitle.classList.add('volunteers-options-shifts-task-title');
					taskElementTitle.innerHTML = task + ': ';

					taskElement.appendChild(taskElementTitle);

					Object.keys(shifts[date][task]).forEach((shift) => {
						const shiftElement = document.createElement('span');
						shiftElement.classList.add('volunteers-options-shifts-time');
						shiftElement.innerHTML = shifts[date][task][shift]['TimeSpan'];

						taskElement.appendChild(shiftElement);
					});

					shiftsElement.appendChild(taskElement);
				});

				dateElement.appendChild(shiftsElement);
				shiftsOptions.appendChild(dateElement);
			});

			if (volunteer) {
				let modal = document.querySelector('#volunteers-modal');

				modal.querySelector('.volunteers-signup-account-name').innerHTML = volunteer['FirstName'] + ' ' + volunteer['LastName'];
				modal.querySelector('.volunteers-signup-account-email').innerHTML = volunteer['Email'];

				modal.querySelector('.volunteers-signup-account').style.display = 'block';
				modal.querySelector('.volunteers-account-footer').style.display = 'block';
				modal.querySelector('.volunteers-signup-form').style.display = 'none';
				modal.querySelector('.volunteers-signup-footer').style.display = 'none';

				document.querySelector('.volunteers-signup-account-user').addEventListener('click', (e) => {
					modal.querySelector('.volunteers-account-footer').style.display = 'none';
					modal.querySelector('.volunteers-signup-account').style.display = 'none';
					modal.querySelector('.volunteers-signup-form').style.display = 'block';
					modal.querySelector('.volunteers-signup-footer').style.display = 'block';

					modal.querySelector('.volunteers-input[name="Voornaam"]').value = volunteer['FirstName'];
					modal.querySelector('.volunteers-input[name="Achternaam"]').value = volunteer['LastName'];
					modal.querySelector('.volunteers-input[name="Email"]').value = volunteer['Email'];
					modal.querySelector('.volunteers-input[name="Telefoonnummer"]').value = volunteer['Phone'];
					modal.querySelector('.volunteers-input[name="Adres"]').value = volunteer['Address'];
				});

				document.querySelector('.volunteers-account-new-btn').addEventListener('click', (e) => {
					modal.querySelector('.volunteers-signup-account').style.display = 'none';
					modal.querySelector('.volunteers-account-footer').style.display = 'none';
					modal.querySelector('.volunteers-signup-form').style.display = 'block';
					modal.querySelector('.volunteers-signup-footer').style.display = 'block';
				});
			} else {
				document.querySelector('.volunteers-signup-account').style.display = 'none';
				document.querySelector('.volunteers-account-footer').style.display = 'none';
			}
		});

		document.querySelector('.volunteers-signup-confirm-btn').addEventListener('click', (e) => {
			let firstName = document.querySelector('.volunteers-input[name="Voornaam"]').value;
			let lastName = document.querySelector('.volunteers-input[name="Achternaam"]').value;
			let email = document.querySelector('.volunteers-input[name="Email"]').value;
			let phone = document.querySelector('.volunteers-input[name="Telefoonnummer"]').value;
			let address = document.querySelector('.volunteers-input[name="Adres"]').value;

			if (firstName === '' || lastName === '' || email === '' || phone === '' || address === '') {
				document.querySelector('.volunteers-signup-add-btn').innerHTML = 'Vul alle velden in';
				document.querySelector('.volunteers-signup-add-btn').style.backgroundColor = '#EE7357';
				return;
			}

			let user = {
				FirstName: firstName,
				LastName: lastName,
				Email: email,
				Phone: phone,
				Address: address,
			};

			const selectedShifts = document.querySelectorAll('.volunteers-shift-selected');
			let shifts = [];

			selectedShifts.forEach((shift) => {
				// Add the shift to the shifts array as an object with the following properties: Day, TaskName, Shift
				shifts.push({
					Day: shift.getAttribute('data-date'),
					TaskName: shift.getAttribute('data-task'),
					Shift: shift.getAttribute('data-timeslot'),
				});
			});

			console.log(shifts);

			return;

			postRequest('/api/volunteers/add/volunteer', {
				Shifts: shifts,
				Volunteer: user,
			}).then((res) => {
				if (res.status === 200 && res.data.result === 'Success') {
					analytics('AddedVolunteer', { volunteer: `${user.FirstName} ${user.LastName}` });
					localStorage.setItem('volunteer', JSON.stringify(user));

					location.reload();
				} else if (res.data.result === 'Volunteer exists in one or more shifts') {
					new Toast('Je Bent Al Ingeschreven', 'error').show();
				} else {
					new Toast('Er Is Iets Foutgelopen', 'error').show();
				}
			});
		});
	} else {
		console.log('Error');
	}
});
