import { postRequest } from '../modules/Requests.js';
import analytics from './analyse.js';

document.querySelector('.maatschappelijk-form #submit').addEventListener('click', async (e) => {
	const name = document.querySelector('.maatschappelijk-form #name').value;
	const email = document.querySelector('.maatschappelijk-form #email').value;
	const phone = document.querySelector('.maatschappelijk-form #phone').value;

	if (name && email && phone) {
		const response = await postRequest('/api/stocks/signups/add', {
			Name: name,
			Email: email,
			Phone: phone,
		});

		if (response.status == 200) {
			document.querySelector('.maatschappelijk-form').classList.add('hidden');
			document.querySelector('.maatschappelijk-success').classList.remove('hidden');

			analytics('StocksSignup', {
				Name: name,
				Email: email,
				Phone: phone,
			});
		} else {
			alert('Er is iets misgegaan. Probeer het later nog eens.');
		}
	} else {
		alert('Vul alle velden in.');
	}
});
