// VERSION: 1.0

// Variables
const d = new Date();
const calendar = document.querySelector(".calendar-content");
const calendarHeader = document.querySelector(".calendar-header-name");
const calendarHeaderSkeleton = document.querySelector(".skeleton-header-name");
const calendarPrevMonth = document.querySelector(".fa-chevron-left");
const calendarNextMonth = document.querySelector(".fa-chevron-right");
const calendarMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // English
const calendarMonthsDutch = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]; // Dutch
const calendarMonthsDutchShort = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]; // Dutch Short
const calendarData = { // Create Object With Dates, Start Week Day And Month Name For Each Month
    "January": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 7,
        "Name": "Januari"
    },
    "February": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        "StartWeekDay": 3,
        "Name": "Februari"
    },
    "March": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 3,
        "Name": "Maart"
    },
    "April": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        "StartWeekDay": 6,
        "Name": "April"
    },
    "May": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 1,
        "Name": "Mei"
    },
    "June": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        "StartWeekDay": 4,
        "Name": "Juni"
    },
    "July": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 6,
        "Name": "Juli"
    },
    "August": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 2,
        "Name": "Augustus"
    },
    "September": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        "StartWeekDay": 5,
        "Name": "September"
    },
    "October": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 7,
        "Name": "Oktober"
    },
    "November": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        "StartWeekDay": 3,
        "Name": "November"
    },
    "December": {
        "Dates": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        "StartWeekDay": 5,
        "Name": "December"
    }
}

// Calendar Events
let calendarEvents = {
    "January": {},
    "February": {},
    "March": {},
    "April": {},
    "May": {},
    "June": {},
    "July": {},
    "August": {},
    "September": {},
    "October": {},
    "November": {},
    "December": {}
}
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
function updateCalendar(month) {
    // Get Variables Based On Month
    let index = Object.keys(calendarData).indexOf(month);
    let year = d.getFullYear();
    let name = calendarData[month].Name;
    let dates = calendarData[month].Dates;
    let events = calendarEvents[month];
    let startWeekDay = calendarData[month].StartWeekDay;
    let calendarContent = "";

    calendarHeader.innerHTML = name + " " + year;

    // Change Prev Button
    if (index == 0) {
        calendarPrevMonth.style.color = "#F5F5F5";
        calendarPrevMonth.style.cursor = "default";
    } else {
        calendarPrevMonth.style.color = "#FCC000";
        calendarPrevMonth.setAttribute("data-month", Object.keys(calendarData)[index - 1])
        calendarPrevMonth.style.cursor = "pointer";
    }

    // Change Next Button
    if (index == 11) {
        calendarNextMonth.style.color = "#F5F5F5";
        calendarNextMonth.style.cursor = "default";
    } else {
        calendarNextMonth.style.color = "#FCC000";
        calendarNextMonth.setAttribute("data-month", Object.keys(calendarData)[index + 1])
        calendarNextMonth.style.cursor = "pointer";
    }

    // Add Empty Days
    for (let i = 0; i < startWeekDay - 1; i++) {
        calendarContent += "<div class='calendar-day'><p></p></div>";
    }

    // Add Days
    for (let i = 0; i < dates.length; i++) {
        if (events[dates[i]]) { // Check If Day Has Event
            if (events[dates[i]].Type == "event") { // Check If Event Is Event
                calendarContent += "<div class='calendar-day calendar-active calendar-event calendar-tooltip calendar-tooltip-event' id='day-" + dates[i] + "'><p>" + dates[i] + "</p><div class='calendar-top'><p>" + events[dates[i]].Title + "</p><i></i></div></div>";
            } else if (events[dates[i]].Type == "res") { // Check If Event Is Reservation
                calendarContent += "<div class='calendar-day calendar-active calendar-res calendar-tooltip calendar-tooltip-res'><p>" + dates[i] + "</p><div class='calendar-top'><p>Gerserveerd</p><i></i></div></div>";
            } else if (events[dates[i]].Type == "option") { // Check If Event Is Option
                calendarContent += "<div class='calendar-day calendar-active calendar-option'><p>" + dates[i] + "</p></div>";
            } else if (events[dates[i]].Type == "boomgaardcafe") { // Check If Event Is Boomgaardcafe
                calendarContent += "<div class='calendar-day calendar-active calendar-boomgaardcafe calendar-tooltip calendar-tooltip-boomgaardcafe'><p>" + dates[i] + "</p><div class='calendar-top'><p>Boomgaardcafé</p><i></i></div></div>";
            }
        } else { // If Day Has No Event
            calendarContent += "<div class='calendar-day'><p>" + dates[i] + "</p></div>";
        }
    }

    // Add Calendar Content
    calendar.innerHTML = calendarContent;
    calendarHeaderSkeleton.style.display = "none";
    calendarHeader.style.display = "block";
}

// Show Events
function showEvents() {
    const calendarCards = document.querySelector(".calendar-cards .cards");
    const eventMonths = Object.keys(calendarEvents);
    var calendarCardsContent = ''
    var boomgaardcafeCardsContent = ''
    
    // Loop Through Months
    for (let i = 0; i < eventMonths.length; i++) {
        let month = eventMonths[i];
        let eventDays = Object.keys(calendarEvents[month]);

        // Loop Through Days
        for (let j = 0; j < eventDays.length; j++) {
            // Check If Day Has Event
            if (calendarEvents[month][eventDays[j]].Type == "event") {
                // Get Event Variables
                let eventTitle = calendarEvents[month][eventDays[j]].Title
                let eventDescription = calendarEvents[month][eventDays[j]].Description;
                let startMonth = month;
                let startDay = eventDays[j];
                let endMonth = month;
                let endDay = eventDays[j];
                
                // Check If Event Is Already Added
                if (calendarEventsContent[eventTitle] != undefined) continue;

                // Check If Event Is Multiple Days (Same Month)
                for (let l = eventDays[j]; l <= calendarData[month].Dates.length; l++) {
                    if (calendarEvents[month][l] == undefined) {
                        break;
                    } else if (calendarEvents[month][l].Title == eventTitle && calendarEvents[month][l].Description == eventDescription) {
                        endDay = l;
                    }
                }

                // Check If Event Is Multiple Days (Different Month)
                for (let k = 1; k < calendarData[eventMonths[i+1]].Dates.length; k++) {
                    if (calendarEvents[eventMonths[i+1]][k] == undefined) {
                        break;
                    } else if (calendarEvents[eventMonths[i+1]][k].Title == eventTitle && calendarEvents[eventMonths[i+1]][k].Description == eventDescription) {
                        endMonth = eventMonths[i+1];
                        endDay = k;
                    }
                }

                // Add Event To Calendar Events Content
                calendarEventsContent[eventTitle] = {
                    "Title": eventTitle,
                    "Description": eventDescription,
                    "StartMonth": startMonth,
                    "StartDay": startDay,
                    "EndMonth": endMonth,
                    "EndDay": endDay
                };
            } else if (calendarEvents[month][eventDays[j]].Type == "boomgaardcafe") {
                // Add Event To Boomgaardcafe Events
                boomgaardcafeEvents.push({
                    "Month": month,
                    "Day": eventDays[j]
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
                boomgaardcafeCardsContent += "<p class='calendar-boomgaardcafe-dates' data-month='" + calendarMonths[calendarMonths.indexOf(lastMonth)] + "'>" + daysInMonth.join(' / ') + " " + calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].charAt(0).toUpperCase() + calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].slice(1) + "</p>"
                daysInMonth = [boomgaardcafeEvents[i].Day];
            }
            lastMonth = boomgaardcafeEvents[i].Month;

            if (boomgaardcafeEvents[i+1] == undefined) {
                boomgaardcafeCardsContent += "<p class='calendar-boomgaardcafe-dates' data-month='" + calendarMonths[calendarMonths.indexOf(lastMonth)] + "'>" + daysInMonth.join(' / ') + " " + calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].charAt(0).toUpperCase() + calendarMonthsDutch[calendarMonths.indexOf(lastMonth)].slice(1) + "</p>"
            }
            var description = boomgaardcafeEvents['Description']
        }


        calendarCardsContent += "<div class='calendar-card'><h3>Boomgaardcafé</h3><div class='card-content'><p class='highlight-text'>" + description + "</p>" + boomgaardcafeCardsContent + "</div></div>"
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

        var eventDate = ''

        if (startMonth == endMonth) {
            eventDate = startDay + ' - ' + endDay + ' ' + calendarMonthsDutch[Object.keys(calendarData).indexOf(endMonth)] + ' 2023';
        } else {
            eventDate = startDay + ' ' + calendarMonthsDutchShort[Object.keys(calendarData).indexOf(startMonth)] + ' - ' + endDay + ' ' + calendarMonthsDutchShort[Object.keys(calendarData).indexOf(endMonth)] + ' 2023';
        }

        calendarCardsContent += '<div class="calendar-card"><h3>' + eventTitle + '</h3><p class="status" data-month="' + startMonth + '">' + eventDate + '</p><p class="highlight-text">' + eventDescription + '</p></div>';
    }

    // Add Calendar Cards Content To Calendar Cards
    if (Object.keys(calendarEventsContent).length == 0) {
        calendarCards.innerHTML = '<h4 class="highlight-text">Geen evenementen gevonden</h4>';
    } else {
        document.querySelectorAll('.calendar-card-skeleton').forEach((element) => {
            element.style.display = "none";
        });
        calendarCards.innerHTML += calendarCardsContent
    }

    calendarCards.style.marginTop = "20px";

    // Update Calendar When Clicking On Event Date
    document.querySelectorAll('.calendar-boomgaardcafe-dates, .status').forEach((element) => {
        element.addEventListener('click', function() {
            let month = element.getAttribute('data-month');
            
            calendar.innerHTML = "";
            updateCalendar(month);
            tooltip();

            scrollTo(0, 0);
        })
    });
}

function parseEvents(events) {
    for (let i = 0; i < events.length; i++) {
        let startTime = events[i]['start']['dateTime']
        let endTime = events[i]['end']['dateTime']

        if (startTime == undefined) {
            startTime = events[i]['start']['date']
        }

        if (endTime == undefined) {
            endTime = events[i]['end']['date']
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

        if (events[i]['summary'] != undefined) {
            if (day == endDay && year == 2023) {
                let type = 'Not public';
                let title = events[i]['summary'];
                let description = '';

                if (events[i]['summary'].includes(' Reservering')) {
                    type = 'res';
                    title = events[i]['summary'].split(' Reservering')[0];
                } else if (events[i]['summary'].includes(' Optie')) {
                    type = 'option';
                    title = events[i]['summary'].split(' Optie')[0];
                } else if (events[i]['summary'].includes(' Event')) {
                    type = 'event';
                    title = events[i]['summary'].split(' Event')[0];
                    description = events[i]['description'];
                } else if (events[i]['summary'] == 'Boomgaardcafé') {
                    type = 'boomgaardcafe';
                    title = events[i]['summary'];
                    if (events[i]['description'] != undefined) {description = events[i]['description']}
                }

                calendarEvents[Object.keys(calendarEvents)[month-1]][day] = {
                    "Type": type,
                    "Title": title
                }

                if (description != '' && type == 'boomgaardcafe') {
                    boomgaardcafeEvents['Description'] = description;
                }

            } else if (month == endMonth && year == 2023) {
                let type = 'Not public';
                let title = events[i]['summary'];
                let description = '';

                if (events[i]['summary'].includes(' Reservering')) {
                    type = 'res';
                    title = events[i]['summary'].split(' Reservering')[0];
                } else if (events[i]['summary'].includes(' Optie')) {
                    type = 'option';
                    title = events[i]['summary'].split(' Optie')[0];
                } else if (events[i]['summary'].includes(' Event')) {
                    type = 'event';
                    title = events[i]['summary'].split(' Event')[0];
                    description = events[i]['description'];
                } else if (events[i]['summary'] == 'Boomgaardcafé') {
                    type = 'boomgaardcafe';
                    title = events[i]['summary'];
                    if (events[i]['description'] != undefined) {description = events[i]['description']}
                }

                for (let j = day; j < endDay; j++) {
                    calendarEvents[Object.keys(calendarEvents)[month-1]][j] = {
                        "Type": type,
                        "Title": title,
                        "Description": description
                    }
                }

                if (description != '' && type == 'boomgaardcafe') {
                    boomgaardcafeEvents['Description'] = description;
                }
            
            } else if (year == 2023) {
                let type = 'Not public';
                let title = events[i]['summary'];
                let description = '';

                if (events[i]['summary'].includes(' Reservering')) {
                    type = 'res';
                    title = events[i]['summary'].split(' Reservering')[0];
                } else if (events[i]['summary'].includes(' Optie')) {
                    type = 'option';
                    title = events[i]['summary'].split(' Optie')[0];
                } else if (events[i]['summary'].includes(' Event')) {
                    type = 'event';
                    title = events[i]['summary'].split(' Event')[0];
                    description = events[i]['description'];
                } else if (events[i]['summary'] == 'Boomgaardcafé') {
                    type = 'boomgaardcafe';
                    title = events[i]['summary'];
                }
                
                for (let j = month; j <= endMonth; j++) {
                    if (j == month) {
                        for (let k = day; k <= calendarData[Object.keys(calendarData)[month-1]].Dates.length; k++) {
                            calendarEvents[Object.keys(calendarEvents)[j-1]][k] = {
                                "Type": type,
                                "Title": title,
                                "Description": description
                            }
                        }
                    } else if (j == endMonth) {
                        for (let k = 1; k < endDay; k++) {
                            calendarEvents[Object.keys(calendarEvents)[j-1]][k] = {
                                "Type": type,
                                "Title": title,
                                "Description": description
                            }
                        }
                    }
                }
            }
        }
    }
}

// Hover On Calendar Dates
function tooltip() {
    var tooltips = document.querySelectorAll(".calendar-tooltip");
    tooltips.forEach(function(tooltip, index){
        tooltip.addEventListener("mouseover", positionTooltip); // On hover, launch the function below
    })

    tooltips.forEach(function(tooltip, index){
        tooltip.addEventListener("mouseout", function(){
            this.childNodes[1].classList.remove("calendar-tooltip-show");
        });
    });
}

// Position Tooltip
function positionTooltip(){
    // Get .ktooltiptext sibling
    var tooltip = this.childNodes[1];
    
    // Get calculated ktooltip coordinates and size
    var tooltip_rect = this.getBoundingClientRect();
    var tooltip_width = tooltip_rect.width;
    var tooltip_pos_right = tooltip_rect.right;
    var tooltip_pos_y = tooltip_rect.y;
    
    if (tooltip_pos_right + tooltip_width > window.innerWidth) {
        tooltip.style.left = '0px';
    }

    if (tooltip_pos_y < 0) {
        tooltip.style.top = '0px';
    }

    tooltip.classList.add("calendar-tooltip-show");
}

// Init Calendar
getCalendar().then(calendar => {
    const allEvents = calendar.items || [];
    let events = [];

    for (let i = 0; i < allEvents.length; i++) {
        let startTime = allEvents[i]['start']['dateTime']

        if (startTime == undefined) {
            startTime = allEvents[i]['start']['date']
        }

        let date = startTime.split('T')[0];
        let year = date.split('-')[0];

        if (year == 2023) {
            events = allEvents.slice(i);
            break
        }
    }

    parseEvents(events);
    updateCalendar(Object.keys(calendarEvents)[d.getMonth()]);
    showEvents();
});

// Get Previous Month
calendarPrevMonth.addEventListener("click", function() {
    calendar.innerHTML = "";
    updateCalendar(this.getAttribute("data-month"));

    tooltip();
});

// Get Next Month
calendarNextMonth.addEventListener("click", function() {
    calendar.innerHTML = "";
    updateCalendar(this.getAttribute("data-month"));

    tooltip();
});

// Get New Month (Input)
calendarHeader.addEventListener("click", function() {
    var inputMonth = document.querySelector(".calendar-input-month");
    inputMonth.showPicker();

    inputMonth.addEventListener("change", function() {
        if (inputMonth.value != "") {
            var monthIndex = inputMonth.value.split('-')[1];
            var month = Object.keys(calendarEvents)[monthIndex-1];
            
            calendar.innerHTML = "";
            updateCalendar(month);

            tooltip();
        }
    });
});