import { getRequest } from '../modules/Requests.js';

getRequest('/api/website/articles/renovations')
	.then((response) => {
		AddArticles(response.data, document.querySelector('.timeline'));
	})
	.catch((error) => {
		console.error('Error loading renovations content:', error);
	});

function AddArticles(articles, timeline) {
	const colors = ['Blue', 'Brown', 'Rose', 'Yellow'];

	let colorIndex = 0;
	let direction = 'Right';
	timeline.innerHTML = '';

	const sortedArticles = Object.values(articles).sort((a, b) => a.Order - b.Order);

	sortedArticles.forEach((article) => {
		const title = article.Title;
		const image = article.Image;
		const text = article.Content.join('\n');

		let item = document.createElement('div');
		item.classList.add('timelineContainer', 'timeline' + direction);
		item.innerHTML = `<div class="timelineContent timeline${colors[colorIndex]}">
                <div class="row">
                    <div class="col-6">
                        <h2>${title}</h2>
                        <p>${text.replace(/\n/g, '</p><p>')}</p>
                    </div>

                    <div class="col-6">
                        <img src="${image}" alt="${title}" class="timeline-img">
                    </div>
                </div>
            </div>`;

		colorIndex = colorIndex === colors.length - 1 ? 0 : colorIndex + 1;
		direction = direction === 'Right' ? 'Left' : 'Right';
		timeline.appendChild(item);
	});
}
