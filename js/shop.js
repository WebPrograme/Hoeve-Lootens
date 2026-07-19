import { postRequest, getRequest } from '../modules/Requests.js';
import analytics from './analyse.js';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let data = []; // Events map, set once /api/events/init/public resolves.
let requestBody = {}; // Accumulated participant/payment data for the checkout flow.

const SHOP_HOME_PATHS = ['/shop/', '/shop/index.html', '/shop'];

// ---------------------------------------------------------------------------
// WebSocket (payment confirmation push)
// ---------------------------------------------------------------------------

const ws = new WebSocket('wss://hoeve-lootens.onrender.com');

ws.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.type === 'payment') {
		window.location.href = '/success/?usercode=' + message.ref + '&event=' + message.event;
	}
};

ws.onerror = (error) => {
	console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
	console.log('WebSocket connection closed:', event);
};

// ---------------------------------------------------------------------------
// Step visibility helpers
// ---------------------------------------------------------------------------

function showStep(el) {
	el.classList.add('shop-active');
	el.classList.remove('shop-hidden');
}

function hideStep(el) {
	el.classList.remove('shop-active');
	el.classList.add('shop-hidden');
}

// ---------------------------------------------------------------------------
// Home page articles
// ---------------------------------------------------------------------------

function AddArticles(articlesData, container) {
	let side = 'left';
	container.innerHTML = '';

	const sortedArticles = Object.values(articlesData).sort((a, b) => a.Order - b.Order);

	sortedArticles.forEach((article) => {
		const section = document.createElement('section');
		section.classList.add('container', 'm-auto');
		section.innerHTML = `<div class="row"></div>`;
		section.setAttribute('data-id', article.ID || article.Title);

		const imageContainer = document.createElement('div');
		imageContainer.classList.add('col-6');
		imageContainer.innerHTML = `<img src="../images/programma_${article.Image.Day.toLowerCase()}.png" alt="${article.Title}" class="fluid-img">`;

		const contentContainer = document.createElement('div');
		contentContainer.classList.add('col-6');
		contentContainer.innerHTML = `<h3 class="section-header">${article.Title}</h3>`;
		article.Content.forEach((line) => {
			contentContainer.innerHTML += `<p>${line}</p>`;
		});

		if (article.Button) {
			contentContainer.innerHTML += `<a class="btn btn-primary btn-primary-sm" href="${article.Button.Link}">${article.Button.Text}</a>`;
		}

		const row = section.querySelector('.row');
		if (side === 'left') {
			row.appendChild(imageContainer);
			row.appendChild(contentContainer);
		} else {
			row.appendChild(contentContainer);
			row.appendChild(imageContainer);
		}

		side = side === 'left' ? 'right' : 'left';
		container.appendChild(section);
	});
}

const FALLBACK_ARTICLES = {
	32036: {
		Content: [
			'Op zondag 3 mei starten we met de 10e editie van de KIDSRUN. Inschrijven kan ter plaatse vanaf 9u30. Deelname is gratis!',
			'Om 12u kan je luisteren naar aanstormend plaatselijk muzikaal talent. “Exit Anna” geeft het beste van zichzelf.',
			'Vanaf 12u kan je aanschuiven voor het Kermismenu. Er is keuze uit stoverij, vol-au-vent of veggie geserveerd met frietjes & fris slaatje. (volwassene: €17 en kind < 10 jaar: €9)',
		],
		ID: '32036',
		Image: {
			Day: 'Zondag',
			URL: 'https://firebasestorage.googleapis.com/v0/b/hoeve-lootens-497f9.appspot.com/o/Articles%2Fprogramma_zondag.png?alt=media&token=3674e90e-2bf2-4a47-9939-3c29e3e1486c',
		},
		Order: 3,
		Title: 'Zondag',
	},
	126934: {
		Content: [
			'Op vrijdagavond 1 mei opent Trappsitenbar Wondelgem de Meikermis@HoeveLootens. Kom proeven van een lekker trappistenbier. Maar er zijn ook andere dranken en hapjes te verkrijgen. Deuren gaan open om 19u.',
		],
		ID: '126934',
		Image: {
			Day: 'Vrijdag',
			URL: 'https://firebasestorage.googleapis.com/v0/b/hoeve-lootens-497f9.appspot.com/o/Articles%2Fprogramma_vrijdag.png?alt=media&token=932ca001-7530-44ab-a2ef-d48c05583e94',
		},
		Order: 1,
		Title: 'Vrijdag',
	},
	436657: {
		Content: [
			'Op zaterdagmiddag 2 mei kan je van 15u tot 18u proeven, maar vooral genieten, van onze verse wafels volgens het geheime recept van mémé Maria.',
			'Chef Wouter en Miss Justien van “Spelen met Eten” zorgen voor',
			'een smaakvolle workshop (geen inschrijving nodig). Tevens kunnen de kinderen zich uitleven op het springkasteel of met de hoevespelen.',
			'Tot slot is er nog een plantenruilbeurs: breng je eigen stekje of plant mee en ruil het voor een ander mooi exemplaar.',
			'Inschrijven is niet nodig! Toegang gratis',
		],
		ID: '436657',
		Image: {
			Day: 'Zaterdag',
			URL: 'https://firebaasestorage.googleapis.com/v0/b/hoeve-lootens-497f9.appspot.com/o/Articles%2Fprogramma_zaterdag.png?alt=media&token=bf70db19-2a39-46a1-b990-34e5d93668cd',
		},
		Order: 2,
		Title: 'Zaterdag',
	},
};

function loadShopTitle() {
	getRequest('/api/website/shop/title')
		.then((response) => {
			document.querySelector('.shop-title').innerHTML = response.data.title;
		})
		.catch((error) => {
			console.error('Error loading shop title:', error);
		});
}

function loadShopArticles() {
	getRequest('/api/website/shop/articles')
		.then((response) => {
			if (Object.keys(response.data).length === 0) {
				document.querySelector('.shop-articles').innerHTML = '<p>Er zijn momenteel geen artikelen beschikbaar.</p>';
			} else {
				AddArticles(response.data, document.querySelector('.shop-articles'));
			}
		})
		.catch((error) => {
			console.error('Error loading shop articles:', error);
			AddArticles(FALLBACK_ARTICLES, document.querySelector('.shop-articles'));
		});
}

// ---------------------------------------------------------------------------
// Random user code
// ---------------------------------------------------------------------------

// NOTE: this is called elsewhere with the *events* map, not a participants
// array, so `data[i].UserCode` never matches and the uniqueness check is a
// no-op in practice. Left as-is to avoid changing existing checkout behavior.
function getRandomIntInclusive(data, min, max) {
	const usedUserCodes = [];
	for (let i = 0; i < data.length; i++) {
		usedUserCodes.push(data[i].UserCode);
	}

	min = Math.ceil(min);
	max = Math.floor(max);

	while (true) {
		const random = Math.floor(Math.random() * (max - min + 1) + min); // min and max both inclusive
		if (!usedUserCodes.includes(random)) return random;
	}
}

// ---------------------------------------------------------------------------
// Event availability
// ---------------------------------------------------------------------------

function isEventWithinDateWindow(event) {
	const now = new Date();
	const start = event.StartDate !== undefined ? new Date(event.StartDate) : null;
	const end = event.EndDate !== undefined ? new Date(event.EndDate) : null;

	if (start !== null && now < start) return false;
	if (end !== null && now > end) return false;
	return true;
}

// ---------------------------------------------------------------------------
// Additional info step (Quiz / Food events)
// ---------------------------------------------------------------------------

function showAdditionalInfo(options, type, event) {
	window.scrollTo({ top: 0, behavior: 'smooth' });

	const container = document.querySelector('.shop-additional-list');
	const group = document.createElement('div');
	group.dataset.event = event;
	container.appendChild(group);

	Object.keys(options).forEach((key, index) => {
		const div = document.createElement('div');

		const label = document.createElement('label');
		label.classList.add('label');
		label.innerHTML = key + (type === 'Food' ? ' (€' + options[key] + ')' : '');
		label.setAttribute('for', key);

		const input = document.createElement('input');
		input.classList.add('shop-input', 'input');

		if (type === 'Quiz') {
			input.setAttribute('type', 'text');
		} else {
			input.setAttribute('type', 'number');
			input.setAttribute('min', '0');
			input.value = '0';
		}

		input.setAttribute('name', key);
		input.setAttribute('id', key);
		input.setAttribute('placeholder', key);

		div.appendChild(label);
		div.appendChild(input);

		if (type === 'Food') {
			if (Object.keys(options).length !== 1 || Object.keys(options).length !== index + 1) {
				if (index % 2 === 0) {
					const row = document.createElement('div');
					row.classList.add('shop-additional-input-group');
					group.appendChild(row);
				}
				group.querySelector('.shop-additional-input-group:last-child').appendChild(div);
			} else {
				group.appendChild(div);
			}
		} else {
			const row = document.createElement('div');
			row.classList.add('shop-additional-input-group');
			group.appendChild(row);
			group.querySelector('.shop-additional-input-group:last-child').appendChild(div);
		}
	});

	if (Object.keys(options).length > 1) group.querySelector('.shop-additional-input-group:last-child').style.marginBottom = '1rem';
}

function checkAdditionalInfo() {
	const groups = document.querySelectorAll('.shop-additional-list>div[data-event]');
	let valid = true;

	groups.forEach((group) => {
		const inputs = group.querySelectorAll('.input');

		if (inputs.length === 1) {
			if (inputs[0].value === '' || inputs[0].value === '0') valid = false;
		} else {
			let total = 0;
			inputs.forEach((input) => {
				if (input.value === '') input.value = '0';
				total += parseInt(input.value, 10);
			});

			if (isNaN(total) || total === 0) valid = false;
		}
	});

	document.querySelector('.shop-additional-next').disabled = !valid;
}

// ---------------------------------------------------------------------------
// Summary + payment steps
// ---------------------------------------------------------------------------

function showSummary(requestBody, type) {
	window.scrollTo({ top: 0, behavior: 'smooth' });

	const participant = requestBody;

	document.querySelector('.shop-summary-name').innerHTML = participant.FirstName + ' ' + participant.LastName;
	document.querySelector('.shop-summary-email').innerHTML = participant.Email;
	document.querySelector('.shop-summary-phone').innerHTML = participant.Phone;
	document.querySelector('.shop-summary-address').innerHTML = participant.Address;

	const eventRow = document.createElement('div');
	eventRow.classList.add('shop-summary-tickets-list-item');
	eventRow.innerHTML = `
			<div>
				<h4>${participant.Event}${type != 'Food' ? ' (' + participant.Quantity + ')' : ''}</h4>
				<h4>€${participant.Amount}</h4>
			</div>
			${
				participant.Options != undefined && type == 'Food'
					? Object.keys(participant.Options)
							.map((key) => {
								if (participant.Options[key] != 0) return `<div><p>${key}</p><p>${participant.Options[key]}x</p></div>`;
							})
							.join('')
					: ''
			}
		`;

	document.querySelector('.shop-summary-tickets-list').appendChild(eventRow);
	document.querySelector('.shop-summary-total').innerHTML = '€' + participant.Amount;
}

function showPayment(requestBody) {
	window.scrollTo({ top: 0, behavior: 'smooth' });

	document.querySelector('.shop-payment-total').innerHTML = '€' + requestBody['Amount'];
	document.querySelector('.shop-payment-ref').innerHTML = requestBody['UserCode'] + ' - ' + requestBody['Event'];

	postRequest('/api/bancontact/create-qr', {
		Amount: requestBody['Amount'],
		UserCode: requestBody['UserCode'],
		Event: requestBody['Event'],
	}).then((paymentRes) => {
		if (paymentRes.status == 200) {
			const links = paymentRes.data;
			document.querySelector('.shop-payment-qr').src = links['result']['qr'];
			document.querySelector('.shop-payment-mobile').href = links['result']['deeplink'];

			ws.send(JSON.stringify({ type: 'register', id: requestBody['UserCode'] }));
		}
	});
}

// ---------------------------------------------------------------------------
// Ticket rendering
// ---------------------------------------------------------------------------

function createTicketElement(eventName, event) {
	const soldOut = event.AvailablePlaces <= 0;
	const actionsHTML =
		event.Type === 'QR'
			? `<a class="shop-ticket-actions-plus" data-value="${eventName}"><i class="fa-solid fa-plus"></i></a>
			<a class="shop-ticket-actions-minus" data-value="${eventName}"><i class="fa-solid fa-minus"></i></a>`
			: `<a class="shop-ticket-actions-add" data-value="${eventName}"><i class="fa-regular fa-circle-check"></i></a>`;

	const ticket = document.createElement('div');
	ticket.classList.add('shop-ticket');
	if (soldOut) ticket.classList.add('shop-ticket-sold-out');

	ticket.innerHTML = `
		<div class="shop-ticket-start"></div>
		<div class="shop-ticket-body">
			<div>
				<h3>${eventName}</h3>
				<p class="status">${event.Date}</p>
			</div>
			${soldOut ? '' : `<div class="shop-ticket-amount" ${event.Type != 'QR' ? 'style="display: none;"' : ''}><h3>0</h3></div>`}
		</div>
		<div class="shop-ticket-actions">${actionsHTML}</div>
	`;

	return ticket;
}

function anyTicketSelected() {
	return Array.from(document.querySelectorAll('.shop-ticket-amount')).some((el) => el.querySelector('h3').innerHTML !== '0');
}

function refreshTicketSelectionUI(activeEventName) {
	const active = anyTicketSelected();
	document.querySelector('.shop-tickets-next').disabled = !active;

	document.querySelectorAll('.shop-ticket').forEach((ticket) => {
		const eventName = ticket.querySelector('.shop-ticket-body h3').innerHTML;
		if (eventName !== activeEventName) ticket.classList.toggle('shop-ticket-disabled', active);
	});
}

function registerTicketQuantityHandlers() {
	document.querySelectorAll('.shop-ticket-actions-plus').forEach((el) => {
		el.addEventListener('click', handleTicketPlus);
	});
	document.querySelectorAll('.shop-ticket-actions-minus').forEach((el) => {
		el.addEventListener('click', handleTicketMinus);
	});
}

function handleTicketPlus(e) {
	const eventName = e.currentTarget.getAttribute('data-value');
	const event = data.find((ev) => ev.Name === eventName);
	const amountContainer = e.currentTarget.parentElement.parentElement;
	const counter = amountContainer.querySelector('.shop-ticket-amount').querySelector('h3');
	const amount = parseInt(counter.innerHTML, 10);

	counter.innerHTML = amount + 1 > event.AvailablePlaces ? event.AvailablePlaces : amount + 1;
	amountContainer.classList.add('shop-ticket-amount-active');

	refreshTicketSelectionUI(eventName);
}

function handleTicketMinus(e) {
	const eventName = e.currentTarget.getAttribute('data-value');
	const event = data.find((ev) => ev.Name === eventName);
	const amountContainer = e.currentTarget.parentElement.parentElement;
	const counter = amountContainer.querySelector('.shop-ticket-amount').querySelector('h3');
	const amount = parseInt(counter.innerHTML, 10);

	counter.innerHTML = amount - 1 < 0 ? 0 : amount - 1;
	if (counter.innerHTML === '0') amountContainer.classList.remove('shop-ticket-amount-active');

	refreshTicketSelectionUI(eventName);
}

function registerTicketToggleHandlers() {
	document.querySelectorAll('.shop-ticket-actions-add, .shop-ticket:has(.shop-ticket-actions-add)').forEach((btn) => {
		btn.addEventListener('click', handleTicketToggle);
	});
}

function handleTicketToggle(e) {
	e.stopPropagation();

	const el = e.currentTarget.classList.contains('shop-ticket-actions-add')
		? e.currentTarget
		: e.currentTarget.classList.contains('shop-ticket')
			? e.currentTarget.querySelector('.shop-ticket-actions-add')
			: null;

	const eventName = el.getAttribute('data-value');
	const amountContainer = el.parentElement.parentElement;
	amountContainer.classList.toggle('shop-ticket-amount-active');
	el.parentElement.classList.toggle('shop-ticket-actions-active');

	const isActive = amountContainer.classList.contains('shop-ticket-amount-active');
	el.innerHTML = isActive ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-circle-check"></i>';
	amountContainer.querySelector('.shop-ticket-amount h3').innerHTML = isActive ? '1' : '0';

	refreshTicketSelectionUI(eventName);
}

// ---------------------------------------------------------------------------
// Tickets -> Info step
// ---------------------------------------------------------------------------

function handleTicketsNext() {
	window.scrollTo({ top: 0, behavior: 'smooth' });

	const chosenTicket = document.querySelector('.shop-ticket-amount-active');
	const eventName = chosenTicket.querySelector('h3').innerHTML;
	const event = data.find((ev) => ev.Name === eventName);
	const amount = chosenTicket.querySelector('.shop-ticket-amount h3').innerHTML;

	requestBody = {
		Event: eventName,
		Amount: parseInt(amount, 10) * event.Price,
		Quantity: parseInt(amount, 10),
		CreatedAt: new Date().toISOString().split('T')[0],
		PayMethod: 'Niet Betaald',
		PayDate: '--',
	};

	hideStep(document.querySelector('.shop-tickets'));
	showStep(document.querySelector('.shop-info'));

	restoreSavedContactInfo();
}

function restoreSavedContactInfo() {
	const savedData = JSON.parse(localStorage.getItem('shop-info'));
	if (!savedData) return;

	document.querySelector('.shop-info input[name="shop-firstname"]').value = savedData.FirstName;
	document.querySelector('.shop-info input[name="shop-lastname"]').value = savedData.LastName;
	document.querySelector('.shop-info input[name="shop-email"]').value = savedData.Email;
	document.querySelector('.shop-info input[name="shop-phone"]').value = savedData.Phone;
	document.querySelector('.shop-info input[name="shop-address"]').value = savedData.Address;
	document.querySelector('.shop-info input[name="shop-info-saved"]').checked = true;

	document.querySelector('.shop-info-next').disabled = false;
}

// ---------------------------------------------------------------------------
// Info -> Additional/Summary step
// ---------------------------------------------------------------------------

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function validateInfoInputs() {
	const allInputs = document.querySelectorAll('.shop-info input');
	let active = true;

	allInputs.forEach((el) => {
		if (el.value === '') active = false;

		if (el.name === 'shop-email') {
			const email = el.value.trim();
			const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
			el.classList.toggle('input-error', !isValidEmail);
			document.querySelector('.shop-email-error').classList.toggle('shop-hidden', isValidEmail);
			if (!isValidEmail) active = false;
		}
	});

	document.querySelector('.shop-info-next').disabled = !active;
}

function handleInfoNext() {
	const allInputs = document.querySelectorAll('.shop-info input');

	allInputs.forEach((el) => {
		if (el.value === '') el.value = null;
		el.value = el.value.trim();
	});

	allInputs[0].value = capitalize(allInputs[0].value);
	allInputs[1].value = capitalize(allInputs[1].value);
	allInputs[2].value = allInputs[2].value.toLowerCase();

	requestBody = Object.assign(requestBody, {
		FirstName: allInputs[0].value,
		LastName: allInputs[1].value,
		Email: allInputs[2].value,
		Phone: allInputs[3].value,
		Address: allInputs[4].value,
		UserCode: allInputs[0].value[0].toUpperCase() + allInputs[1].value[0].toUpperCase() + getRandomIntInclusive(data, 1000, 9999),
	});

	if (document.querySelector('.shop-info input[name="shop-info-saved"]').checked) {
		localStorage.setItem('shop-info', JSON.stringify(requestBody));
	} else {
		localStorage.removeItem('shop-info');
	}

	hideStep(document.querySelector('.shop-info'));
	const event = data.find((ev) => ev.Name === requestBody.Event);
	const eventType = event.Type;
	if (eventType === 'Quiz' || eventType === 'Food') {
		showAdditionalInfo(event.Options, eventType, requestBody.Event);
		document.querySelectorAll('.shop-additional input').forEach((el) => el.addEventListener('input', checkAdditionalInfo));
		showStep(document.querySelector('.shop-additional'));
	} else {
		showSummary(requestBody, eventType);
		showStep(document.querySelector('.shop-summary'));
	}
}

// ---------------------------------------------------------------------------
// Additional -> Summary step
// ---------------------------------------------------------------------------

function handleAdditionalNext() {
	const inputs = document.querySelectorAll('.shop-additional input');
	const eventName = requestBody.Event;
	const event = data.find((ev) => ev.Name === eventName);
	const type = event.Type;
	let eventPayload;

	if (type === 'Food') {
		const options = {};
		let amount = 0;
		let quantity = 0;

		inputs.forEach((input) => {
			const value = parseInt(input.value, 10);
			options[input.getAttribute('name')] = value;
			amount += value * parseFloat(event.Options[input.getAttribute('name')]);
			quantity += value;
		});

		eventPayload = { Event: eventName, Amount: amount, Quantity: quantity, Options: options };
	} else if (type === 'Quiz') {
		eventPayload = {
			Event: eventName,
			Amount: parseFloat(event.Price),
			Quantity: 1,
			Options: { [inputs[0].getAttribute('name')]: inputs[0].value },
		};
	} else {
		eventPayload = {
			Event: eventName,
			Amount: requestBody.Quantity * event.Price,
			Quantity: parseInt(requestBody.Quantity, 10),
		};
	}

	requestBody = Object.assign(requestBody, eventPayload);

	hideStep(document.querySelector('.shop-additional'));
	showSummary(requestBody, type);
	showStep(document.querySelector('.shop-summary'));
}

// ---------------------------------------------------------------------------
// Summary -> Payment step
// ---------------------------------------------------------------------------

async function handleSummaryNext(e) {
	e.currentTarget.innerHTML = 'Even Geduld';
	e.currentTarget.style.backgroundColor = '#EE7357';
	e.currentTarget.disabled = true;

	try {
		await postRequest('/api/participants/add', requestBody);

		showPayment(requestBody);
		hideStep(document.querySelector('.shop-summary'));
		showStep(document.querySelector('.shop-payment'));
	} catch (err) {
		hideStep(document.querySelector('.shop-summary'));

		if (err.status === 409) {
			showStep(document.querySelector('.shop-already-subscribed'));
		} else if (err.status === 403) {
			showStep(document.querySelector('.shop-not-enough-places'));
		} else {
			showStep(document.querySelector('.shop-generic-error'));
		}
	}
}

async function handleAlreadySubscribedPay() {
	hideStep(document.querySelector('.shop-already-subscribed'));

	const res = await getRequest(`/api/participants/email/${requestBody.Event}/${requestBody.Email}`, {});
	requestBody = res.data;

	showPayment(requestBody);
	showStep(document.querySelector('.shop-payment'));
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

function loadEventsAndInitTickets() {
	getRequest('/api/events/').then((res) => {
		if (res.status !== 200) return;
		data = res.data;
		initTicketsFlow();

		document.querySelector('.loader').classList.add('hidden');
		document.querySelector('.shop-tickets').classList.remove('hidden');
	});
}

function initTicketsFlow() {
	const shop = document.querySelector('.shop-tickets-list');

	data.forEach((event) => {
		if (!isEventWithinDateWindow(event)) return;
		shop.appendChild(createTicketElement(event.Name, event));
	});

	if (shop.children.length === 0) {
		showStep(document.querySelector('.shop-tickets-unavailable'));
		return;
	}

	registerTicketQuantityHandlers();
	registerTicketToggleHandlers();
	document.querySelector('.shop-tickets-next').addEventListener('click', handleTicketsNext);

	document.querySelectorAll('.shop-info input').forEach((el) => el.addEventListener('keyup', validateInfoInputs));
	document.querySelector('.shop-info-next').addEventListener('click', handleInfoNext);

	document.querySelector('.shop-additional-next').addEventListener('click', handleAdditionalNext);
	document.querySelector('.shop-summary-next').addEventListener('click', handleSummaryNext);
	document.querySelector('.shop-already-subscribed-pay').addEventListener('click', handleAlreadySubscribedPay);
	document.querySelector('.shop-not-enough-places-reload').addEventListener('click', () => window.location.reload());
}

if (SHOP_HOME_PATHS.includes(window.location.pathname)) {
	loadShopTitle();
	loadShopArticles();
	loadEventsAndInitTickets();
}
