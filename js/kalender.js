const d = new Date();
const kalender = document.querySelector(".kalender-content");
const kalenderHeader = document.querySelector(".kalender-header-name");
const kalenderHeaderSkeleton = document.querySelector(".skeleton-header-name");
const kalenderPrevMonth = document.querySelector(".fa-chevron-left");
const kalenderNextMonth = document.querySelector(".fa-chevron-right");
const kalenderMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const kalenderMonthsDutch = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const kalenderMonthsDutchShort = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const kalenderData = {
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
let kalenderEvents = {
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
let kalenderEventsContent = {};
let boomgaardcafeEvents = [];

async function getCalendar() {    
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/planning.hoevelootens@gmail.com/events?key=AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA', {
        method: 'GET',
    });
    return response.json();
}

function updateKalender(month) {
    let index = Object.keys(kalenderData).indexOf(month);
    let year = d.getFullYear();
    let name = kalenderData[month].Name;
    let dates = kalenderData[month].Dates;
    let events = kalenderEvents[month];
    let startWeekDay = kalenderData[month].StartWeekDay;
    let kalenderContent = "";

    kalenderHeader.innerHTML = name + " " + year;

    if (index == 0) {
        kalenderPrevMonth.style.color = "#F5F5F5";
        kalenderPrevMonth.style.cursor = "default";
    } else {
        kalenderPrevMonth.style.color = "#FCC000";
        kalenderPrevMonth.setAttribute("data-month", Object.keys(kalenderData)[index - 1])
        kalenderPrevMonth.style.cursor = "pointer";
    }

    if (index == 11) {
        kalenderNextMonth.style.color = "#F5F5F5";
        kalenderNextMonth.style.cursor = "default";
    } else {
        kalenderNextMonth.style.color = "#FCC000";
        kalenderNextMonth.setAttribute("data-month", Object.keys(kalenderData)[index + 1])
        kalenderNextMonth.style.cursor = "pointer";
    }

    for (let i = 0; i < startWeekDay - 1; i++) {
        kalenderContent += "<div class='kalender-day'><p></p></div>";
    }

    for (let i = 0; i < dates.length; i++) {
        if (events[dates[i]]) { // Check if there is an event on this date
            if (events[dates[i]].Type == "event") {
                kalenderContent += "<div class='kalender-day kalender-active kalender-event kalender-tooltip kalender-tooltip-event' id='day-" + dates[i] + "'><p>" + dates[i] + "</p><div class='kalender-top'><p>" + events[dates[i]].Title + "</p><i></i></div></div>";
            } else if (events[dates[i]].Type == "res") {
                kalenderContent += "<div class='kalender-day kalender-active kalender-res kalender-tooltip kalender-tooltip-res'><p>" + dates[i] + "</p><div class='kalender-top'><p>Gerserveerd</p><i></i></div></div>";
            } else if (events[dates[i]].Type == "option") {
                kalenderContent += "<div class='kalender-day kalender-active kalender-option'><p>" + dates[i] + "</p></div>";
            } else if (events[dates[i]].Type == "boomgaardcafe") {
                kalenderContent += "<div class='kalender-day kalender-active kalender-boomgaardcafe kalender-tooltip kalender-tooltip-boomgaardcafe'><p>" + dates[i] + "</p><div class='kalender-top'><p>Boomgaardcafé</p><i></i></div></div>";
            }
        } else {
            kalenderContent += "<div class='kalender-day'><p>" + dates[i] + "</p></div>";
        }
    }

    kalender.innerHTML = kalenderContent;
    kalenderHeaderSkeleton.style.display = "none";
    kalenderHeader.style.display = "block";
}

function showEvents() {
    const kalenderCards = document.querySelector(".kalender-cards .cards");
    const eventMonths = Object.keys(kalenderEvents);
    var kalenderCardsContent = ''
    var boomgaardcafeCardsContent = ''
    
    for (let i = 0; i < eventMonths.length; i++) {
        let month = eventMonths[i];
        let eventDays = Object.keys(kalenderEvents[month]);
        for (let j = 0; j < eventDays.length; j++) {
            if (kalenderEvents[month][eventDays[j]].Type == "event") {
                let eventTitle = kalenderEvents[month][eventDays[j]].Title
                let eventDescription = kalenderEvents[month][eventDays[j]].Description;
                let startMonth = month;
                let startDay = eventDays[j];
                let endMonth = month;
                let endDay = eventDays[j];
                
                if (kalenderEventsContent[eventTitle] != undefined) {
                    continue;
                }

                for (let l = eventDays[j]; l <= kalenderData[month].Dates.length; l++) {
                    if (kalenderEvents[month][l] == undefined) {
                        break;
                    } else if (kalenderEvents[month][l].Title == eventTitle && kalenderEvents[month][l].Description == eventDescription) {
                        endDay = l;
                    }
                }

                for (let k = 1; k < kalenderData[eventMonths[i+1]].Dates.length; k++) {
                    if (kalenderEvents[eventMonths[i+1]][k] == undefined) {
                        break;
                    } else if (kalenderEvents[eventMonths[i+1]][k].Title == eventTitle && kalenderEvents[eventMonths[i+1]][k].Description == eventDescription) {
                        endMonth = eventMonths[i+1];
                        endDay = k;
                    }
                }

                kalenderEventsContent[eventTitle] = {
                    "Title": eventTitle,
                    "Description": eventDescription,
                    "StartMonth": startMonth,
                    "StartDay": startDay,
                    "EndMonth": endMonth,
                    "EndDay": endDay
                };
            } else if (kalenderEvents[month][eventDays[j]].Type == "boomgaardcafe") {
                boomgaardcafeEvents.push({
                    "Month": month,
                    "Day": eventDays[j]
                });
            }
        }
    }
    
    if (boomgaardcafeEvents.length > 0) {
        var daysInMonth = [];
        var lastMonth = boomgaardcafeEvents[0].Month;
        for (let i = 0; i < boomgaardcafeEvents.length; i++) {
            if (lastMonth == boomgaardcafeEvents[i].Month) {
                daysInMonth.push(boomgaardcafeEvents[i].Day);
            } else {            
                boomgaardcafeCardsContent += "<p class='kalender-boomgaardcafe-dates' date-month='" + kalenderMonths[kalenderMonths.indexOf(lastMonth)] + "'>" + daysInMonth.join(' / ') + " " + kalenderMonthsDutch[kalenderMonths.indexOf(lastMonth)].charAt(0).toUpperCase() + kalenderMonthsDutch[kalenderMonths.indexOf(lastMonth)].slice(1) + "</p>"
                daysInMonth = [boomgaardcafeEvents[i].Day];
            }
            lastMonth = boomgaardcafeEvents[i].Month;

            if (boomgaardcafeEvents[i+1] == undefined) {
                boomgaardcafeCardsContent += "<p class='kalender-boomgaardcafe-dates' date-month='" + kalenderMonths[kalenderMonths.indexOf(lastMonth)] + "'>" + daysInMonth.join(' / ') + " " + kalenderMonthsDutch[kalenderMonths.indexOf(lastMonth)].charAt(0).toUpperCase() + kalenderMonthsDutch[kalenderMonths.indexOf(lastMonth)].slice(1) + "</p>"
            }
            var description = boomgaardcafeEvents['Description']
        }


        kalenderCardsContent += "<div class='kalender-card'><h3>Boomgaardcafé</h3><div class='card-content'><p class='highlight-text'>" + description + "</p>" + boomgaardcafeCardsContent + "</div></div>"
    }

    for (let i = 0; i < Object.keys(kalenderEventsContent).length; i++) {
        let event = kalenderEventsContent[Object.keys(kalenderEventsContent)[i]];
        let startMonth = event.StartMonth;
        let startDay = event.StartDay;
        let endMonth = event.EndMonth;
        let endDay = event.EndDay;
        let eventTitle = event.Title;
        let eventDescription = event.Description;

        var eventDate = ''

        if (startMonth == endMonth) {
            eventDate = startDay + ' - ' + endDay + ' ' + kalenderMonthsDutch[Object.keys(kalenderData).indexOf(endMonth)] + ' 2023';
        } else {
            eventDate = startDay + ' ' + kalenderMonthsDutchShort[Object.keys(kalenderData).indexOf(startMonth)] + ' - ' + endDay + ' ' + kalenderMonthsDutchShort[Object.keys(kalenderData).indexOf(endMonth)] + ' 2023';
        }

        kalenderCardsContent += '<div class="kalender-card"><h3>' + eventTitle + '</h3><p class="status" data-month="' + startMonth + '">' + eventDate + '</p><p class="highlight-text">' + eventDescription + '</p></div>';
    }

    if (Object.keys(kalenderEventsContent).length == 0) {
        kalenderCards.innerHTML = '<h4 class="highlight-text">Geen evenementen gevonden</h4>';
    } else {
        document.querySelectorAll('.kalender-card-skeleton').forEach((element) => {
            element.style.display = "none";
        });
        kalenderCards.innerHTML += kalenderCardsContent
    }

    kalenderCards.style.marginTop = "20px";

    document.querySelectorAll('.kalender-boomgaardcafe-dates').forEach((element) => {
        element.addEventListener('click', function() {
            let month = element.getAttribute('date-month');
            
            kalender.innerHTML = "";
            updateKalender(month);
            tooltip();

            scrollTo(0, 0);
        })
    });

    document.querySelectorAll('.status').forEach((element) => {
        element.addEventListener('click', function() {
            let month = element.getAttribute('data-month');
            
            kalender.innerHTML = "";
            updateKalender(month);
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

                kalenderEvents[Object.keys(kalenderEvents)[month-1]][day] = {
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
                    kalenderEvents[Object.keys(kalenderEvents)[month-1]][j] = {
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
                        for (let k = day; k <= kalenderData[Object.keys(kalenderData)[month-1]].Dates.length; k++) {
                            kalenderEvents[Object.keys(kalenderEvents)[j-1]][k] = {
                                "Type": type,
                                "Title": title,
                                "Description": description
                            }
                        }
                    } else if (j == endMonth) {
                        for (let k = 1; k < endDay; k++) {
                            kalenderEvents[Object.keys(kalenderEvents)[j-1]][k] = {
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

function tooltip() {
    var tooltips = document.querySelectorAll(".kalender-tooltip");
    tooltips.forEach(function(tooltip, index){
        tooltip.addEventListener("mouseover", position_tooltip); // On hover, launch the function below
    })

    tooltips.forEach(function(tooltip, index){
        tooltip.addEventListener("mouseout", function(){
            this.childNodes[1].classList.remove("kalender-tooltip-show");
        });
    });
}

function position_tooltip(){
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

    tooltip.classList.add("kalender-tooltip-show");
}

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
    updateKalender(Object.keys(kalenderEvents)[d.getMonth()]);
    showEvents();
});

kalenderPrevMonth.addEventListener("click", function() {
    kalender.innerHTML = "";
    updateKalender(this.getAttribute("data-month"));

    tooltip();
});

kalenderNextMonth.addEventListener("click", function() {
    kalender.innerHTML = "";
    updateKalender(this.getAttribute("data-month"));

    tooltip();
});

kalenderHeader.addEventListener("click", function() {
    var inputMonth = document.querySelector(".kalender-input-month");
    inputMonth.showPicker();

    inputMonth.addEventListener("change", function() {
        if (inputMonth.value != "") {
            var monthIndex = inputMonth.value.split('-')[1];
            var month = Object.keys(kalenderEvents)[monthIndex-1];
            
            kalender.innerHTML = "";
            updateKalender(month);

            tooltip();
        }
    });
});