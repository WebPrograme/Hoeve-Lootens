export default class Cache {
	constructor(name = 'default-images') {
		this.cacheName = name;
		this.cache = async () => {
			if ('caches' in window) {
				return await caches.open(this.cacheName);
			} else {
				throw new Error('Cache API is not supported in this browser.');
			}
		};
	}

	async cacheImage(url) {
		const existing = await this.cache().then((c) => c.match(url));

		if (existing) {
			return;
		}

		const response = await fetch(url);

		if (response.ok) {
			await this.cache().then((c) => c.put(url, response));
		}
	}

	async cacheImages(urls) {
		for (const url of urls) {
			await this.cacheImage(url);
		}
	}

	async getCachedImage(url) {
		const response = await this.cache().then((c) => c.match(url));

		if (!response) {
			return url;
		}

		const blob = await response.blob();

		return URL.createObjectURL(blob);
	}
}
