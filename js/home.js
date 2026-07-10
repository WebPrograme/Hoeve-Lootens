import { getRequest } from '../modules/Requests.js';
import Cache from '../modules/Cache.js';

const cache = new Cache('home-images-v1');
const cachedArticles = localStorage.getItem('cachedArticles');
const cachedArticlesTimestamp = localStorage.getItem('cachedArticlesTimestamp');
const cacheDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
const isCacheValid = cachedArticles && cachedArticlesTimestamp && Date.now() - cachedArticlesTimestamp < cacheDuration;

if (cachedArticles && isCacheValid) {
	addArticles(JSON.parse(cachedArticles), document.querySelector('.news'));
	initCarousels();
} else {
	getRequest('/api/website/home/articles')
		.then((response) => {
			addArticles(response.data, document.querySelector('.news'));
			initCarousels();

			localStorage.setItem('cachedArticles', JSON.stringify(response.data));
			localStorage.setItem('cachedArticlesTimestamp', Date.now());
		})
		.catch((error) => {
			console.error('Error loading home content:', error);
		});
}

function addArticles(articles, container) {
	let type = 'left';
	container.innerHTML = '';

	const sortedArticles = Object.values(articles).sort((a, b) => a.Order - b.Order);

	sortedArticles.forEach(async (article) => {
		const title = article.Title;
		const images = article.Images;
		const text = article.Content;
		const button = article.Button;

		// Cache images
		await cache.cacheImages(images);

		let section = document.createElement('section');
		section.classList.add('container', 'm-auto');
		section.innerHTML = `<div class="row"></div>`;
		section.setAttribute('data-id', article.ID || article.Title);

		let imageContainer = document.createElement('div');
		imageContainer.classList.add('col-6');

		if (images.length === 1) {
			const image = images[0];
			const cachedImageUrl = await cache.getCachedImage(image);
			const imageElement = document.createElement('img');
			imageElement.src = cachedImageUrl;
			imageElement.alt = title;
			imageElement.classList.add('news-img');
			imageContainer.appendChild(imageElement);
		} else if (images.length > 1) {
			let carouselId = `carousel-${article.ID || article.Title}`;
			imageContainer.innerHTML = `<div id="${carouselId}" class="images-fade">
				${images
					.map(async (image, index) => {
						const cachedImageUrl = await cache.getCachedImage(image);
						return `<img src="${cachedImageUrl}" alt="${title} - Image ${index + 1}" class="news-img ${index === 0 ? 'active' : ''}">`;
					})
					.join('')}
			</div>`;

			imageContainer.querySelector('.news-img').classList.add('active');
		}

		let contentContainer = document.createElement('div');
		contentContainer.classList.add('col-6');
		contentContainer.innerHTML = `<h3 class="section-header">${title}</h3>`;

		text.forEach((line) => {
			contentContainer.innerHTML += `<p>${line}</p>`;
		});

		if (button) {
			contentContainer.innerHTML += `<a class="btn btn-primary btn-primary-sm" href="${button.Link}">${button.Text}</a>`;
		}

		if (type === 'left') {
			section.querySelector('.row').appendChild(imageContainer);
			section.querySelector('.row').appendChild(contentContainer);
		} else {
			section.querySelector('.row').appendChild(contentContainer);
			section.querySelector('.row').appendChild(imageContainer);
		}

		type = type === 'left' ? 'right' : 'left';
		container.appendChild(section);
	});
}

function initCarousels() {
	const carousels = document.querySelectorAll('.images-fade');

	for (const carousel of carousels) {
		const images = carousel.querySelectorAll('.news-img');
		let currentIndex = 0;

		setInterval(() => {
			images[currentIndex].classList.remove('active');
			currentIndex = (currentIndex + 1) % images.length;
			images[currentIndex].classList.add('active');
		}, 3000);
	}
}
