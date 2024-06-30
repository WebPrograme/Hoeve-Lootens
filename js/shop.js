// FILE IN PROGRESS - NOT READY FOR PRODUCTION
import { postRequest, getRequest } from '../modules/Requests.js';
import analytics from './analyse.js';
let data = [];

// Create User Code
function getRandomIntInclusive(data, min, max) {
	let UserCodes = [];
	for (var i = 0; i < data.length; i++) {
		UserCodes.push(data[i].UserCode);
	}

	min = Math.ceil(min);
	max = Math.floor(max);

	while (true) {
		const random = Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
		if (!UserCodes.includes(random)) {
			return random;
		}
	}
}

// Get Available Events
function getAvailableEvents() {
	return new Promise((resolve, reject) => {
		postRequest('/api/events/init/public', {}).then((res) => {
			if (res.status == 200) {
				const data = res.data;
				let availableEvents = [];

				Object.keys(data).forEach(function (key) {
					if (data[key]['Available Places'] > 0 && data[key]['Type'] != 'Food') {
						const now = new Date();
						const start = data[key]['StartDate'] != undefined ? new Date(data[key]['StartDate']) : null;
						const end = data[key]['EndDate'] != undefined ? new Date(data[key]['EndDate']) : null;

						// Check if Event can be shown
						if (start != null && now < start) return;
						if (end != null && now > end) return;

						availableEvents.push(key);
					}
				});

				resolve(availableEvents);
			} else {
				reject(res);
			}
		});
	});
}

// Show Additional Info
function showAdditionalInfo(options, type, event) {
	const container = document.querySelector('.shop-additional-list');
	const group = document.createElement('div');
	group.dataset.event = event;
	container.appendChild(group);

	// Create Inputs
	Object.keys(options).forEach((key, index) => {
		const div = document.createElement('div');

		const label = document.createElement('label');
		label.classList.add('label');
		label.innerHTML = key + (type == 'Food' ? ' (€' + options[key] + ')' : '');
		label.setAttribute('for', key);

		const input = document.createElement('input');
		input.classList.add('shop-input', 'input');

		if (type == 'Quiz') {
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

		if (type == 'Food') {
			if (Object.keys(options).length != 1 || Object.keys(options).length != index + 1) {
				if (index % 2 == 0) {
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

	document.querySelector('.shop-additional-input-group:last-child').style.marginBottom = '1rem';
}

// Check Additional Info
function checkAdditionalInfo() {
	const groups = document.querySelectorAll('.shop-additional-list>div[data-event]');
	let valid = true;

	groups.forEach((el) => {
		const inputs = el.querySelectorAll('.input');

		if (inputs.length == 1) {
			if (inputs[0].value == '' || inputs[0].value == '0') {
				valid = false;
			}
		} else {
			let total = 0;
			inputs.forEach((el) => {
				if (el.value == '') el.value = '0';
				total += parseInt(el.value);
			});

			if (isNaN(total) || total == 0) {
				valid = false;
			}
		}
	});

	document.querySelector('.shop-additional-next').disabled = !valid;
}

// Show Summary
function showSummary(data) {
	data = data['Participant'];
	// Show Personal Data
	document.querySelector('.shop-summary-name').innerHTML = data['FirstName'] + ' ' + data['LastName'];
	document.querySelector('.shop-summary-email').innerHTML = data['Email'];
	document.querySelector('.shop-summary-phone').innerHTML = data['Phone'];
	document.querySelector('.shop-summary-address').innerHTML = data['Address'];

	// Show Event Data
	const event = document.createElement('div');
	event.classList.add('shop-summary-tickets-list-item');
	event.innerHTML = `
			<div>
				<h4>${data.Event} (${data.Quantity}x)</h4>
				<h4>€${data.Amount}</h4>
			</div>
			${
				data.Options != undefined && data.Type == 'Food'
					? Object.keys(data.Options)
							.map((key) => {
								if (data.Options[key] == 0) return;
								return `<div><p>${key}</p><p>${data.Options[key]}x</p></div>`;
							})
							.join('')
					: ''
			}
		`;

	document.querySelector('.shop-summary-tickets-list').appendChild(event);

	// Show Total
	document.querySelector('.shop-summary-total').innerHTML = '€' + data.Amount;
}

// Show Payment
function showPayment(requestBody) {
	console.log(requestBody);
	// Show Payment Info
	document.querySelector('.shop-payment-total').innerHTML = '€' + requestBody['Participant']['Amount'];
	document.querySelector('.shop-payment-ref').innerHTML = requestBody['Participant']['UserCode'] + ' - ' + requestBody['Participant']['Event'];

	// Create Payconiq QR Code
	postRequest('/api/payconiq/create', {
		Payment: {
			Amount: requestBody['Participant']['Amount'],
			Ref: requestBody['Participant']['UserCode'],
			Event: requestBody['Participant']['Event'],
		},
	}).then((paymentRes) => {
		if (paymentRes.status == 200) {
			const links = paymentRes.data;
			document.querySelector('.shop-payment-qr').src = links['qr'];
			document.querySelector('.shop-payment-mobile').href = links['deeplink'];
		}
	});
}

// Get All Events
if (window.location.pathname == '/pages/shop.html') {
	postRequest('/api/events/init/public', {}).then((res) => {
		if (res.status == 200) {
			data = res.data;
			const shop = document.querySelector('.shop-tickets-list');
			let requestBody = {};

			// Create Tickets
			Object.keys(data).forEach(function (key) {
				const now = new Date();
				const start = data[key]['StartDate'] != undefined ? new Date(data[key]['StartDate']) : null;
				const end = data[key]['EndDate'] != undefined ? new Date(data[key]['EndDate']) : null;

				// Check if Event can be shown
				if (start != null && now < start) return;
				if (end != null && now > end) return;

				if (data[key]['AvailablePlaces'] > 0) {
					// Create Ticket
					const ticket = document.createElement('div');
					ticket.innerHTML = `
						<div class="shop-ticket-start"></div>
						<div class="shop-ticket-body">
							<div>
								<h3>${key}</h3>
								<p class="status">${data[key]['Date']}</p>
							</div>
							<div class="shop-ticket-amount" ${data[key]['Type'] != 'QR' ? 'style="display: none;"' : ''}>
								<h3>0</h3>
							</div>
						</div>
						<div class="shop-ticket-actions">
							${
								data[key]['Type'] == 'QR'
									? `<a class="shop-ticket-actions-plus" data-value="${key}"><i class="fa-solid fa-plus"></i></a>
							<a class="shop-ticket-actions-minus" data-value="${key}"><i class="fa-solid fa-minus"></i></a>`
									: '<a class="shop-ticket-actions-add" data-value="' + key + '"><i class="fa-regular fa-circle-check"></i></a>'
							}
						</div>
                    `;

					ticket.classList.add('shop-ticket');
					shop.appendChild(ticket);
				} else {
					// Create Ticket (Sold Out)
					const ticket = document.createElement('div');
					ticket.innerHTML = `
						<div class="shop-ticket-start"></div>
						<div class="shop-ticket-body">
							<div>
								<h3>${key}</h3>
								<p class="status">${data[key]['Date']}</p>
							</div>
						</div>
						<div class="shop-ticket-actions">
							${
								data[key]['Type'] == 'QR'
									? `<a class="shop-ticket-actions-plus" data-value="${key}"><i class="fa-solid fa-plus"></i></a>
							<a class="shop-ticket-actions-minus" data-value="${key}"><i class="fa-solid fa-minus"></i></a>`
									: '<a class="shop-ticket-actions-add" data-value="' + key + '"><i class="fa-regular fa-circle-check"></i></a>'
							}
						</div>
                    `;

					ticket.classList.add('shop-ticket', 'shop-ticket-sold-out');
					shop.appendChild(ticket);
				}
			});

			// Ticket Actions
			document.querySelectorAll('.shop-ticket-actions-plus').forEach((el) => {
				el.addEventListener('click', (e) => {
					const eventName = e.currentTarget.getAttribute('data-value');
					const counter = e.currentTarget.parentElement.parentElement.querySelector('.shop-ticket-amount').querySelector('h3');
					const amount = parseInt(counter.innerHTML);

					counter.innerHTML = amount + 1 > data[eventName]['AvailablePlaces'] ? data[eventName]['AvailablePlaces'] : amount + 1;

					e.currentTarget.parentElement.parentElement.classList.add('shop-ticket-amount-active');
					const allCounters = document.querySelectorAll('.shop-ticket-amount');
					let active = false;

					allCounters.forEach((el) => {
						if (el.querySelector('h3').innerHTML != '0') {
							active = true;
						}
					});

					if (active) {
						document.querySelector('.shop-tickets-next').disabled = false;

						// Disable All Other Tickets
						document.querySelectorAll('.shop-ticket').forEach((ticket) => {
							if (ticket.querySelector('h3').innerHTML != eventName) {
								ticket.classList.add('shop-ticket-disabled');
							}
						});
					}
				});
			});

			document.querySelectorAll('.shop-ticket-actions-minus').forEach((el) => {
				el.addEventListener('click', (e) => {
					const eventName = e.currentTarget.getAttribute('data-value');
					const counter = e.currentTarget.parentElement.parentElement.querySelector('.shop-ticket-amount').querySelector('h3');
					const amount = parseInt(counter.innerHTML);

					counter.innerHTML = amount - 1 < 0 ? 0 : amount - 1;

					if (counter.innerHTML == '0') {
						e.currentTarget.parentElement.parentElement.classList.remove('shop-ticket-amount-active');

						const allCounters = document.querySelectorAll('.shop-ticket-amount');
						let active = false;

						allCounters.forEach((el) => {
							if (el.querySelector('h3').innerHTML != '0') {
								active = true;
							}
						});

						if (!active) {
							document.querySelector('.shop-tickets-next').disabled = true;

							// Enable All Other Tickets
							document.querySelectorAll('.shop-ticket').forEach((ticket) => {
								if (ticket.querySelector('h3').innerHTML != eventName) {
									ticket.classList.remove('shop-ticket-disabled');
								}
							});
						}
					}
				});
			});

			document.querySelectorAll('.shop-ticket-actions-add, .shop-ticket:has(.shop-ticket-actions-add)').forEach((btn) => {
				btn.addEventListener('click', (e) => {
					e.stopPropagation();
					const el = e.currentTarget.classList.contains('shop-ticket-actions-add')
						? e.currentTarget
						: e.currentTarget.classList.contains('shop-ticket')
						? e.currentTarget.querySelector('.shop-ticket-actions-add')
						: null;
					const eventName = el.getAttribute('data-value');
					el.parentElement.parentElement.classList.toggle('shop-ticket-amount-active');
					el.parentElement.classList.toggle('shop-ticket-actions-active');

					if (el.parentElement.parentElement.classList.contains('shop-ticket-amount-active')) {
						el.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
						const counter = el.parentElement.parentElement.querySelector('.shop-ticket-amount').querySelector('h3');
						counter.innerHTML = '1';
					} else {
						el.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
						const counter = el.parentElement.parentElement.querySelector('.shop-ticket-amount').querySelector('h3');
						counter.innerHTML = '0';
					}

					const allCounters = document.querySelectorAll('.shop-ticket-amount');
					let active = false;

					allCounters.forEach((counterEl) => {
						if (counterEl.querySelector('h3').innerHTML != '0') {
							active = true;
						}
					});

					document.querySelector('.shop-tickets-next').disabled = !active;

					if (active) {
						// Disable All Other Tickets
						document.querySelectorAll('.shop-ticket').forEach((ticket) => {
							if (ticket.querySelector('.shop-ticket-body h3').innerHTML != eventName) {
								ticket.classList.add('shop-ticket-disabled');
							}
						});
					} else {
						// Enable All Other Tickets
						document.querySelectorAll('.shop-ticket').forEach((ticket) => {
							if (ticket.querySelector('.shop-ticket-body h3').innerHTML != eventName) {
								ticket.classList.remove('shop-ticket-disabled');
							}
						});
					}
				});
			});

			// Ticket Next
			document.querySelector('.shop-tickets-next').addEventListener('click', (e) => {
				const choosenTicket = document.querySelector('.shop-ticket-amount-active');
				const eventName = choosenTicket.querySelector('h3').innerHTML;
				const amount = choosenTicket.querySelector('.shop-ticket-amount h3').innerHTML;

				// Update Request Body
				requestBody['EventName'] = eventName;
				requestBody['Participant'] = {
					Event: eventName,
					Amount: amount * data[eventName]['Price'],
					Quantity: parseInt(amount),
					CreatedAt: new Date().toISOString().split('T')[0],
					PayMethod: 'Niet Betaald',
					PayDate: '--',
				};

				// Hide Tickets
				document.querySelector('.shop-info').classList.remove('shop-active');
				document.querySelector('.shop-tickets').classList.add('shop-hidden');
				// Show Info Form
				document.querySelector('.shop-info').classList.add('shop-active');
				document.querySelector('.shop-info').classList.remove('shop-hidden');

				// Check If There Is Saved Data
				const savedData = JSON.parse(localStorage.getItem('shop-info'));
				if (savedData != null) {
					document.querySelector('.shop-info input[name="shop-firstname"]').value = savedData.FirstName;
					document.querySelector('.shop-info input[name="shop-lastname"]').value = savedData.LastName;
					document.querySelector('.shop-info input[name="shop-email"]').value = savedData.Email;
					document.querySelector('.shop-info input[name="shop-phone"]').value = savedData.Phone;
					document.querySelector('.shop-info input[name="shop-address"]').value = savedData.Address;
					document.querySelector('.shop-info input[name="shop-info-saved"]').checked = true;

					document.querySelector('.shop-info-next').disabled = false;
				}
			});

			// Info Inputs
			document.querySelectorAll('.shop-info input').forEach((el) => {
				el.addEventListener('keyup', (e) => {
					const allInputs = document.querySelectorAll('.shop-info input');
					let active = true;

					allInputs.forEach((el) => {
						if (el.value == '') {
							active = false;
						}

						// Email regex
						if (el.name == 'shop-email') {
							const regex = /\S+@\S+\.\S+/;
							if (!regex.test(el.value)) {
								active = false;
							}
						}
					});

					document.querySelector('.shop-info-next').disabled = !active;
				});
			});

			// Info Next
			document.querySelector('.shop-info-next').addEventListener('click', (e) => {
				// Update Request Body
				const allInputs = document.querySelectorAll('.shop-info input');
				requestBody['Participant'] = Object.assign(requestBody['Participant'], {
					FirstName: allInputs[0].value,
					LastName: allInputs[1].value,
					Email: allInputs[2].value,
					Phone: allInputs[3].value,
					Address: allInputs[4].value,
					UserCode: allInputs[0].value[0].toUpperCase() + allInputs[1].value[0].toUpperCase() + getRandomIntInclusive(data, 1000, 9999),
				});

				// Save Data In Local Storage If User Chooses To
				if (document.querySelector('.shop-info input[name="shop-info-saved"]').checked) {
					localStorage.setItem('shop-info', JSON.stringify(requestBody['Participant']));
				} else {
					localStorage.removeItem('shop-info');
				}

				// Hide Info
				document.querySelector('.shop-info').classList.remove('shop-active');
				document.querySelector('.shop-info').classList.add('shop-hidden');

				// Check If There Is Need For Additional Info
				if (data[requestBody['Participant'].Event].Type == 'Quiz' || data[requestBody['Participant'].Event].Type == 'Food') {
					// Show Additional Info
					showAdditionalInfo(data[requestBody['Participant'].Event].Options, data[requestBody['Participant'].Event].Type, requestBody['Participant'].Event);

					document.querySelectorAll('.shop-additional input').forEach((el) => {
						el.addEventListener('input', checkAdditionalInfo);
					});

					document.querySelector('.shop-additional').classList.add('shop-active');
					document.querySelector('.shop-additional').classList.remove('shop-hidden');
				} else {
					// Show Summary
					showSummary(requestBody);
					document.querySelector('.shop-summary').classList.add('shop-active');
					document.querySelector('.shop-summary').classList.remove('shop-hidden');
				}
			});

			// Additional Next
			document.querySelector('.shop-additional-next').addEventListener('click', (e) => {
				// Update Request Body
				const inputs = document.querySelectorAll('.shop-additional input');
				const eventName = requestBody['Participant'].Event;
				const type = data[eventName].Type;
				let event = {};
				if (type == 'Food') {
					const options = {};
					let amount = 0;
					let quantity = 0;
					inputs.forEach((input) => {
						options[input.getAttribute('name')] = input.value;
						amount += parseInt(input.value) * parseFloat(data[eventName].Options[input.getAttribute('name')]);
						quantity += parseInt(input.value);
					});

					event = {
						Event: eventName,
						Amount: amount,
						Quantity: quantity,
						Options: options,
					};
				} else if (type == 'Quiz') {
					event = {
						Event: eventName,
						Amount: data[eventName].Price,
						Quantity: 1,
						Options: {
							[inputs[0].getAttribute('name')]: inputs[0].value,
						},
					};
				} else {
					event = {
						Event: eventName,
						Amount: requestBody['Participant']['Quantity'] * data[eventName]['Price'],
						Quantity: parseInt(requestBody['Participant']['Quantity']),
					};
				}

				requestBody['Participant'] = Object.assign(requestBody['Participant'], event);
				console.log(requestBody);

				// Hide Additional Info
				document.querySelector('.shop-additional').classList.remove('shop-active');
				document.querySelector('.shop-additional').classList.add('shop-hidden');

				// Show Summary
				showSummary(requestBody);
				document.querySelector('.shop-summary').classList.add('shop-active');
				document.querySelector('.shop-summary').classList.remove('shop-hidden');
			});

			// Summary Next
			document.querySelector('.shop-summary-next').addEventListener('click', (e) => {
				e.currentTarget.innerHTML = 'Even Geduld';
				e.currentTarget.style.backgroundColor = '#EE7357';
				e.currentTarget.disabled = true;

				postRequest('/api/events/participants/add', requestBody)
					.then((res) => {
						analytics('AddedParticipant', { Event: requestBody['Participant']['Event'], UserCode: requestBody['Participant']['UserCode'] });
						// Show Payment
						showPayment(requestBody);
						document.querySelector('.shop-summary').classList.remove('shop-active');
						document.querySelector('.shop-summary').classList.add('shop-hidden');
						document.querySelector('.shop-payment').classList.add('shop-active');
						document.querySelector('.shop-payment').classList.remove('shop-hidden');
					})
					.catch((err) => {
						// Hide Summary
						document.querySelector('.shop-summary').classList.remove('shop-active');
						document.querySelector('.shop-summary').classList.add('shop-hidden');

						// Show Already Subscribed
						document.querySelector('.shop-already-subscribed').classList.add('shop-active');
						document.querySelector('.shop-already-subscribed').classList.remove('shop-hidden');
					});
			});

			// Already Subscribed Pay Button
			document.querySelector('.shop-already-subscribed-pay').addEventListener('click', async (e) => {
				// Hide Already Subscribed
				document.querySelector('.shop-already-subscribed').classList.remove('shop-active');
				document.querySelector('.shop-already-subscribed').classList.add('shop-hidden');

				// Show Payment
				getRequest('/api/events/get/email?Email=' + requestBody['Participant']['Email'] + '&EventName=' + requestBody['Participant']['Event'], {}).then((res) => {
					requestBody['Participant'] = res.data;
					showPayment(requestBody);
					document.querySelector('.shop-payment').classList.add('shop-active');
					document.querySelector('.shop-payment').classList.remove('shop-hidden');
				});
			});
		}
	});
}

export { getAvailableEvents };
