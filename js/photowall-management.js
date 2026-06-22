import { getRequest, postRequest } from '../modules/Requests.js';

const loadingText = document.getElementById('loading-message');
const errorText = document.getElementById('error-message');
const noPhotosText = document.getElementById('no-photos-message');
const photosGrid = document.getElementById('photos-grid');
const emptyButton = document.getElementById('empty-button');
const downloadAllButton = document.getElementById('download-all-button');

let photosData = [];

const deletePhoto = async (photoId) => {
	const photoElement = document.querySelector(`.delete-button[data-id="${photoId}"]`).closest('.photo-item');
	if (photoElement) {
		const response = await postRequest(`/api/photowall/delete`, { photoId: photoId });
		if (!(response.status >= 200 && response.status < 300)) {
			alert('Er is een fout opgetreden bij het verwijderen van de foto.');
			return;
		}
		photoElement.classList.add('deleted');
		setTimeout(() => {
			photoElement.remove();
		}, 300);
	}
};

const randomName = () => {
	const adjectives = ['blije', 'donkere', 'lichte', 'mooie', 'oude', 'jonge', 'grote', 'kleine'];
	const nouns = ['foto', 'afbeelding', 'plaatje', 'schilderij', 'kunstwerk'];

	const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
	return `${randomAdjective} ${randomNoun}`;
};

const loadPhotos = () => {
	loadingText.style.display = 'block';
	errorText.style.display = 'none';
	noPhotosText.style.display = 'none';
	photosGrid.innerHTML = '';
	photosData = [];

	getRequest('/api/photowall/').then((res) => {
		if (!(res.status >= 200 && res.status < 300)) {
			loadingText.style.display = 'none';
			errorText.style.display = 'block';
			return;
		}

		if (res.data.length === 0) {
			loadingText.style.display = 'none';
			noPhotosText.style.display = 'block';
			return;
		}

		loadingText.style.display = 'none';
		photosData = [];
		res.data.forEach((photo) => {
			const photoElement = document.createElement('div');
			photoElement.classList.add('photo-item');
			photoElement.innerHTML = `
                <div class="photo-actions">
                    <button class="download-button" data-url="${photo.URL}"><i class="fas fa-download"></i></button>
                    <button class="delete-button" data-id="${photo.ID}"><i class="fas fa-trash"></i></button>
                </div>
                <img src="${photo.URL}" alt="${photo.Caption}" />
            `;

			photoElement.addEventListener('click', (event) => {
				document.querySelectorAll('.photo-item').forEach((item) => item.classList.remove('clicked'));
				photoElement.classList.toggle('clicked');
			});

			const downloadButton = photoElement.querySelector('.download-button');
			downloadButton.addEventListener('click', async (event) => {
				event.stopPropagation();
				const url = downloadButton.dataset.url;

				try {
					const response = await fetch(url);
					const blob = await response.blob();
					const objectUrl = URL.createObjectURL(blob);
					const a = document.createElement('a');

					a.href = objectUrl;
					a.download = randomName();
					document.body.appendChild(a);
					a.click();
					a.remove();

					URL.revokeObjectURL(objectUrl);
				} catch (err) {
					console.error(err);
				}
			});

			const deleteButton = photoElement.querySelector('.delete-button');
			deleteButton.addEventListener('click', (event) => {
				event.stopPropagation();
				const photoId = deleteButton.getAttribute('data-id');
				deletePhoto(photoId);
			});

			photosGrid.appendChild(photoElement);
			photosData.push({ ...photo, blob: null });
		});
	});
};

loadPhotos();

emptyButton.addEventListener('click', async () => {
	const action = emptyButton.getAttribute('data-action');
	if (action === 'empty') {
		emptyButton.innerHTML = '<i class="fas fa-question-circle"></i> Ben je zeker? Klik nogmaals om te bevestigen.';
		emptyButton.setAttribute('data-action', 'confirm');
	} else if (action === 'confirm') {
		const response = await getRequest('/api/photowall/empty');
		if (!(response.status >= 200 && response.status < 300)) {
			alert("Er is een fout opgetreden bij het verwijderen van alle foto's.");
			return;
		}
		loadPhotos();
		emptyButton.innerHTML = '<i class="fas fa-trash-alt"></i> Verwijder alle foto\'s';
		emptyButton.setAttribute('data-action', 'empty');
	}
});

downloadAllButton.addEventListener('click', async () => {
	downloadAllButton.disabled = true;
	downloadAllButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloaden...';

	const zip = new JSZip();
	photosData.forEach((photo, index) => {
		zip.file(
			`photo_${index + 1}.jpg`,
			fetch(photo.URL).then((res) => res.blob()),
		);
	});

	zip.generateAsync({ type: 'blob' })
		.then((content) => {
			const objectUrl = URL.createObjectURL(content);
			const a = document.createElement('a');

			a.href = objectUrl;
			a.download = 'all_photos.zip';
			document.body.appendChild(a);
			a.click();
			a.remove();
		})
		.catch((err) => {
			console.error('Error generating zip file:', err);
			alert('Er is een fout opgetreden bij het genereren van het zip-bestand.');
		})
		.finally(() => {
			downloadAllButton.disabled = false;
			downloadAllButton.innerHTML = '<i class="fas fa-download"></i> Download alle foto\'s';
		});
});
