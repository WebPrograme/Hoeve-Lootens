import { getRequest } from '../modules/Requests.js';

getRequest('/api/website/articles/home')
	.then((response) => {
		AddArticles(response.data, document.querySelector('.news'));
	})
	.catch((error) => {
		console.error('Error loading home content:', error);
	});

function AddArticles(articles, container) {
	let type = 'left';
	container.innerHTML = '';

	const sortedArticles = Object.values(articles).sort((a, b) => a.Order - b.Order);

	sortedArticles.forEach((article) => {
		const title = article.Title;
		const image = article.Image;
		const text = article.Content;
		const button = article.Button;

		let section = document.createElement('section');
		section.classList.add('container', 'm-auto');
		section.innerHTML = `<div class="row"></div>`;
		section.setAttribute('data-id', article.ID || article.Title);

		let imageContainer = document.createElement('div');
		imageContainer.classList.add('col-6');
		imageContainer.innerHTML = `<img src="${image.startsWith('http') ? image : '../images/' + image}" alt="${title}" class="news-img">`;

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
