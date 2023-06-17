const mdContent = `Boomgaardcafé

IMAGE: BoomgaardcafeFlyer.jpeg

TEXT: Zin in een instant vakantiegevoel? Kom dan op vrijdagavond na t werk & school naar onze Boomgaardcafé.
Geniet met de voetjes in het gras van een heerlijk drankje en hapje. Ontspan en laat je bedienen door afwisselend vzw Hoeve Lootens, vzw Wondelgemse Paters en Landelijke Gilde Wondelgem.
`;

function parse(md) {
    let articles = md.split('==================================================');
    
    for (let i = 0; i < articles.length; i++) {
        let lines = articles[i].split('\n').filter(line => line.trim() !== '');
        articles[i] = parseLines(lines);
    }

    return articles;
}

function parseLines(lines) {
    let title = lines[0];
    let text = [];
    let image, links, type, textEnd = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('IMAGE: ')) {
            image = lines[i].substring(7).trim();

            if (text.length === 0) {
                type = 'left';
            } else {
                type = 'right';
                textEnd = true;
            }
        } else if (lines[i].startsWith('TEXT: ')) {
            text.push(lines[i].substring(6).trim());
        } else if (lines[i].startsWith('LINKS: ')) {
            links = parseLinks(lines[i].substring(7));

            textEnd = true;
        } else if (!textEnd && text.length > 0) {
            text.push(lines[i]);
        }
    }
    
    return { Title: title, Image: image, Text: text, Links: links, Type: type };
}

function parseLinks(line) {
    let [a, b] = line.split(' || ');

    a = a.trim();
    b = b.trim();
    
    if (a.startsWith('http') || a.startsWith('pages/')) {
        return { Link: a, Text: b };
    }

    return { Link: b, Text: a };
}

function addContent(articles) {
    let container = document.querySelector('.news');
    container.innerHTML = '';

    articles.forEach(article => {
        const title = article.Title;
        const image = article.Image;
        const text = article.Text;
        const links = article.Links;
        const type = article.Type;

        let section = document.createElement('section');
        section.classList.add('container', 'm-auto');
        section.innerHTML = `<div class="row"></div>`;

        let imageContainer = document.createElement('div');
        imageContainer.classList.add('col-6');
        imageContainer.innerHTML = `<img src="images/${image}" alt="${title}">`;
        
        let contentContainer = document.createElement('div');
        contentContainer.classList.add('col-6');
        contentContainer.innerHTML = `<h3 class="section-header">${title}</h3>`;

        text.forEach(line => {
            contentContainer.innerHTML += `<p>${line}</p>`;
        });

        if (links) {
            contentContainer.innerHTML += `<a class="btn btn-primary btn-primary-sm" href="${links.Link}">${links.Text}</a>`;
        }

        if (type === 'left') {
            section.querySelector('.row').appendChild(imageContainer);
            section.querySelector('.row').appendChild(contentContainer);
        } else {
            section.querySelector('.row').appendChild(contentContainer);
            section.querySelector('.row').appendChild(imageContainer);
        }
        
        container.appendChild(section);
    });
}


fetch('https://github.com/WebPrograme/Hoeve-Lootens/blob/d552408296f9b26efc13cdb8a7bba48700c9097d/HOME.md')
    .then(response => response.text())
    .then(text => {
        let parsed = parse(text);
        console.log(parsed);
        addContent(parsed);
    });