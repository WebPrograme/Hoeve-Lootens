import { getRequest } from '../modules/Requests.js';

const setupScreen = document.getElementById('setup-screen');
const slideshowScreen = document.getElementById('slideshow-screen');
const startBtn = document.getElementById('start-btn');
const exitBtn = document.getElementById('exit-btn');
const imgCurrent = document.getElementById('photowall-image');
const imgNext = document.getElementById('photowall-image-next');
const captionEl = document.getElementById('photowall-caption');
const captionText = document.getElementById('caption-text');
const progressBar = document.getElementById('progress-bar');
const photowall = document.getElementById('photowall');
const intervalInput = document.getElementById('interval');
const intervalVal = document.getElementById('interval-val');

let settings = {};
let timer = null;
let nextPhoto = null;
let running = false;
let transitioning = false;

intervalInput.addEventListener('input', () => {
	intervalVal.textContent = intervalInput.value;

	const pct = ((intervalInput.value - 2) / (30 - 2)) * 100;
	intervalInput.style.setProperty('--pct', pct + '%');
});

async function fetchNext() {
	try {
		const res = await getRequest('/api/photowall/order/next');
		if (res.status === 200) return res.data;
	} catch (e) {
		console.error(e);
	}
	return null;
}

async function preload(url) {
	const img = new Image();
	img.src = url;
	await img.decode();
	return url;
}

function startProgress(ms) {
	progressBar.style.transition = 'none';
	progressBar.style.width = '0%';

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			progressBar.style.transition = `width ${ms}ms linear`;
			progressBar.style.width = '100%';
		});
	});
}

function resetProgress() {
	progressBar.style.transition = 'none';
	progressBar.style.width = '0%';
}

async function showPhoto(photo) {
	if (!photo || !running) return;

	await preload(photo.URL);
	imgNext.src = photo.URL;

	captionText.textContent = photo.Caption || '';

	captionEl.classList.toggle('hidden', !settings.captions);
	imgCurrent.src = imgNext.src;
	imgNext.src = '';

	startProgress(settings.interval * 1000);

	nextPhoto = await fetchNext();

	timer = setTimeout(advance, settings.interval * 1000);
}

async function advance() {
	if (!running || transitioning) return;

	clearTimeout(timer);

	let photo = nextPhoto;
	nextPhoto = null;

	if (!photo) {
		photo = await fetchNext();
	}

	if (!photo) {
		timer = setTimeout(advance, 1000);
		return;
	}

	await showPhoto(photo);
}

startBtn.addEventListener('click', async () => {
	settings = {
		interval: parseInt(intervalInput.value, 10),
		captions: document.getElementById('captions').checked,
	};

	const first = await fetchNext();
	if (!first) {
		alert("Geen foto's gevonden.");
		return;
	}

	await preload(first.URL);

	running = true;

	setupScreen.classList.add('hidden');
	slideshowScreen.classList.remove('hidden');

	if (document.getElementById('fullscreen-opt').checked) {
		document.documentElement.requestFullscreen?.().catch(() => {});
	}

	imgCurrent.src = first.URL;
	captionText.textContent = first.Caption || '';

	startProgress(settings.interval * 1000);

	nextPhoto = await fetchNext();

	timer = setTimeout(advance, settings.interval * 1000);
});

exitBtn.addEventListener('click', () => {
	running = false;

	clearTimeout(timer);
	resetProgress();

	document.exitFullscreen?.();

	slideshowScreen.classList.add('hidden');
	setupScreen.classList.remove('hidden');

	imgCurrent.src = '';
	imgNext.src = '';

	nextPhoto = null;
});
