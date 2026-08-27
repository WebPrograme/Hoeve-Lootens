import { postRequest } from '../modules/Requests.js';
import Upload from '../../modules/Upload.js';

const cameraInput = document.getElementById('camera-input');
const imageInput = document.getElementById('file-input');
const cameraBtn = document.getElementById('camera-btn');
const uploadBtn = document.getElementById('upload-btn');
const previewImage = document.getElementById('preview-image');
const successMessage = document.getElementById('setup-success-message');
let selectedFile;

const reset = () => {
	uploadBtn.disabled = false;
	uploadBtn.dataset.state = 'upload';
	uploadBtn.classList.remove('hidden');
	uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Foto';
	cameraBtn.disabled = false;
	cameraBtn.dataset.state = 'upload';
	cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
	cameraBtn.classList.remove('hidden');
	previewImage.src = '';
	previewImage.style.display = 'none';
	cameraInput.value = '';
	imageInput.value = '';
	selectedFile = undefined;
	successMessage.style.display = 'none';
};

const postImage = (btn) => {
	const file = selectedFile;
	if (!file) {
		alert('Kies een foto om te uploaden.');
		return;
	}

	btn.disabled = true;
	btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

	Upload.UploadImage('PhotoWall', file, btn).then((result) => {
		postRequest('/api/photowall/upload', {
			URL: result.url,
			Filename: result.filename,
		})
			.then((response) => {
				if (response.status === 200) {
					btn.innerHTML = '<i class="fas fa-check"></i> Uploaded!';
					successMessage.style.display = 'flex';
					setTimeout(() => {
						reset();
					}, 2000);
				} else {
					btn.innerHTML = '<i class="fas fa-times"></i> Upload Gefaald!';
					Upload.UndoUpload('PhotoWall', result.filename).then(() => {
						reset();
					});
				}
			})
			.catch((error) => {
				console.error('Error posting to server:', error);
				btn.innerHTML = '<i class="fas fa-times"></i> Upload Gefaald!';
				Upload.UndoUpload('PhotoWall', result.filename).then(() => {
					reset();
				});
			});
	});
};

uploadBtn.addEventListener('click', () => {
	if (uploadBtn.dataset.state === 'upload') {
		imageInput.click();
		return;
	}

	postImage(uploadBtn);
});

cameraBtn.addEventListener('click', () => {
	if (uploadBtn.dataset.state === 'upload') {
		cameraInput.click();
		return;
	}

	postImage(cameraBtn);
});

const handleImageSelected = (e) => {
	const btn = e.target.id === 'camera-input' ? cameraBtn : uploadBtn;
	btn.dataset.state = 'post';
	const file = e.target.files[0];
	if (!file) return;
	selectedFile = file;

	if (btn.id === 'camera-btn') {
		uploadBtn.dataset.state = 'post';
		uploadBtn.classList.add('hidden');
	} else {
		cameraBtn.dataset.state = 'post';
		cameraBtn.classList.add('hidden');
	}

	const reader = new FileReader();
	reader.onload = (e) => {
		previewImage.src = e.target.result;
		previewImage.style.display = 'block';
	};
	reader.readAsDataURL(file);
	btn.innerHTML = '<i class="fas fa-check"></i> Post';
};

cameraInput.addEventListener('change', (e) => {
	handleImageSelected(e);
});
imageInput.addEventListener('change', (e) => {
	handleImageSelected(e);
});
