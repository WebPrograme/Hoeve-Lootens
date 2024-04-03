import { getRequest, postRequest } from '../modules/Requests.js';

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

function checkOverlap(cell) {
	let selectedCells = document.querySelectorAll('.volunteers-table-signup-selected');
	let selectedCellsTimeslots = Array.from(selectedCells).map((selectedCell) => {
		return selectedCell.parentNode.getAttribute('data-timeslot');
	});

	let cellTimeslot = cell.parentNode.getAttribute('data-timeslot');
	let cellTimeslotStart = cellTimeslot.split(' - ')[0];
	let cellTimeslotEnd = cellTimeslot.split(' - ')[1];

	let selectedShifts = [];

	selectedCellsTimeslots.forEach((timeslot) => {
		let timeslotStart = timeslot.split(' - ')[0];
		let timeslotEnd = timeslot.split(' - ')[1];

		let timeslotStartHours = parseInt(timeslotStart.split(':')[0]);
		let timeslotStartMinutes = parseInt(timeslotStart.split(':')[1]);

		let timeslotEndHours = parseInt(timeslotEnd.split(':')[0]);
		let timeslotEndMinutes = parseInt(timeslotEnd.split(':')[1]);

		let shiftCount = (timeslotEndHours - timeslotStartHours) * 2 + (timeslotEndMinutes - timeslotStartMinutes) / 30;
		let previousShift = timeslotStart;

		selectedShifts.push(timeslotStart);

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

			selectedShifts.push(previousShift);
		}

		selectedShifts.pop();
	});

	if (selectedShifts.includes(cellTimeslotStart)) {
		return true;
	}

	return false;
}

function showTimeTable(dataFull, date) {
	let data = {};
	data[date] = dataFull[date];

	let table = document.querySelector('.volunteers-table');
	let allShifts = [];
	let allShiftsStart = [];
	let startTime = '08:00';
	let previousTime = '08:00';

	table.innerHTML = '';
	table.appendChild(document.createElement('thead'));
	table.appendChild(document.createElement('tbody'));

	for (let i = 0; i < 32; i++) {
		let time = previousTime.split(':');
		let hours = parseInt(time[0]);
		let minutes = parseInt(time[1]) + 30;

		if (minutes >= 60) {
			minutes -= 60;
			hours++;
		}

		if (hours < 10) hours = '0' + hours;
		if (minutes < 10) minutes = '0' + minutes;

		startTime = previousTime + ' - ' + hours + ':' + minutes;
		previousTime = hours + ':' + minutes;

		allShifts.push(startTime);
		allShiftsStart.push(startTime.split(' - ')[0]);
	}

	allShifts.forEach((shift) => {
		let timetableBodyRow = document.createElement('tr');
		let timetableBodyCell = document.createElement('td');

		timetableBodyCell.innerHTML = shift.split(' - ')[0];

		timetableBodyRow.appendChild(timetableBodyCell);
		table.querySelector('tbody').appendChild(timetableBodyRow);
	});

	Object.keys(data).forEach((date) => {
		let timetableHeader = document.createElement('tr');
		let timetableHeaderCell = document.createElement('th');

		timetableHeaderCell.innerHTML = 'Tijdslot';

		timetableHeader.appendChild(timetableHeaderCell);

		Object.keys(data[date]['Tasks']).forEach((task, taskIndex) => {
			let timetable = data[date]['Tasks'][task];
			let shiftCellHeight = 0;
			let timetableShiftsStart = Object.keys(timetable).map((shift) => {
				return shift.split(' - ')[0];
			});

			let timetableHeaderCell = document.createElement('th');
			timetableHeaderCell.innerHTML = task;

			timetableHeader.appendChild(timetableHeaderCell);
			table.querySelector('thead').appendChild(timetableHeader);

			allShifts.forEach((shift, rowIndex) => {
				let shiftStart = shift.split(' - ')[0];
				if (shiftCellHeight > 0) {
					shiftCellHeight--;
					return;
				}

				let timetableBodyCell = document.createElement('td');
				timetableBodyCell.setAttribute('data-task', task);
				timetableBodyCell.setAttribute('data-time', shift);
				if (timetableShiftsStart.includes(shiftStart)) {
					let index = timetableShiftsStart.indexOf(shiftStart);

					let shiftEnd = Object.keys(timetable)[index].split(' - ')[1];
					shiftEnd = shiftEnd.split(':');
					let shiftEndHours = parseInt(shiftEnd[0]);
					let shiftEndMinutes = parseInt(shiftEnd[1]);

					let shiftStartHours = parseInt(shiftStart.split(':')[0]);
					let shiftStartMinutes = parseInt(shiftStart.split(':')[1]);

					let shiftDeltaMinutes = (shiftEndHours - shiftStartHours) * 60 + (shiftEndMinutes - shiftStartMinutes);
					let shiftDeltaHours = Math.floor(shiftDeltaMinutes / 60);
					let shiftDeltaTime = shiftDeltaHours + ':' + (shiftDeltaMinutes - shiftDeltaHours * 60);

					shiftCellHeight = shiftDeltaMinutes / 30;

					timetableBodyCell.setAttribute('rowspan', shiftCellHeight);

					let volunteersCount = parseInt(Object.keys(timetable[Object.keys(timetable)[index]]['Volunteers']).length);
					let volunteersMax = parseInt(timetable[Object.keys(timetable)[index]]['MaxVolunteers']);

					let timetableBodyCellContent = document.createElement('div');

					if (volunteersCount >= volunteersMax) {
						timetableBodyCellContent.innerHTML = 'Volzet';
						timetableBodyCellContent.classList.add('volunteers-table-full');
					} else {
						timetableBodyCellContent.innerHTML = `<span>${shiftStart}</span> <i class="fa-solid fa-plus"></i> <span>${shiftEnd.join(':')}</span>`;
						timetableBodyCellContent.classList.add('volunteers-table-spots');

						timetableBodyCell.setAttribute('data-timeslot', shiftStart + ' - ' + shiftEnd.join(':'));
					}

					timetableBodyCell.appendChild(timetableBodyCellContent);

					shiftCellHeight--;
				}

				document.querySelector('tbody').children[rowIndex].appendChild(timetableBodyCell);
			});
		});
	});

	let latestTime = Object.keys(data[date]['Tasks'])
		.map((task) => {
			return Object.keys(data[date]['Tasks'][task]).map((shift) => {
				return shift.split(' - ')[1];
			});
		})
		.flat()
		.sort()
		.reverse()[0];

	let latestTimeHours = parseInt(latestTime.split(':')[0]);
	let latestTimeMinutes = latestTime.split(':')[1];
	latestTimeHours += 2;

	if (latestTimeMinutes == '30') latestTimeMinutes = '00';

	latestTime = latestTimeHours + ':' + latestTimeMinutes;

	if (latestTimeHours < 24) {
		let rows = document.querySelectorAll('.volunteers-table tbody tr');
		rows = Array.from(rows).reverse();

		for (let row of rows) {
			let firstCell = row.children[0];
			let firstCellTime = firstCell.innerHTML.split(' - ')[0];
			table.deleteRow(row.rowIndex);

			if (firstCellTime === latestTime) {
				break;
			}
		}
	}
}

document.querySelector('.volunteers-select-date').addEventListener('change', (e) => {
	let selectedDate = e.target.value;

	window.location.href = window.location.href.split('?')[0] + '?date=' + selectedDate;
});

getRequest('/api/volunteers/init/available', {}).then((res) => {
	if (res.status === 200) {
		let data = res.data;

		let date = window.location.href.indexOf('?date=') > -1 ? window.location.href.split('?date=')[1] : Object.keys(data)[0];

		Object.keys(data).forEach((dateKey) => {
			document.querySelector('.volunteers-select-date').innerHTML += '<option value="' + dateKey + '">' + dateKey + '</option>';

			if (date) document.querySelector('.volunteers-select-date').value = date;
			else document.querySelector('.volunteers-select-date').value = Object.keys(data)[0];
		});

		showTimeTable(data, date ? date : Object.keys(data)[0]);

		const tableWidth = document.querySelector('.volunteers-table').scrollWidth;
		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

		if (tableWidth > viewportWidth) {
			document.querySelector('.volunteers-nav-icon.fa-angles-right').classList.remove('volunteers-nav-icon-disabled');
		} else {
			document.querySelector('.volunteers-nav-icon.fa-angles-right').classList.add('volunteers-nav-icon-disabled');
		}

		let selectedDate = document.querySelector('.volunteers-select-date').value;

		document.querySelector('.volunteers').addEventListener('scroll', (e) => {
			const tableLeft = e.target.scrollLeft;

			if (tableLeft > 0) {
				document.querySelector('.volunteers-nav-icon.fa-angles-left').classList.remove('volunteers-nav-icon-disabled');
			} else {
				document.querySelector('.volunteers-nav-icon.fa-angles-left').classList.add('volunteers-nav-icon-disabled');
			}

			if (e.target.scrollLeft >= e.target.scrollWidth - e.target.offsetWidth) {
				document.querySelector('.volunteers-nav-icon.fa-angles-right').classList.add('volunteers-nav-icon-disabled');
			} else {
				document.querySelector('.volunteers-nav-icon.fa-angles-right').classList.remove('volunteers-nav-icon-disabled');
			}
		});

		document.querySelector('.volunteers-nav-icon.fa-angles-left').addEventListener('click', (e) => {
			document.querySelector('.volunteers').scrollLeft -= 200;
		});

		document.querySelector('.volunteers-nav-icon.fa-angles-right').addEventListener('click', (e) => {
			document.querySelector('.volunteers').scrollLeft += 200;
		});

		document.querySelectorAll('.volunteers-table tbody td[data-task] div:not(.volunteers-table-full)').forEach((cell) => {
			cell.addEventListener('click', (e) => {
				let cell = e.target.closest('div');
				let icon = cell.querySelector('i');

				if (cell.classList.contains('volunteers-table-signup-overlap')) return;

				if (cell.classList.contains('volunteers-table-signup-selected')) {
					cell.classList.remove('volunteers-table-signup-selected');

					icon.classList.replace('fa-check', 'fa-plus');
				} else {
					cell.classList.add('volunteers-table-signup-selected');

					icon.classList.replace('fa-plus', 'fa-check');
				}

				let selectedShifts = document.querySelectorAll('.volunteers-table-signup-selected');

				if (selectedShifts.length > 0) {
					document.querySelector('.volunteers-signup-add-btn').style.display = 'block';
				} else {
					document.querySelector('.volunteers-signup-add-btn').style.display = 'none';
				}

				let otherCells = document.querySelectorAll(
					'.volunteers-table-signup:not(.volunteers-table-signup-selected), .volunteers-table-spots:not(.volunteers-table-signup-selected)'
				);

				otherCells.forEach((cell) => {
					let overlap = checkOverlap(cell);
					let icon = cell.querySelector('i');

					if (overlap) {
						cell.classList.add('volunteers-table-signup-overlap');
						icon.classList.replace('fa-plus', 'fa-ban');
					} else {
						cell.classList.remove('volunteers-table-signup-overlap');
						icon.classList.replace('fa-ban', 'fa-plus');
					}
				});
			});
		});

		document.querySelector('.volunteers-signup-add-btn').addEventListener('click', (e) => {
			e.preventDefault();

			document.querySelector('.volunteers-signup-add-btn').style.display = 'none';

			let volunteer = localStorage.getItem('volunteer') ? JSON.parse(localStorage.getItem('volunteer')) : null;
			let selectedShifts = document.querySelectorAll('.volunteers-table-signup-selected');
			let shifts = {};

			selectedShifts.forEach((shift) => {
				shifts[shift.closest('td').getAttribute('data-task')] = shifts[shift.closest('td').getAttribute('data-task')] || [];

				shifts[shift.closest('td').getAttribute('data-task')].push({
					TimeSpan: shift.closest('td').getAttribute('data-timeslot'),
					Shiftcount: 1,
				});
			});

			document.querySelector('.volunteers-options-date').innerHTML = selectedDate;
			document.querySelector('.volunteers-options-shifts').innerHTML = '';

			Object.keys(shifts).forEach((task) => {
				let taskElement = document.createElement('div');
				taskElement.classList.add('volunteers-options-shifts-task');

				let taskElementTitle = document.createElement('span');
				taskElementTitle.classList.add('volunteers-options-shifts-task-title');
				taskElementTitle.innerHTML = task + ': ';

				taskElement.appendChild(taskElementTitle);

				Object.keys(shifts[task]).forEach((shift) => {
					let shiftElement = document.createElement('span');
					shiftElement.classList.add('volunteers-options-shifts-time');
					shiftElement.innerHTML = shifts[task][shift]['TimeSpan'];

					taskElement.appendChild(shiftElement);
				});

				document.querySelector('.volunteers-options-shifts').appendChild(taskElement);
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

			let selectedShifts = document.querySelectorAll('.volunteers-table-signup-selected');
			let shifts = [];

			selectedShifts.forEach((shift) => {
				// Add the shift to the shifts array as an object with the following properties: Day, TaskName, Shift
				shifts.push({
					Day: selectedDate,
					TaskName: shift.closest('td').getAttribute('data-task'),
					Shift: shift.closest('td').getAttribute('data-timeslot'),
				});
			});

			postRequest('/api/volunteers/add/volunteer', {
				Shifts: shifts,
				Volunteer: user,
			}).then((res) => {
				if (res.status === 200) {
					localStorage.setItem('volunteer', JSON.stringify(user));

					location.reload();
				} else {
					new Toast('Er Is Iets Foutgelopen', 'error').show();
				}
			});
		});
	} else {
		console.log('Error');
	}
});
