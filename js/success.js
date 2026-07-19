import { postRequest } from '../modules/Requests.js';
import Form from '../modules/Form.js';

const userCode = new URLSearchParams(window.location.search).get('usercode');
const event = new URLSearchParams(window.location.search).get('event');

if (!userCode || !event) {
	window.location.href = '/';
}

const form = new Form('mrs38ey8-bu9h', '.review', () => {
	form.setFieldValue('UserCode', userCode);
	form.setFieldValue('Event', event);
});
