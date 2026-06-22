const calendar = document.querySelector('.calendar-content');
const calendarHeader = document.querySelector('.calendar-header-name');
const calendarHeaderSkeleton = document.querySelector('.skeleton-header-name');
const calendarPrevMonth = document.querySelector('.fa-chevron-left');
const calendarNextMonth = document.querySelector('.fa-chevron-right');

const optionDayElementTemplate = `<div class='calendar-day calendar-active calendar-option calendar-tooltip calendar-tooltip-option'><p>1</p><div class='calendar-top'><p>Optie</p><i></i></div></div>`;
const reservationDayElementTemplate = `<div class='calendar-day calendar-active calendar-res calendar-tooltip calendar-tooltip-res'><p>1</p><div class='calendar-top'><p>Gereserveerd</p><i></i></div></div>`;
const eventDayElementTemplate = `<div class='calendar-day calendar-active calendar-event calendar-tooltip calendar-tooltip-event'><p>1</p><div class='calendar-top'><p>Evenement</p><i></i></div></div>`;
const boomgaardcafeDayElementTemplate = `<div class='calendar-day calendar-active calendar-boomgaardcafe calendar-tooltip calendar-tooltip-boomgaardcafe'><p>1</p><div class='calendar-top'><p>Boomgaardcafé</p><i></i></div></div>`;

const cachedYearsData = new Map();
const currentDate = new Date();
let currentActiveYear = currentDate.getFullYear();
let currentActiveMonth = currentDate.getMonth() + 1;

// Get Google Calendar
const fetchCalendar = async (year) => {
	const minTime = new Date(year, 0, 1);
	const maxTime = new Date(year, 11, 31, 23, 59, 59);

	const response = await fetch(
		`https://www.googleapis.com/calendar/v3/calendars/planning.hoevelootens@gmail.com/events?key=AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA&timeMin=${minTime.toISOString()}&timeMax=${maxTime.toISOString()}`,
		{
			method: 'GET',
		},
	);
	return response.json();
};

// Parse Google Calendar events
const parseEvents = (events) => {
	const parsedEvents = {};
	const getEventInfo = (event) => {
		const id = event.id;
		const startDate = new Date(event.start.dateTime || event.start.date);
		const endDate = new Date(event.end.dateTime || event.end.date);
		let type;
		let title = event.summary;
		const description = event.description || '';

		// Determine event type based on title keywords
		if (title.toLowerCase().includes('optie')) {
			type = 'Option';
			title = title.replace(/Optie\s*/i, '').trim();
		} else if (title.toLowerCase().includes('reservering') || title.toLowerCase().includes('reservatie')) {
			type = 'Reservation';
			title = title.replace(/Reservering\s*/i, '').trim();
			title = title.replace(/Reservatie\s*/i, '').trim();
		} else if (title.toLowerCase().includes('evenement') || title.toLowerCase().includes('event')) {
			type = 'Event';
			title = title.replace(/Evenement\s*/i, '').trim();
			title = title.replace(/Event\s*/i, '').trim();
		} else if (title.toLowerCase() === 'boomgaardcafé') {
			type = 'Boomgaardcafé';
			title = 'Boomgaardcafé';
		} else {
			type = 'Other';
		}

		// Determine if its a single day or multi-day event
		const timeDiff = endDate.getTime() - startDate.getTime();
		const isSingleDay = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) === 1;

		return {
			id: id,
			type: type,
			title: title,
			description: description,
			startDateObject: startDate,
			endDateObject: endDate,
			startMonth: startDate.getMonth(),
			startDay: startDate.getDate(),
			endMonth: endDate.getMonth(),
			endDay: endDate.getDate() - 1, // Subtract 1 day to get the correct end date
			isSingleDay: isSingleDay,
		};
	};

	Object.values(events).forEach((event) => {
		const eventInfo = getEventInfo(event);

		// Use actual JS Date objects to handle multi-month spans correctly
		const currentCursor = new Date(eventInfo.startDateObject);
		const endDate = new Date(eventInfo.endDateObject);
		endDate.setDate(endDate.getDate() - 1); // Adjust end date to be inclusive

		// Loop through each day from start to end (inclusive)
		while (currentCursor <= endDate) {
			const currentMonth = currentCursor.getMonth() + 1; // Months are 0-indexed in JS Date
			const currentDay = currentCursor.getDate();

			parsedEvents[currentMonth] ??= {};
			parsedEvents[currentMonth][currentDay] ??= eventInfo;

			currentCursor.setDate(currentCursor.getDate() + 1);
		}
	});
	return parsedEvents;
};

// Parse events to identify duplicates for card generation
const parseDuplicates = (events) => {
	const parsedEvents = {};

	Object.values(events).forEach((monthEvents) => {
		Object.values(monthEvents).forEach((event) => {
			if (!(event.type === 'Event' || event.type === 'Boomgaardcafé')) return; // Only group duplicates for 'Event' and 'Boomgaardcafé' types
			const hasDuplicates = Object.values(events).filter((month) => Object.values(month).some((e) => e.title === event.title)).length > 1;

			if (hasDuplicates) {
				parsedEvents[event.title] ??= {
					...event,
					Dates: [],
				};

				parsedEvents[event.title].Dates.push({
					startMonth: event.startMonth,
					startDay: event.startDay,
					endMonth: event.endMonth,
					endDay: event.endDay,
					startDateObject: event.startDateObject,
					endDateObject: event.endDateObject,
					isSingleDay: event.isSingleDay,
				});
			} else {
				parsedEvents[event.title] = event;
				parsedEvents[event.title].Dates = [
					{
						startMonth: event.startMonth,
						startDay: event.startDay,
						endMonth: event.endMonth,
						endDay: event.endDay,
						startDateObject: event.startDateObject,
						endDateObject: event.endDateObject,
						isSingleDay: event.isSingleDay,
					},
				];
			}
		});
	});

	return parsedEvents;
};

// Hover On Calendar Dates
const tooltip = () => {
	const tooltips = document.querySelectorAll('.calendar-tooltip');
	tooltips.forEach(function (tooltip, index) {
		tooltip.addEventListener('mouseover', () => positionTooltip(tooltip)); // On hover, launch the function below
	});

	tooltips.forEach(function (tooltip, index) {
		tooltip.addEventListener('mouseout', function () {
			this.childNodes[1].classList.remove('calendar-tooltip-show');
		});
	});
};

// Position Tooltip
const positionTooltip = (parent) => {
	const tooltip = parent.childNodes[1];

	// Get calculated ktooltip coordinates and size
	const tooltip_rect = parent.getBoundingClientRect();
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
};

// Initialize calendar
const initializeCalendarMonth = (year, month, events) => {
	const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JS Date
	const amountOfDays = new Date(year, month, 0).getDate();
	const monthIndex = month - 1; // Adjust for 0-indexed months in JS Date
	const monthName =
		new Date(year, monthIndex).toLocaleString('nl-NL', { month: 'long' }).charAt(0).toUpperCase() +
		new Date(year, monthIndex).toLocaleString('nl-NL', { month: 'long' }).slice(1);
	const monthEvents = events[month] || {};
	const startDayOfWeek = new Date(year, monthIndex, 1).getDay();
	let monthContent = '';

	// Set header
	calendarHeader.textContent = `${monthName} ${year}`;
	calendarHeaderSkeleton.style.display = 'none';
	calendarHeader.style.display = 'block';

	// Set previous and next month buttons
	if (monthIndex == currentMonth - 1 && year == currentActiveYear) {
		calendarPrevMonth.style.color = '#F5F5F5';
		calendarPrevMonth.style.cursor = 'default';
	} else {
		calendarPrevMonth.style.color = '#FCC000';
		calendarPrevMonth.setAttribute('data-month', month == 'January' ? 12 : month - 1);
		calendarPrevMonth.setAttribute('data-year', month == 'January' ? parseInt(year) - 1 : year);
		calendarPrevMonth.style.cursor = 'pointer';
	}

	calendarNextMonth.style.color = '#FCC000';
	calendarNextMonth.setAttribute('data-month', month == 'December' ? 1 : month + 1);
	calendarNextMonth.setAttribute('data-year', month == 'December' ? parseInt(year) + 1 : year);
	calendarNextMonth.style.cursor = 'pointer';

	// Generate calendar grid
	for (let i = 0; i < startDayOfWeek - 1; i++) {
		monthContent += "<div class='calendar-day'><p></p></div>";
	}

	for (let day = 1; day <= amountOfDays; day++) {
		if (monthEvents[day]) {
			if (monthEvents[day].type == 'Event') {
				monthContent += eventDayElementTemplate.replace(/1/g, day).replace(/<p>Evenement<\/p>/, `<p>${monthEvents[day].title}</p>`);
			} else if (monthEvents[day].type == 'Reservation') {
				monthContent += reservationDayElementTemplate.replace(/1/g, day);
			} else if (monthEvents[day].type == 'Option') {
				monthContent += optionDayElementTemplate.replace(/1/g, day);
			} else if (monthEvents[day].type == 'Boomgaardcafé') {
				monthContent += boomgaardcafeDayElementTemplate.replace(/1/g, day);
			}
		} else {
			// If Day Has No Event
			monthContent += "<div class='calendar-day'><p>" + day + '</p></div>';
		}
	}

	calendar.innerHTML = monthContent;

	tooltip();
};

// Initialize event cards
const initializeEventCards = (events) => {
	const cardsContainer = document.querySelector('.calendar-cards .cards');
	const parsedGroupedEvents = parseDuplicates(events);
	let cardsContent = '';

	Object.values(parsedGroupedEvents).forEach((eventData) => {
		const hasDuplicates = eventData.Dates.length > 1;
		const year = eventData.Dates[0].startDateObject.getFullYear();

		if (eventData.type === 'Boomgaardcafé') {
			let dates = '';

			Object.keys(eventData.Dates).forEach((month) => {
				const days = eventData.Dates[month];
				const dutchMonth = new Date(year, month - 1).toLocaleString('nl-NL', { month: 'long' });

				dates += `<p class='calendar-boomgaardcafe-dates' data-month='${month}'>${days.join(' / ')} ${dutchMonth.charAt(0).toUpperCase()}${dutchMonth.slice(1)}</p>`;
			});

			cardsContent += `<div class='calendar-card'><h3>Boomgaardcafé</h3><div class='card-content'><p>${eventData.description || ''}</p>${dates}</div></div>`;
			return; // Skip further processing for Boomgaardcafé events
		}

		if (hasDuplicates) {
			cardsContent += `<div class="calendar-card"><h3>${eventData.title}</h3><p class="status" data-month="${eventData.Dates[0].startMonth + 1}">${eventData.Dates.map(
				(date) => `${date.startDay} ${new Date(year, date.startMonth).toLocaleString('nl-NL', { month: 'short' })}`,
			).join(' / ')} ${year}</p><p>${eventData.description || ''}</p></div>`;
		} else {
			cardsContent += `<div class="calendar-card"><h3>${eventData.title}</h3><p class="status" data-month="${eventData.Dates[0].startMonth + 1}">${eventData.Dates[0].startDay} ${new Date(year, eventData.Dates[0].startMonth).toLocaleString('nl-NL', { month: 'short' })} - ${eventData.Dates[0].endDay} ${
				eventData.Dates[0].startMonth == eventData.Dates[0].endMonth ? '' : new Date(year, eventData.Dates[0].endMonth).toLocaleString('nl-NL', { month: 'short' })
			} ${year}</p><p>${eventData.description || ''}</p></div>`;
		}
	});

	cardsContainer.innerHTML = cardsContent;
	document.querySelectorAll('.calendar-cards .cards .calendar-card').forEach((card) => {
		card.addEventListener('click', () => {
			const month = card.querySelector('.status').getAttribute('data-month');
			loadCalendarView(currentActiveYear, parseInt(month));
		});
	});
};

// Load calendar view for a specific month and year
const loadCalendarView = async (targetYear, targetMonth) => {
	// Show loading skeleton while setting up views
	calendarHeaderSkeleton.style.display = 'block';
	calendarHeader.style.display = 'none';

	// Load dynamic runtime entries from memory maps if previously compiled
	if (!cachedYearsData.has(targetYear)) {
		const rawPayload = await fetchCalendar(targetYear);
		if (!rawPayload || !rawPayload.items) {
			calendar.innerHTML = '<p class="error">Er is een fout opgetreden bij het laden van de kalender.</p>';
			return;
		}
		const compiledEvents = parseEvents(rawPayload.items);
		cachedYearsData.set(targetYear, compiledEvents);
	}

	// Update mutable values
	currentActiveYear = targetYear;
	currentActiveMonth = targetMonth;

	const targetYearEvents = cachedYearsData.get(targetYear);
	initializeCalendarMonth(targetYear, targetMonth, targetYearEvents);
	initializeEventCards(targetYearEvents);
};

// Safe Navigational Events Hooks
calendarPrevMonth.addEventListener('click', () => {
	const actualDate = new Date();
	const constraintIndex = actualDate.getMonth();
	const constraintYear = actualDate.getFullYear();

	// Block click tracking backward steps if lower bounds are crossed
	if (currentActiveYear < constraintYear || (currentActiveYear === constraintYear && currentActiveMonth - 1 <= constraintIndex)) {
		return;
	}

	let previousMonth = currentActiveMonth - 1;
	let previousYear = currentActiveYear;

	if (previousMonth < 1) {
		previousMonth = 12;
		previousYear -= 1;
	}

	loadCalendarView(previousYear, previousMonth);
});

calendarNextMonth.addEventListener('click', () => {
	let nextMonth = currentActiveMonth + 1;
	let nextYear = currentActiveYear;

	if (nextMonth > 12) {
		nextMonth = 1;
		nextYear += 1;
	}

	loadCalendarView(nextYear, nextMonth);
});

// Primary Entry Initialization Call
loadCalendarView(currentActiveYear, currentActiveMonth);
