import { getDownloadURL, ref as storageRef, uploadBytes, getStorage, deleteObject } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';

const firebaseConfig = {
	apiKey: 'AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA',
	authDomain: 'hoeve-lootens-497f9.firebaseapp.com',
	projectId: 'hoeve-lootens-497f9',
	storageBucket: 'hoeve-lootens-497f9.appspot.com',
	messagingSenderId: '175696391830',
	appId: '1:175696391830:web:6e836280bf7b23259a1cb7',
	measurementId: 'G-6LXS0WL2CT',
	databaseURL: 'https://hoeve-lootens-497f9-default-rtdb.europe-west1.firebasedatabase.app/',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Generates a unique filename by adding timestamp and random string
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueFilename(originalName) {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 8);
	const extension = originalName.substring(originalName.lastIndexOf('.'));
	const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
	return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
}

async function UploadImage(path, image, input) {
	const metadata = {
		contentType: 'image/jpeg',
		cacheControl: 'public, max-age=31536000',
	};
	const uniqueFilename = generateUniqueFilename(image.name);
	const ref = storageRef(storage, path + '/' + uniqueFilename);
	console.log('Uploading image:', image.name, 'as', uniqueFilename);

	const url = await uploadBytes(ref, image, metadata).then(function (snapshot) {
		return getDownloadURL(ref);
	});

	if (input) {
		input.style.setProperty('--url', 'url(' + url + ')');
		input.setAttribute('data-url', url);
		input.setAttribute('data-filename', uniqueFilename);
	}

	return { url, filename: uniqueFilename };
}

async function UndoUpload(path, image) {
	console.log('Undo upload:', path, image);
	const ref = storageRef(storage, path + '/' + image);
	const result = deleteObject(ref);

	return result;
}

export default { UploadImage, UndoUpload };
