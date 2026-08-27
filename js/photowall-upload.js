import { postRequest } from '../modules/Requests.js';
import Upload from '../../modules/Upload.js';

const cameraInput = document.getElementById('camera-input');
const imageInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const submitBtn = document.getElementById('submit-btn');
const previewImage = document.getElementById('preview-image');
const successMessage = document.getElementById('setup-success-message');
let selectedFile;

const reset = () => {
	uploadBtn.dataset.state = 'upload';
	uploadBtn.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
	submitBtn.disabled = false;
	uploadBtn.disabled = false;
	previewImage.src = '';
	previewImage.style.display = 'none';
	cameraInput.value = '';
	imageInput.value = '';
	selectedFile = undefined;
	successMessage.style.display = 'none';
};

const postImage = () => {
	const file = selectedFile;
	if (!file) {
		alert('Kies een foto om te uploaden.');
		return;
	}

	uploadBtn.disabled = true;
	submitBtn.disabled = true;
	uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

	Upload.UploadImage('PhotoWall', file, uploadBtn).then((result) => {
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
					Upload.UndoUpload('PhotoWall', result.filename).then(() => {
						reset();
					});
				}
			})
			.catch((error) => {
				console.error('Error posting to server:', error);
				uploadBtn.innerHTML = '<i class="fas fa-times"></i> Upload Gefaald!';
				Upload.UndoUpload('PhotoWall', result.filename).then(() => {
					reset();
				});
			});
	});
};

uploadBtn.addEventListener('click', () => {
	if (uploadBtn.dataset.state === 'upload') {
		cameraInput.click();
		return;
	}

	postImage();
});

submitBtn.addEventListener('click', () => {
	imageInput.click();
});

const handleImageSelected = (e) => {
	uploadBtn.dataset.state = 'post';
	const file = e.target.files[0];
	if (!file) return;
	selectedFile = file;

	const reader = new FileReader();
	reader.onload = (e) => {
		previewImage.src = e.target.result;
		previewImage.style.display = 'block';
	};
	reader.readAsDataURL(file);
	uploadBtn.innerHTML = '<i class="fas fa-check"></i> Post';
};

cameraInput.addEventListener('change', handleImageSelected);
imageInput.addEventListener('change', handleImageSelected);
