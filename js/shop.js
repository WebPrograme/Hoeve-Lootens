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

// Reset Modal
function resetModal() {
	const modal = document.querySelector('.modal');

	modal.classList.remove('modal-open');
	modal.querySelector('.shop-form').style.display = 'block';
	modal.querySelector('.shop-info').style.display = 'flex';
	modal.querySelector('.btn-shop-submit').style.display = 'block';
	modal.querySelector('.btn-shop-submit').style.backgroundColor = '#FCC000';
	modal.querySelector('.btn-shop-submit').innerHTML = 'Inschrijven';
	modal.querySelector('.shop-success').style.display = 'none';

	document.querySelector('.shop-success-payconiq-qr').src = '';
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
						const start = data[key]['Start Date'] != undefined ? new Date(data[key]['Start Date']) : null;
						const end = data[key]['End Date'] != undefined ? new Date(data[key]['End Date']) : null;

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

// Get All Events
if (window.location.pathname == '/pages/shop.html') {
	postRequest('/api/events/init/public', {}).then((res) => {
		if (res.status == 200) {
			data = res.data;
			const shop = document.querySelector('.shop-container');

			// Create Event Cards
			Object.keys(data).forEach(function (key) {
				const now = new Date();
				const start = data[key]['Start Date'] != undefined ? new Date(data[key]['Start Date']) : null;
				const end = data[key]['End Date'] != undefined ? new Date(data[key]['End Date']) : null;

				// Check if Event can be shown
				if (start != null && now < start) return;
				if (end != null && now > end) return;

				if (data[key]['AvailablePlaces'] > 0) {
					// Create Card
					const card = document.createElement('div');
					card.innerHTML = `
                        <img src="${data[key]['Image']}">
                        <div class="shop-card-header">
                            <h3>${key}</h3>
                            ${data[key]['Type'] != 'Food' ? '<h3>€' + data[key]['Price'] + '</h3>' : ''}
                        </div>
                        <p class="status">${data[key]['Date']}</p>
                        <a class="btn btn-primary btn-primary-sm btn-shop-add" data-value="${key}" data-target-modal="modal-signup">Tickets</a>
                    `;

					card.classList.add('shop-card');
					shop.appendChild(card);
				} else {
					// Create Card (Sold Out)
					if (data[key]['Type'] == 'Activity' || data[key]['Type'] == 'QR' || data[key]['Type'] == 'Quiz') {
						const card = document.createElement('div');

						card.innerHTML = `
                        	<img src="${data[key]['Image']}">
							<div class="shop-card-header">
								<h3>${key}</h3>
                            	${data[key]['Type'] != 'Food' ? '<h3>€' + data[key]['Price'] + '</h3>' : ''}
							</div>
                            <p class="status">${data[key]['Date']}</p>
                            <a class="btn btn-secondary btn-secondary-sm btn-shop-add">Volzet!</a>
                        `;

						card.classList.add('shop-card');
						shop.appendChild(card);
					}
				}
			});

			// Show Signup Modal
			document.querySelectorAll('.btn-shop-add').forEach((el) => {
				el.addEventListener('click', (e) => {
					// Change Modal Content Based on Event
					const target = e.target.getAttribute('data-target-modal');
					const eventName = e.target.getAttribute('data-value');
					const event = data[eventName];
					const modal = document.getElementById(target);
					const closeTrough = modal.getAttribute('close-trough') || null;

					modal.querySelector('.modal-title').innerHTML = eventName;
					modal.querySelector('.shop-image').setAttribute('src', event['Image']);
					modal.querySelector('.shop-price').innerHTML = event['Type'] == 'QR' ? '€' + event['Price'] + '/pp' : event['Type'] != 'Food' ? '€' + event['Price'] : '';
					modal.querySelector('.shop-title').innerHTML = eventName;
					modal.querySelector('.shop-date').innerHTML = event['Date'];
					modal.querySelector('.shop-description').innerHTML = event['Description'];
					modal.querySelector('.btn-shop-submit').setAttribute('data-value', eventName);
					modal.querySelector('.shop-form-options').innerHTML = '';

					if (event['Type'] == 'Quiz' || event['Type'] == 'Food') {
						// Show Custom Options for Quiz
						if (modal.querySelector('.shop-input[name="Personen"]') != undefined) {
							modal.querySelector('.shop-input[name="Personen"]').parentElement.remove();
						}

						if (event['Type'] == 'Quiz') {
							modal.querySelector('.shop-total').innerHTML = '€' + event['Price'];

							Object.keys(event['Options']).forEach(function (key) {
								const label = document.createElement('label');
								label.classList.add('label');
								label.innerHTML = key;
								label.setAttribute('for', key);

								const input = document.createElement('input');
								input.classList.add('shop-input', 'input');

								if (typeof event['Options'][key] === 'string') {
									input.setAttribute('type', 'text');
								} else if (typeof event['Options'][key] === 'number') {
									input.setAttribute('type', 'number');
									input.setAttribute('min', '0');
								}

								input.setAttribute('name', key);
								input.setAttribute('id', key);
								input.setAttribute('placeholder', key);

								modal.querySelector('.shop-form-options').appendChild(label);
								modal.querySelector('.shop-form-options').appendChild(input);
							});
						} else {
							Object.keys(event['Options']).forEach(function (key) {
								const label = document.createElement('label');
								label.classList.add('label');
								label.innerHTML = `${key} (€${event['Options'][key]})`;
								label.setAttribute('for', key);

								const input = document.createElement('input');
								input.classList.add('shop-input', 'input');
								input.setAttribute('type', 'number');
								input.setAttribute('name', key);
								input.setAttribute('id', key);
								input.setAttribute('placeholder', 'Aantal');
								input.setAttribute('min', '0');

								modal.querySelector('.shop-form-options').appendChild(label);
								modal.querySelector('.shop-form-options').appendChild(input);
							});

							modal.querySelectorAll('.shop-form-options .shop-input').forEach((el) => {
								el.addEventListener('keyup', (input) => {
									let total = 0;
									modal.querySelectorAll('.shop-form-options .shop-input').forEach((el) => {
										const value = el.value ? el.value : 0;
										total += parseInt(value) * parseFloat(event['Options'][el.getAttribute('name')]);
									});
									modal.querySelector('.shop-total').innerHTML = '€' + total;
								});
							});
						}
					} else {
						if (modal.querySelector('.shop-input[name="Personen"]') != null) {
							modal.querySelector('.shop-input[name="Personen"]').setAttribute('max', event['Available Places']);
							modal.querySelector('.shop-input[name="Personen"]').setAttribute('data-value', e.target.getAttribute('data-value'));
						} else {
							const personsContainer = document.createElement('div');
							personsContainer.innerHTML =
								`
                                <label class="label" for="Personen">Personen</label>
                                <input class="shop-input input" type="number" name="Personen" id="Personen" placeholder="Personen" min="1" max="` +
								event['Available Places'] +
								`">
                            `;
							modal.querySelector('.shop-persons-line').appendChild(personsContainer);
						}

						modal.querySelector('.shop-input[name="Personen"]').addEventListener('keyup', (input) => {
							modal.querySelector('.shop-total').innerHTML = '€' + input.target.value * event['Price'];
						});
					}

					modal.classList.add('modal-open');

					e.stopPropagation();
					if (closeTrough !== null) {
						// Close Modal When Clicked Outside
						modal.classList.add('close-trough');

						document.addEventListener('click', (event) => {
							const withinBoundaries = event.composedPath().includes(document.querySelector('.modal-content'));

							if (!withinBoundaries) {
								modal.classList.remove('modal-open');
							} else {
								return;
							}
						});
					}
				});
			});

			// Close Modal
			document.querySelectorAll('.modal-close').forEach((el) => {
				el.addEventListener('click', (e) => {
					resetModal();
				});
			});
		}
	});

	// Submit Form
	document.querySelector('.btn-shop-submit').addEventListener('click', async function () {
		// Get Event Data To Check If Event Is Still Available
		postRequest('/api/events/init/public', {}).then((res) => {
			if (res.status == 200) {
				const dataEvent = res.data[document.querySelector('.btn-shop-submit').getAttribute('data-value')];

				// Get Form Data
				const form = document.querySelector('.shop-form');
				const EventName = document.querySelector('.btn-shop-submit').getAttribute('data-value');
				const BtnAdd = document.querySelector('.btn-shop-submit');
				const FirstName = form.querySelector('[name="Voornaam"]').value.trim();
				const LastName = form.querySelector('[name="Achternaam"]').value.trim();
				const Email = form.querySelector('[name="Email"]').value.trim();
				const Phone = form.querySelector('[name="Telefoonnummer"]').value;
				const Address = form.querySelector('[name="Adres"]').value.trim();

				BtnAdd.innerHTML = 'Bezig met inschrijven...';

				// Create Participant Object
				const data = {
					FirstName: FirstName,
					LastName: LastName,
					Email: Email,
					Phone: Phone,
					Address: Address,
					PayMethod: 'Niet Betaald',
					PayDate: '--',
					CreatedAt: new Date().toISOString().split('T')[0],
					Event: EventName,
				};

				// Calculate The Amount, Quantity And The Possible Options
				switch (dataEvent['Type']) {
					case 'Quiz':
						data['Amount'] = parseFloat(dataEvent['Price']);
						data['Quantity'] = 1;
						data['Options'] = {};

						Object.keys(dataEvent['Options']).forEach(function (key) {
							data['Options'][key] = form.querySelector('[name="' + key + '"]').value;
						});

						break;
					case 'Food':
						let amount = 0;
						let quantity = 0;
						data['Options'] = {};

						Object.keys(dataEvent['Options']).forEach(function (key) {
							const value = form.querySelector('[name="' + key + '"]').value ? form.querySelector('[name="' + key + '"]').value : 0;
							amount += parseInt(value) * parseFloat(dataEvent['Options'][key]);
							quantity += parseInt(value);
							data['Options'][key] = value;
						});

						data['Amount'] = amount;
						data['Quantity'] = quantity;

						break;
					default:
						data['Amount'] = parseFloat(dataEvent['Price']) * parseInt(form.querySelector('[name="Personen"]').value);
						data['Quantity'] = parseInt(form.querySelector('[name="Personen"]').value);
						break;
				}

				console.log(data);

				// Check If Event Is Still Available
				if (dataEvent['Available Places'] < data['Quantity'] || dataEvent['Available Places'] == 0) {
					BtnAdd.innerHTML = 'Geen plaatsen meer beschikbaar!';
					BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
					return;
				}

				// Check If All Fields Are Filled In
				if (FirstName == '' || LastName == '' || Email == '' || Phone == '' || !data['Quantity'] || data['Quantity'] == 0 || Address == '') {
					BtnAdd.innerHTML = 'Vul alle velden in!';
					BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
					return;
				}

				// Create User Code
				let UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);
				UserCode = UserCode.toUpperCase();
				data['UserCode'] = UserCode;

				// Add User To Database
				postRequest('/api/events/participants/add', { EventName: EventName, Participant: data }).then((res) => {
					if (res.status === 200) {
						document.querySelector('.shop-form').style.display = 'none';
						document.querySelector('.shop-info').style.display = 'none';
						document.querySelector('.btn-shop-submit').style.display = 'none';
						document.querySelector('.shop-success-methods').style.display = 'block';

						analytics.log('signup', { event: EventName, user: UserCode });

						// Get Choosed Payment Method
						document.querySelectorAll('.btn-shop-method').forEach((el) => {
							el.addEventListener('click', (e) => {
								const method = e.target.getAttribute('data-method');

								document.querySelector('.shop-success-methods').style.display = 'none';
								document.querySelector('.shop-success-' + method).style.display = 'block';

								if (method == 'overschrijving') {
									// Show Info For Overschrijving
									document.querySelector('.shop-success-overschrijving-price').innerHTML = '€' + dataEvent['Price'] * data['Amount'];
									document.querySelector('.shop-success-overschrijving-code').innerHTML = UserCode;
								} else if (method == 'payconiq') {
									const qrcodeImg = document.querySelector('.shop-success-payconiq-qr');
									const phoneLink = document.querySelector('.shop-success-payconiq-mobile');

									qrcodeImg.src = '';
									phoneLink.href = '';
									document.querySelector('.shop-success-payconiq-timer').innerHTML = '';

									// Create Payconiq QR Code
									postRequest('/api/payconiq/create', { Amount: dataEvent['Price'] * data['Amount'], Ref: UserCode, Event: EventName }).then((res) => {
										if (res.status == 200) {
											let links = JSON.parse(res.response);

											// Open Payconiq App On Mobile
											if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
												window.open(links['deeplink'], '_blank');
											}

											qrcodeImg.src = links['qr'];
											phoneLink.href = links['deeplink'];

											// Start Timer (15 Minutes)
											const start = Date.now();
											setInterval(function () {
												let delta = Date.now() - start;
												let seconds = Math.floor(delta / 1000);
												let minutes = Math.floor(seconds / 60);
												seconds = seconds % 60;
												minutes = minutes % 60;
												document.querySelector('.shop-success-payconiq-timer').innerHTML = 14 - minutes + ':' + (60 - seconds);

												if (minutes == 14 && seconds == 59) {
													document.querySelector('.shop-success-payconiq-timer').innerHTML = 'De tijd is verstreken!';
													document.querySelector('.shop-success-payconiq-timer').style.color = 'red';
													clearInterval();
												}
											}, 1000);
										}
									});
								}
							});
						});
					} else if (res.status == 400) {
						BtnAdd.innerHTML = 'U bent al ingeschreven!';
						BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
					} else {
						BtnAdd.innerHTML = 'Er is iets misgegaan!';
						BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
					}
				});
			}
		});
	});

	// Reload Page When Modal Is Closed (Safety Measure)
	document.querySelector('#modal-signup .modal-close').addEventListener('click', () => {
		window.location.reload();
	});

	// Get UserCode From Email
	document.querySelector('.btn-submit-email').addEventListener('click', (e) => {
		const BtnSubmit = e.target;
		const BtnClose = document.querySelector('.btn-close-email');
		const EmailInput = document.querySelector('.form-check-code').querySelector('[title="email"]');
		const Email = EmailInput.value;
		const UserCodeElement = document.querySelector('.UserCode');

		if (Email == '') {
			BtnSubmit.innerHTML = 'Vul alle velden in!';
			BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
			return;
		}

		getRequest('get/email?email=' + Email).then((response) => {
			if (response.response != 'User not found!' && response.response != '{}') {
				const data = JSON.parse(response.response);
				let result = '';
				Object.keys(data).forEach((key) => {
					result += key + ' (' + data[key] + ')<br>';
				});

				UserCodeElement.innerHTML = result;

				EmailInput.setAttribute('style', 'display: none !important;');
				UserCodeElement.setAttribute('style', 'display: block !important;');
				BtnSubmit.setAttribute('style', 'display: none !important;');
				BtnClose.setAttribute('style', 'display: block !important;');
				return;
			}

			BtnSubmit.innerHTML = 'Email niet gevonden!';
			BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
		});
	});
}

export { getAvailableEvents };
