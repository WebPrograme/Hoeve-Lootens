import { postRequest } from '../modules/Requests.js';
import Upload from '../../modules/Upload.js';

const imageInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const previewImage = document.getElementById('preview-image');
const successMessage = document.getElementById('setup-success-message');

const reset = () => {
	uploadBtn.dataset.state = 'upload';
	uploadBtn.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
	uploadBtn.disabled = false;
	previewImage.src = '';
	previewImage.style.display = 'none';
	imageInput.value = '';
	successMessage.style.display = 'none';
};

uploadBtn.addEventListener('click', (e) => {
	if (uploadBtn.dataset.state === 'upload') {
		imageInput.click();
		return;
	}

	const file = imageInput.files[0];
	if (!file) {
		alert('Kies een foto om te uploaden.');
		return;
	}

	uploadBtn.disabled = true;
	uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

	Upload.UploadImage('photowall', file, uploadBtn).then((result) => {
		postRequest('/api/photowall/upload', {
			URL: result.url,
			Filename: result.filename,
		})
			.then((response) => {
				if (response.status === 200) {
					uploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded!';
					successMessage.style.display = 'flex';
					setTimeout(() => {
						reset();
					}, 2000);
				} else {
					uploadBtn.innerHTML = '<i class="fas fa-times"></i> Upload Gefaald!';
					Upload.UndoUpload('photowall', result.filename).then(() => {
						reset();
					});
				}
			})
			.catch((error) => {
				console.error('Error posting to server:', error);
				uploadBtn.innerHTML = '<i class="fas fa-times"></i> Upload Gefaald!';
				Upload.UndoUpload('photowall', result.filename).then(() => {
					reset();
				});
			});
	});
});

imageInput.addEventListener('change', (e) => {
	uploadBtn.dataset.state = 'post';
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (e) => {
		previewImage.src = e.target.result;
		previewImage.style.display = 'block';
	};
	reader.readAsDataURL(file);
	uploadBtn.innerHTML = '<i class="fas fa-check"></i> Post';
});
