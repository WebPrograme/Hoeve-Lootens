// VERSION: 1.0

// Variables
const d = new Date();
const currentYear = d.getFullYear();
const calendar = document.querySelector('.calendar-content');
const calendarHeader = document.querySelector('.calendar-header-name');
const calendarHeaderSkeleton = document.querySelector('.skeleton-header-name');
const calendarPrevMonth = document.querySelector('.fa-chevron-left');
const calendarNextMonth = document.querySelector('.fa-chevron-right');
const calendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // English
const calendarMonthsDutch = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']; // Dutch
const calendarMonthsDutchShort = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']; // Dutch Short

// Calendar Events
let calendarEvents = {}; // Calendar Events
let calendarEventsContent = {}; // Calendar Events Content
let boomgaardcafeEvents = []; // Boomgaardcafe Events

// Get Google Calendar
async function getCalendar() {
	const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/planning.hoevelootens@gmail.com/events?key=AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA', {
		method: 'GET',
	});
	return response.json();
}

// Update Calendar When Month Changes
function updateCalendar(month, year = d.getFullYear()) {
	// Get Variables Based On Month
	let name = month;
	let dutchName = calendarMonthsDutch[calendarMonths.indexOf(month)].charAt(0).toUpperCase() + calendarMonthsDutch[calendarMonths.indexOf(month)].slice(1);
	let index = calendarMonths.indexOf(month);
	let days = new Date(year, index + 1, 0).getDate();
	let dates = Array.from(Array(days).keys()).map((x) => ++x);
	let events = calendarEvents[year][month];
	let startWeekDay = new Date(year, index, 1).getDay();
	let calendarContent = '';

	calendarHeader.innerHTML = dutchName + ' ' + year;
	calendarHeader.setAttribute('data-year', year);

	// Change Prev Button
	if (index == 0 && year == currentYear) {
		calendarPrevMonth.style.color = '#F5F5F5';
		calendarPrevMonth.style.cursor = 'default';
	} else {
		calendarPrevMonth.style.color = '#FCC000';
		calendarPrevMonth.setAttribute('data-month', calendarMonths[index == 0 ? 11 : index - 1]);
		calendarPrevMonth.setAttribute('data-year', month == 'January' ? parseInt(year) - 1 : year);
		calendarPrevMonth.style.cursor = 'pointer';
	}

	// Change Next Button
	calendarNextMonth.style.color = '#FCC000';
	calendarNextMonth.setAttribute('data-month', calendarMonths[index == 11 ? 0 : index + 1]);
	calendarNextMonth.setAttribute('data-year', month == 'December' ? parseInt(year) + 1 : year);
	calendarNextMonth.style.cursor = 'pointer';

	// Add Empty Days
	for (let i = 0; i < startWeekDay - 1; i++) {
		calendarContent += "<div class='calendar-day'><p></p></div>";
	}

	// Add Days
	for (let i = 0; i < dates.length; i++) {
		if (events[dates[i]]) {
			// Check If Day Has Event
			if (events[dates[i]].Type == 'event') {
				// Check If Event Is Event
				calendarContent += `<div class='calendar-day calendar-active calendar-event calendar-tooltip calendar-tooltip-event' id='day-${dates[i]}'><p>${
					dates[i]
				}</p><div class='calendar-top'><p>${events[dates[i]].Title}</p><i></i></div></div>`;
			} else if (events[dates[i]].Type == 'res') {
				// Check If Event Is Reservation
				calendarContent += `<div class='calendar-day calendar-active calendar-res calendar-tooltip calendar-tooltip-res'><p>${dates[i]}</p><div class='calendar-top'><p>Gerserveerd</p><i></i></div></div>`;
			} else if (events[dates[i]].Type == 'option') {
				// Check If Event Is Option
				calendarContent += `<div class='calendar-day calendar-active calendar-option calendar-tooltip calendar-tooltip-option'><p>${dates[i]}</p><div class='calendar-top'><p>Optie</p><i></i></div></div>`;
			} else if (events[dates[i]].Type == 'boomgaardcafe') {
				// Check If Event Is Boomgaardcafe
				calendarContent += `<div class='calendar-day calendar-active calendar-boomgaardcafe calendar-tooltip calendar-tooltip-boomgaardcafe'><p>${dates[i]}</p><div class='calendar-top'><p>Boomgaardcafé</p><i></i></div></div>`;
			}
		} else {
			// If Day Has No Event
			calendarContent += "<div class='calendar-day'><p>" + dates[i] + '</p></div>';
		}
	}

	// Add Calendar Content
	calendar.innerHTML = calendarContent;
	calendarHeaderSkeleton.style.display = 'none';
	calendarHeader.style.display = 'block';
}

// Show Events
function showEvents() {
	const year = d.getFullYear();
	const calendarCards = document.querySelector('.calendar-cards .cards');
	const eventMonths = Object.keys(calendarEvents[year]);
	var calendarCardsContent = '';
	var boomgaardcafeCardsContent = '';

	// Loop Through Months
	for (let i = 0; i < eventMonths.length; i++) {
		let month = eventMonths[i];
		let eventDays = Object.keys(calendarEvents[year][month]);

		// Loop Through Days
		for (let j = 0; j < eventDays.length; j++) {
			// Check If Day Has Event
			if (calendarEvents[year][month][eventDays[j]].Type == 'event') {
				// Get Event Variables
				let eventTitle = calendarEvents[year][month][eventDays[j]].Title;
				let eventDescription = calendarEvents[year][month][eventDays[j]].Description;
				let startMonth = month;
				let startDay = eventDays[j];
				let endMonth = month;
				let endDay = eventDays[j];

				// Check If Event Is Already Added
				if (calendarEventsContent[eventTitle] != undefined) continue;

				// Check If Event Is Multiple Days (Same Month)
				for (let l = eventDays[j]; l <= new Date(year, calendarMonths.indexOf(month) + 1, 0).getDate(); l++) {
					if (calendarEvents[year][month][l] == undefined) {
						break;
					} else if (calendarEvents[year][month][l].Title == eventTitle && calendarEvents[year][month][l].Description == eventDescription) {
						endDay = l;
					}
				}

				// Check If Event Is Multiple Days (Different Month)
				let nextMonthIndex = calendarMonths.indexOf(month) + 2 == 12 ? 0 : calendarMonths.indexOf(month) + 2;
				for (let k = 1; k < new Date(year, nextMonthIndex, 0).getDate(); k++) {
					if (calendarEvents[year][eventMonths[i + 1]][k] == undefined) {
						break;
					} else if (calendarEvents[year][eventMonths[i + 1]][k].Title == eventTitle && calendarEvents[year][eventMonths[i + 1]][k].Description == eventDescription) {
						endMonth = eventMonths[i + 1];
						endDay = k;
					}
				}

				// Add Event To Calendar Events Content
				calendarEventsContent[eventTitle] = {
					Title: eventTitle,
					Description: eventDescription,
					StartMonth: startMonth,
					StartDay: startDay,
					EndMonth: endMonth,
					EndDay: endDay,
				};
			} else if (calendarEvents[year][month][eventDays[j]].Type == 'boomgaardcafe') {
				// Add Event To Boomgaardcafe Events
				boomgaardcafeEvents.push({
					Month: month,
					Day: eventDays[j],
				});
			}
		}
	}

	// Build Calendar Cards Content (Boomgaardcafe)
	if (boomgaardcafeEvents.length > 0) {
		var daysInMonth = [];
		var lastMonth = boomgaardcafeEvents[0].Month;

		// Loop Through Boomgaardcafe Events
		for (let i = 0; i < boomgaardcafeEvents.length; i++) {
			if (lastMonth == boomgaardcafeEvents[i].Month) {
				daysInMonth.push(boomgaardcafeEvents[i].Day);
			} else {
				boomgaardcafeCardsContent += `
					<p class='calendar-boomgaardcafe-dates' data-month='${calendarMonths[calendarMonths.indexOf(lastMonth)]}'>${daysInMonth.join(' / ')} ${calendarMonthsDutch[
					calendarMonths.indexOf(lastMonth)
				]
					.charAt(0)
					.toUpperCase()}${calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].slice(1)}</p>`;
				daysInMonth = [boomgaardcafeEvents[i].Day];
			}
			lastMonth = boomgaardcafeEvents[i].Month;

			if (boomgaardcafeEvents[i + 1] == undefined) {
				boomgaardcafeCardsContent += `<p class='calendar-boomgaardcafe-dates' data-month='${calendarMonths[calendarMonths.indexOf(lastMonth)]}'>${daysInMonth.join(
					' / '
				)} ${calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].charAt(0).toUpperCase()}${calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].slice(1)}
					</p>`;
			}
			var description = boomgaardcafeEvents['Description'];
		}

		calendarCardsContent += `<div class='calendar-card'><h3>Boomgaardcafé</h3><div class='card-content'><p class='highlight-text'>${
			description || ''
		}</p>${boomgaardcafeCardsContent}</div></div>`;
	}

	// Build Calendar Cards Content (Events)
	for (let i = 0; i < Object.keys(calendarEventsContent).length; i++) {
		let event = calendarEventsContent[Object.keys(calendarEventsContent)[i]];
		let startMonth = event.StartMonth;
		let startDay = event.StartDay;
		let endMonth = event.EndMonth;
		let endDay = event.EndDay;
		let eventTitle = event.Title;
		let eventDescription = event.Description;

		var eventDate = '';

		if (startMonth == endMonth) {
			eventDate = `${startDay} - ${endDay} ${calendarMonthsDutchShort[calendarMonths.indexOf(startMonth)]} ${year}`;
		} else {
			eventDate =
				`${startDay} ${calendarMonthsDutchShort[calendarMonths.indexOf(startMonth)]} - ` +
				`${endDay} ${calendarMonthsDutchShort[calendarMonths.indexOf(endMonth)]} ${year}`;
		}

		calendarCardsContent += `<div class="calendar-card"><h3>${eventTitle}</h3><p class="status" data-month="${startMonth}">${eventDate}</p><p class="highlight-text">${
			eventDescription || ''
		}</p></div>`;
	}

	// Add Calendar Cards Content To Calendar Cards
	if (Object.keys(calendarEventsContent).length == 0) {
		calendarCards.innerHTML = '<h4 class="highlight-text">Geen evenementen gevonden</h4>';
	} else {
		document.querySelectorAll('.calendar-card-skeleton').forEach((element) => {
			element.style.display = 'none';
		});
		calendarCards.innerHTML += calendarCardsContent;
	}

	calendarCards.style.marginTop = '20px';

	// Update Calendar When Clicking On Event Date
	document.querySelectorAll('.calendar-boomgaardcafe-dates, .status').forEach((element) => {
		element.addEventListener('click', function () {
			let month = element.getAttribute('data-month');

			calendar.innerHTML = '';
			updateCalendar(month);
			tooltip();

			scrollTo(0, 0);
		});
	});
}

function parseEvents(events) {
	for (let i = 0; i < events.length; i++) {
		let startTime = events[i]['start']['dateTime'];
		let endTime = events[i]['end']['dateTime'];

		if (startTime == undefined) {
			startTime = events[i]['start']['date'];
		}

		if (endTime == undefined) {
			endTime = events[i]['end']['date'];
		}

		let date = startTime.split('T')[0];
		let year = date.split('-')[0];
		let month = date.split('-')[1];
		let day = date.split('-')[2];

		let endDate = endTime.split('T')[0];
		let endMonth = endDate.split('-')[1];
		let endDay = endDate.split('-')[2];

		if (day[0] == '0') {
			day = day.split('0')[1];
		}

		if (endDay[0] == '0') {
			endDay = endDay.split('0')[1];
		}

		if (Object.keys(calendarEvents).indexOf(year) == -1) {
			calendarEvents[year] = {
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
				let type = 'Not public';
				let title = events[i]['summary'];
				let description = '';

				if (events[i]['summary'].toLowerCase().includes('reservering')) {
					type = 'res';
					title = events[i]['summary'].replace('Reservering', '').replace('reservering', '');
				} else if (events[i]['summary'].toLowerCase().includes('optie')) {
					type = 'option';
					title = events[i]['summary'].replace('Optie', '').replace('optie', '');
				} else if (events[i]['summary'].toLowerCase().includes('event')) {
					type = 'event';
					title = events[i]['summary'].replace('Event', '').replace('event', '');
					description = events[i]['description'];
				} else if (events[i]['summary'] == 'Boomgaardcafé') {
					type = 'boomgaardcafe';
					title = events[i]['summary'];
					if (events[i]['description'] != undefined) {
						description = events[i]['description'];
					}
				}

				for (let j = parseInt(day); j < parseInt(endDay); j++) {
					calendarEvents[year][Object.keys(calendarEvents[year])[month - 1]][j] = {
						Type: type,
						Title: title,
						Description: description,
					};
				}

				if (description != '' && type == 'boomgaardcafe') {
					boomgaardcafeEvents['Description'] = description;
				}
			} else if (year >= currentYear) {
				let type = 'Not public';
				let title = events[i]['summary'];
				let description = '';

				if (events[i]['summary'].toLowerCase().includes('reservering')) {
					type = 'res';
					title = events[i]['summary'].replace('Reservering', '').replace('reservering', '');
				} else if (events[i]['summary'].toLowerCase().includes('optie')) {
					type = 'option';
					title = events[i]['summary'].replace('Optie', '').replace('optie', '');
				} else if (events[i]['summary'].toLowerCase().includes('event')) {
					type = 'event';
					title = events[i]['summary'].replace('Event', '').replace('event', '');
					description = events[i]['description'];
				} else if (events[i]['summary'] == 'Boomgaardcafé') {
					type = 'boomgaardcafe';
					title = events[i]['summary'];
				}

				for (let j = month; j <= endMonth; j++) {
					if (j == month) {
						for (let k = day; k <= new Date(year, month - 1, 0).getDate(); k++) {
							calendarEvents[year][Object.keys(calendarEvents[year])[j - 1]][k] = {
								Type: type,
								Title: title,
								Description: description,
							};
						}
					} else if (j == endMonth) {
						for (let k = 1; k < endDay; k++) {
							calendarEvents[year][Object.keys(calendarEvents[year])[j - 1]][k] = {
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
getCalendar().then((calendar) => {
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
	updateCalendar(Object.keys(calendarEvents[d.getFullYear()])[d.getMonth()], d.getFullYear());
	showEvents();
	tooltip();
});

// Get Previous Month
calendarPrevMonth.addEventListener('click', function () {
	calendar.innerHTML = '';
	updateCalendar(this.getAttribute('data-month'), this.getAttribute('data-year'));

	tooltip();
});

// Get Next Month
calendarNextMonth.addEventListener('click', function () {
	let year = this.getAttribute('data-year');

	if (Object.keys(calendarEvents).indexOf(year) == -1) {
		calendarEvents[year] = {
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
	updateCalendar(this.getAttribute('data-month'), this.getAttribute('data-year'));

	tooltip();
});

// Get New Month (Input)
calendarHeader.addEventListener('click', function () {
	var inputMonth = document.querySelector('.calendar-input-month');
	inputMonth.showPicker();

	inputMonth.addEventListener('change', function () {
		if (inputMonth.value != '') {
			var monthIndex = inputMonth.value.split('-')[1];
			var year = calendarHeader.getAttribute('data-year');
			var month = Object.keys(calendarEvents[year])[monthIndex - 1];

			calendar.innerHTML = '';
			updateCalendar(month, year);

			tooltip();
		}
	});
});
