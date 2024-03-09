// VERSION: 1.0

// Variables
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const calendar = document.querySelector('.calendar-content');
const calendarHeader = document.querySelector('.calendar-header-name');
const calendarHeaderSkeleton = document.querySelector('.skeleton-header-name');
const calendarPrevMonth = document.querySelector('.fa-chevron-left');
const calendarNextMonth = document.querySelector('.fa-chevron-right');
const calendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // English
const calendarMonthsDutch = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']; // Dutch
const calendarMonthsDutchShort = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']; // Dutch Short

let filteredEvents = {};
let filteredEventsContent = {};

// Get Google Calendar
async function fetchCalendar() {
	const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/planning.hoevelootens@gmail.com/events?key=AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA', {
		method: 'GET',
	});
	return response.json();
}

// Show Month
function showMonth(month, year = currentDate.getFullYear()) {
	// Get Variables Based On Month
	const dutchMonth = calendarMonthsDutch[calendarMonths.indexOf(month)].charAt(0).toUpperCase() + calendarMonthsDutch[calendarMonths.indexOf(month)].slice(1);
	const monthIndex = calendarMonths.indexOf(month);
	const days = new Date(year, monthIndex + 1, 0).getDate();
	const dates = Array.from(Array(days).keys()).map((x) => ++x);
	const events = filteredEvents[year][month];
	const startWeekDay = new Date(year, monthIndex, 1).getDay();
	let monthContent = '';

	calendarHeader.innerHTML = dutchMonth + ' ' + year;
	calendarHeader.setAttribute('data-year', year);

	// Change Prev Button
	if (monthIndex == 0 && year == currentYear) {
		calendarPrevMonth.style.color = '#F5F5F5';
		calendarPrevMonth.style.cursor = 'default';
	} else {
		calendarPrevMonth.style.color = '#FCC000';
		calendarPrevMonth.setAttribute('data-month', calendarMonths[monthIndex == 0 ? 11 : monthIndex - 1]);
		calendarPrevMonth.setAttribute('data-year', month == 'January' ? parseInt(year) - 1 : year);
		calendarPrevMonth.style.cursor = 'pointer';
	}

	// Change Next Button
	calendarNextMonth.style.color = '#FCC000';
	calendarNextMonth.setAttribute('data-month', calendarMonths[monthIndex == 11 ? 0 : monthIndex + 1]);
	calendarNextMonth.setAttribute('data-year', month == 'December' ? parseInt(year) + 1 : year);
	calendarNextMonth.style.cursor = 'pointer';

	// Add Empty Days
	for (let i = 0; i < startWeekDay - 1; i++) {
		monthContent += "<div class='calendar-day'><p></p></div>";
	}

	// Add Days
	for (const day of dates) {
		if (events[day]) {
			// Check If Day Has Event
			// Check If Event Is Event
			if (events[day].Type == 'event') {
				monthContent += `<div class='calendar-day calendar-active calendar-event calendar-tooltip calendar-tooltip-event' id='day-${day}'><p>${day}</p><div class='calendar-top'><p>${events[day].Title}</p><i></i></div></div>`;
			} else if (events[day].Type == 'res') {
				// Check If Event Is Reservation
				monthContent += `<div class='calendar-day calendar-active calendar-res calendar-tooltip calendar-tooltip-res'><p>${day}</p><div class='calendar-top'><p>Gerserveerd</p><i></i></div></div>`;
			} else if (events[day].Type == 'option') {
				// Check If Event Is Option
				monthContent += `<div class='calendar-day calendar-active calendar-option calendar-tooltip calendar-tooltip-option'><p>${day}</p><div class='calendar-top'><p>Optie</p><i></i></div></div>`;
			} else if (events[day].Type == 'boomgaardcafe') {
				// Check If Event Is Boomgaardcafe
				monthContent += `<div class='calendar-day calendar-active calendar-boomgaardcafe calendar-tooltip calendar-tooltip-boomgaardcafe'><p>${day}</p><div class='calendar-top'><p>Boomgaardcafé</p><i></i></div></div>`;
			}
		} else {
			// If Day Has No Event
			monthContent += "<div class='calendar-day'><p>" + day + '</p></div>';
		}
	}

	// Add Calendar Content
	calendar.innerHTML = monthContent;
	calendarHeaderSkeleton.style.display = 'none';
	calendarHeader.style.display = 'block';
}

// Show Events
function showEvents() {
	const year = currentDate.getFullYear();
	const calendarCards = document.querySelector('.calendar-cards .cards');
	const months = Object.keys(filteredEvents[year]);

	// Loop Through Months
	for (const month of months) {
		const days = Object.keys(filteredEvents[year][month]);

		// Loop Through Days
		for (const day of days) {
			if (filteredEvents[year][month][day].Type != 'boomgaardcafe') {
				// Get Event Variables
				const event = filteredEvents[year][month][day];
				const eventTitle = event.Title;
				const eventDescription = event.Description;
				const startMonth = month;
				const startDay = parseInt(day);

				let endMonth = month;
				let endDay = parseInt(day);

				// Check If Event Is Already Added
				if (filteredEventsContent[eventTitle]) continue;

				// Check If Event Is Multiple Days (Same Month)
				if (filteredEvents[year][month][parseInt(day) + 1]) {
					const nextDay = filteredEvents[year][month][parseInt(day) + 1];

					if (nextDay.Type == event.Type && nextDay.Title == event.Title) {
						endDay = parseInt(day) + 1;
					}
				}

				// Check If Event Is Multiple Days (Different Month)
				const isLastDayOfMonth = new Date(year, months.indexOf(month) + 1, 0).getDate() == endDay;

				if (isLastDayOfMonth) {
					const nextMonth = calendarMonths[calendarMonths.indexOf(month) + 1];

					if (filteredEvents[year][nextMonth][1]) {
						const nextDay = filteredEvents[year][nextMonth][1];

						if (nextDay.Type == event.Type && nextDay.Title == event.Title) {
							endMonth = nextMonth;
							endDay = 1;
						}
					}
				}

				// Add Event To Calendar Events Content
				filteredEventsContent[eventTitle] = {
					Title: eventTitle,
					Description: eventDescription,
					StartMonth: startMonth,
					StartDay: startDay,
					EndMonth: endMonth,
					EndDay: endDay,
					Type: event.Type,
				};
			} else {
				// Add Boomgaardcafe Event To Boomgaardcafe Events Content
				if (!filteredEventsContent['Boomgaardcafé']) {
					filteredEventsContent['Boomgaardcafé'] = {
						Type: 'boomgaardcafe',
						Description: filteredEvents[year][month][day].Description || undefined,
						Dates: {},
					};
				}

				filteredEventsContent['Boomgaardcafé']['Dates'][month] = [...(filteredEventsContent['Boomgaardcafé']['Dates'][month] || []), day];

				// Check If Boomgaardcafe Event Already Has A Description, If Not, Add Description
				if (filteredEventsContent['Boomgaardcafé']['Description'] == undefined) {
					filteredEventsContent['Boomgaardcafé']['Description'] = filteredEvents[year][month][day].Description || undefined;
				}
			}
		}
	}

	for (const event of Object.keys(filteredEventsContent)) {
		if (filteredEventsContent[event].Type == 'boomgaardcafe') {
		}
	}

	// Build Calendar Cards (Boomgaardcafe, Events)
	Object.values(filteredEventsContent).forEach((event) => {
		let card = '';

		if (event.Type == 'boomgaardcafe') {
			let dates = '';

			Object.keys(event.Dates).forEach((month) => {
				const days = event.Dates[month];
				const dutchMonth = calendarMonthsDutch[calendarMonths.indexOf(month)];

				dates += `<p class='calendar-boomgaardcafe-dates' data-month='${month}'>${days.join(' / ')} ${dutchMonth.charAt(0).toUpperCase()}${dutchMonth.slice(1)}</p>`;
			});

			card = `<div class='calendar-card'><h3>Boomgaardcafé</h3><div class='card-content'><p>${event.Description || ''}</p>${dates}</div></div>`;
		} else if (event.Type == 'event') {
			card = `<div class="calendar-card"><h3>${event.Title}</h3><p class="status" data-month="${event.StartMonth}">${event.StartDay} - ${event.EndDay} ${
				calendarMonthsDutchShort[calendarMonths.indexOf(event.StartMonth)]
			} ${year}</p><p>${event.Description || ''}</p></div>`;
		}

		document.querySelector('.calendar-cards .cards').innerHTML += card;
	});

	// Add Calendar Cards Content To Calendar Cards
	if (document.querySelectorAll('.calendar-card').length == 0) {
		calendarCards.innerHTML = '<h4 class="highlight-text">Geen evenementen gevonden</h4>';
	} else {
		document.querySelectorAll('.calendar-card-skeleton').forEach((element) => {
			element.style.display = 'none';
		});
	}

	calendarCards.style.marginTop = '20px';

	// Update Calendar When Clicking On Event Date
	document.querySelectorAll('.calendar-boomgaardcafe-dates, .status').forEach((element) => {
		element.addEventListener('click', function () {
			let month = element.getAttribute('data-month');

			calendar.innerHTML = '';
			showMonth(month);
			tooltip();

			scrollTo(0, 0);
		});
	});
}

function parseEvents(events) {
	// Get Event Type, Title And Description
	const getEventInfo = (event) => {
		let type = 'Not public';
		let title = event['summary'];
		let description = '';

		if (event['summary'].toLowerCase().includes('reservering')) {
			type = 'res';
			title = event['summary'].replace('Reservering', '').replace('reservering', '').trim();
		} else if (event['summary'].toLowerCase().includes('optie')) {
			type = 'option';
			title = event['summary'].replace('Optie', '').replace('optie', '').trim();
		} else if (event['summary'].toLowerCase().includes('event')) {
			type = 'event';
			title = event['summary'].replace('Event', '').replace('event', '').trim();
		} else if (event['summary'] == 'Boomgaardcafé') {
			type = 'boomgaardcafe';
			title = event['summary'].trim();
		}

		if (event['description'] != undefined) description = event['description'];

		return {
			type: type,
			title: title,
			description: description,
		};
	};

	for (let i = 0; i < events.length; i++) {
		const startTime = events[i]['start']['dateTime'] || events[i]['start']['date'];
		const endTime = events[i]['end']['dateTime'] || events[i]['end']['date'];

		let date = startTime.split('T')[0];
		let year = date.split('-')[0];
		let month = date.split('-')[1];
		let day = date.split('-')[2];

		let endDate = endTime.split('T')[0];
		let endMonth = endDate.split('-')[1];
		let endDay = endDate.split('-')[2];

		if (day[0] == '0') day = day.split('0')[1];

		if (endDay[0] == '0') endDay = endDay.split('0')[1];

		// Check If Year Exists
		if (Object.keys(filteredEvents).indexOf(year) == -1) {
			filteredEvents[year] = {
				January: {},
				February: {},
				March: {},
				April: {},
				May: {},
				June: {},
				July: {},
				August: {},
				September: {},
				October: {},
				November: {},
				December: {},
			};
		}

		if (events[i]['summary'] != undefined) {
			if (month == endMonth && year >= currentYear) {
				// If Event Is In Same Month
				const { type, title, description } = getEventInfo(events[i]);

				for (let j = parseInt(day); j < parseInt(endDay); j++) {
					filteredEvents[year][Object.keys(filteredEvents[year])[month - 1]][j] = {
						Type: type,
						Title: title,
						Description: description,
					};
				}
			} else if (year >= currentYear) {
				// If Event Is In Different Month
				const { type, title, description } = getEventInfo(events[i]);

				for (let j = month; j <= endMonth; j++) {
					if (j == month) {
						for (let k = day; k <= new Date(year, month - 1, 0).getDate(); k++) {
							filteredEvents[year][Object.keys(filteredEvents[year])[j - 1]][k] = {
								Type: type,
								Title: title,
								Description: description,
							};
						}
					} else if (j == endMonth) {
						for (let k = 1; k < endDay; k++) {
							filteredEvents[year][Object.keys(filteredEvents[year])[j - 1]][k] = {
								Type: type,
								Title: title,
								Description: description,
							};
						}
					}
				}
			}
		}
	}
}

// Hover On Calendar Dates
function tooltip() {
	const tooltips = document.querySelectorAll('.calendar-tooltip');
	tooltips.forEach(function (tooltip, index) {
		tooltip.addEventListener('mouseover', positionTooltip); // On hover, launch the function below
	});

	tooltips.forEach(function (tooltip, index) {
		tooltip.addEventListener('mouseout', function () {
			this.childNodes[1].classList.remove('calendar-tooltip-show');
		});
	});
}

// Position Tooltip
function positionTooltip() {
	// Get .ktooltiptext sibling
	const tooltip = this.childNodes[1];

	// Get calculated ktooltip coordinates and size
	const tooltip_rect = this.getBoundingClientRect();
	const tooltip_width = tooltip_rect.width;
	const tooltip_pos_right = tooltip_rect.right;
	const tooltip_pos_y = tooltip_rect.y;

	if (tooltip_pos_right + tooltip_width > window.innerWidth) {
		tooltip.style.left = '0px';
	}

	if (tooltip_pos_y < 0) {
		tooltip.style.top = '0px';
	}

	tooltip.classList.add('calendar-tooltip-show');
}

// Init Calendar
fetchCalendar().then((calendar) => {
	const allEvents = calendar.items || [];
	let events = [];

	for (let i = 0; i < allEvents.length; i++) {
		let startTime = allEvents[i]['start']['dateTime'];

		if (startTime == undefined) {
			startTime = allEvents[i]['start']['date'];
		}

		let date = startTime.split('T')[0];
		let year = date.split('-')[0];

		if (year >= currentYear) {
			events.push(allEvents.slice(i));
			break;
		}
	}

	events = events.flat();
	parseEvents(events);
	showMonth(Object.keys(filteredEvents[currentDate.getFullYear()])[currentDate.getMonth()], currentDate.getFullYear());
	showEvents();
	tooltip();
});

// Get Previous Month
calendarPrevMonth.addEventListener('click', function () {
	calendar.innerHTML = '';
	showMonth(this.getAttribute('data-month'), this.getAttribute('data-year'));

	tooltip();
});

// Get Next Month
calendarNextMonth.addEventListener('click', function () {
	const year = this.getAttribute('data-year');

	if (Object.keys(filteredEvents).indexOf(year) == -1) {
		filteredEvents[year] = {
			January: {},
			February: {},
			March: {},
			April: {},
			May: {},
			June: {},
			July: {},
			August: {},
			September: {},
			October: {},
			November: {},
			December: {},
		};
	}

	calendar.innerHTML = '';
	showMonth(this.getAttribute('data-month'), this.getAttribute('data-year'));

	tooltip();
});

// Get New Month (Input)
calendarHeader.addEventListener('click', function () {
	const inputMonth = document.querySelector('.calendar-input-month');
	inputMonth.showPicker();

	inputMonth.addEventListener('change', function () {
		if (inputMonth.value != '') {
			const monthIndex = inputMonth.value.split('-')[1];
			const year = calendarHeader.getAttribute('data-year');
			const month = Object.keys(filteredEvents[year])[monthIndex - 1];

			calendar.innerHTML = '';
			showMonth(month, year);

			tooltip();
		}
	});
});
