const fileIndex = {
	index: 'HOME',
	verbouwing: 'VERBOUWING',
};

class Parse {
	constructor(md) {
		this.md = md;
	}

	parse(functionName) {
		let articles = this.md.split('==================================================');

		if (articles.at(-1) === '' || articles.at(-1) === '\n') articles.pop();

		for (let i = 0; i < articles.length; i++) {
			let lines = articles[i].split('\n').filter((line) => line.trim() !== '');
			articles[i] = this[functionName](lines);
		}

		return articles;
	}

	links(line) {
		let [a, b] = line.split(' || ');

		a = a.trim();
		b = b.trim();

		if (a.startsWith('http') || a.startsWith('pages/')) {
			return { Link: a, Text: b };
		}

		return { Link: b, Text: a };
	}

	HOME(lines) {
		let title = lines[0];
		let text = [];
		let image,
			links,
			textEnd = false;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('IMAGE: ')) {
				image = lines[i].substring(7).trim();

				if (text.length > 0) {
					textEnd = true;
				}
			} else if (lines[i].startsWith('TEXT: ')) {
				text.push(lines[i].substring(6).trim());
			} else if (lines[i].startsWith('LINKS: ')) {
				links = this.links(lines[i].substring(7));

				textEnd = true;
			} else if (!textEnd && text.length > 0) {
				text.push(lines[i]);
			}
		}

		return { Title: title, Image: image, Text: text, Links: links };
	}

	VERBOUWING(lines) {
		let title = lines[0];
		let text = [];
		let image,
			textEnd = false;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('IMAGE: ')) {
				image = lines[i].substring(7).trim();

				if (text.length > 0) {
					textEnd = true;
				}
			} else if (lines[i].startsWith('TEXT: ')) {
				text.push(lines[i].substring(6).trim());
			} else if (!textEnd && text.length > 0) {
				text.push(lines[i]);
			}
		}

		return { Title: title, Image: image, Text: text };
	}
}

class AddContent {
	constructor(articles, functionName) {
		this.articles = articles;
		this[functionName]();
	}

	HOME() {
		let articles = this.articles;
		let type = 'left';
		let container = document.querySelector('.news');
		container.innerHTML = '';

		Object.values(articles)
			//.reverse()
			.forEach((article) => {
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

	VERBOUWING() {
		const colors = ['Blue', 'Brown', 'Rose', 'Yellow'];

		let colorIndex = 0;
		let articles = this.articles;
		let direction = 'Right';
		let timeline = document.querySelector('.timeline');
		timeline.innerHTML = '';

		articles.forEach((article) => {
			const title = article.Title;
			const image = article.Image;
			const text = article.Text;

			let item = document.createElement('div');
			item.classList.add('timelineContainer', 'timeline' + direction);
			item.innerHTML = `<div class="timelineContent timeline${colors[colorIndex]}">
                <div class="row">
                    <div class="col-6">
                        <h2>${title}</h2>
                        <p>${text.join('</p><p>')}</p>
                    </div>

                    <div class="col-6">
                        <img src="../images/${image}" alt="${title}" class="timeline-img">
                    </div>
                </div>
            </div>`;

			colorIndex = colorIndex === colors.length - 1 ? 0 : colorIndex + 1;
			direction = direction === 'Right' ? 'Left' : 'Right';
			timeline.appendChild(item);
		});
	}
}

let path = window.location.pathname;
let page = path.split('/').pop().split('.')[0] || 'index';
let file = fileIndex[page];

if (page === 'index') {
	fetch(`https://hoeve-lootens.onrender.com/api/website/articles`)
		.then((response) => response.json())
		.then((data) => {
			new AddContent(data, file);

			// On article click
			document.querySelectorAll('.news section').forEach((article) => {
				article.addEventListener('click', () => {
					window.parent.postMessage(
						{
							type: 'ARTICLE_SELECTED',
							articleId: article.getAttribute('data-id'),
						},
						'*'
					);
				});
			});
		});
} else {
	fetch(`https://raw.githubusercontent.com/WebPrograme/Hoeve-Lootens/master/MD/${file}.md`)
		.then((response) => response.text())
		.then((text) => {
			let parsed = new Parse(text).parse(file);
			new AddContent(parsed, file);
		});
}
