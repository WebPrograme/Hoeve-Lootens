import { getRequest } from '../modules/Requests.js';

const albumsContainer = document.querySelector('.albums');
const imagesContainer = document.querySelector('.images');

getRequest('/api/website/albums').then((response) => {
	const albums = response.data;
	const albumOpen = new URLSearchParams(window.location.search).get('album');

	if (albumOpen) {
		albumsContainer.style.display = 'none';
		imagesContainer.style.display = 'flex';

		openAlbum(albums[albumOpen]);
		return;
	}

	Object.values(albums).forEach((album) => {
		const albumElement = document.createElement('div');
		albumElement.classList.add('album-card');
		albumElement.innerHTML = `
            <img src="${album.Images[0]}" alt="${album.Name}" />
            <div class="album-info">
                <h3>${album.Name}</h3>
                <p>${new Date(album.Date).toLocaleDateString()}</p>
                <a href="albums.html?album=${album.Name}" class="btn btn-primary btn-primary-sm">Bekijk album</a>
            </div>
        `;

		albumsContainer.appendChild(albumElement);
	});
});

function openAlbum(album) {
	const images = album.Images;

	images.forEach((image) => {
		const imageElement = document.createElement('div');
		imageElement.classList.add('image-card');
		imageElement.innerHTML = `
            <img src="${image}" alt="${album.Name}" />
        `;

		imagesContainer.appendChild(imageElement);
	});

	const modal = document.querySelector('.image-modal');
	const modalImage = modal.querySelector('img');

	imagesContainer.querySelectorAll('.image-card').forEach((image) => {
		image.addEventListener('click', () => {
			modalImage.src = image.querySelector('img').src;
			modal.classList.add('open');
		});
	});

	modal.querySelector('.image-modal-content').addEventListener('click', (e) => {
		if (e.target === modalImage) return;
		modal.classList.remove('open');
	});
}
