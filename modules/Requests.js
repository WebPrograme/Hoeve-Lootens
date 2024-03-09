const baseUrl = 'https://hoeve-lootens.onrender.com';

async function postRequest(path, data, headers = { 'Content-Type': 'application/json' }, retry = false) {
	return new Promise((resolve, reject) => {
		fetch(baseUrl + path, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: headers,
		})
			.then(async (response) => {
				if (200 <= response.status && response.status < 300) {
					let data;

					if (response.headers.get('Content-Type').includes('application/json')) {
						data = await response.json();
					} else {
						data = response.text();
					}

					resolve({ status: response.status, data: data });
				} else if (retry) {
					postRequest(path, data, headers, false);
				} else {
					reject({ status: response.status, data: response });
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
}

async function getRequest(path, headers = { 'Content-Type': 'application/json' }, retry = true) {
	return new Promise((resolve, reject) => {
		fetch(baseUrl + path, {
			method: 'GET',
			headers: headers,
		})
			.then(async (response) => {
				if (200 <= response.status && response.status < 300) {
					let data;

					if (response.headers.get('Content-Type').includes('application/json')) {
						data = await response.json();
					} else {
						data = response.text();
					}

					resolve({ status: response.status, data: data });
				} else if (retry) {
					getRequest(path, headers, false);
				} else {
					reject({ status: response.status, data: response });
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export { postRequest, getRequest };
