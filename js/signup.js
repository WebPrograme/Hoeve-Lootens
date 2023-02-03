// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, updateMetadata   } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyA4R3_Qmo2k4LyMtXs86xTkHtx9tIM8VoA",
    authDomain: "hoeve-lootens-497f9.firebaseapp.com",
    projectId: "hoeve-lootens-497f9",
    storageBucket: "hoeve-lootens-497f9.appspot.com",
    messagingSenderId: "175696391830",
    appId: "1:175696391830:web:6e836280bf7b23259a1cb7",
    measurementId: "G-6LXS0WL2CT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
let data = [];
console.log("Firebase is geladen");

function uploadFile(data) {
    // Upload a blob or file		
    var myJSON = JSON.stringify(data);
    var blob = new Blob([myJSON], {
        type: "application/json"
    })
    const storageRef = ref(storage, 'database.json');
    uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Uploaded file!');
    });
}

function getRandomIntInclusive(data, min, max) {
    var UserCodes = [];
    for (var i = 0; i < data.length; i++) {
        UserCodes.push(data[i].UserCode);
    }
    
    min = Math.ceil(min);
    max = Math.floor(max);

    while (true) {
        var random = Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
        if (!UserCodes.includes(random)) {
            return random;
        }
    }
}

function showSuccess(UserCode) {
    document.querySelector('.UserCodeResult').innerHTML = UserCode;
    document.querySelector('.form-signup').style.display = 'none';
    document.querySelector('.signup-subheader').style.display = 'none';
    document.querySelector('.UserCodeResult').style.display = 'block';
    document.querySelector('.form-success').style.display = 'block';
}

function downloadData() {
    // Download data
    getDownloadURL(ref(storage, 'database.json')).then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onload = function (event) {
            data = JSON.parse(xhr.response);
        };
    }).catch((error) => {
        console.log(error);
    });
}

document.querySelector('.btn-submit').addEventListener('click', function () {
    downloadData();

    var BtnSubmit = document.querySelector('.btn-submit');
    BtnSubmit.innerHTML = 'Verzenden...';

    const form = document.querySelector('.form-signup')
    var FirstName = form.querySelector('[title="firstname"]').value;
    var LastName = form.querySelector('[title="lastname"]').value;
    var Email = form.querySelector('[title="email"]').value;
    var Phone = form.querySelector('[title="phone"]').value;
    var Address = form.querySelector('[title="address"]').value;
    var AdultMeat = form.querySelector('[title="adultMeat"]').value || 0;
    var AdultFish = form.querySelector('[title="adultFish"]').value || 0;
    var AdultVegetarian = form.querySelector('[title="adultVegan"]').value || 0;
    var ChildMeat = form.querySelector('[title="childMeat"]').value || 0;
    var ChildVegetarian = form.querySelector('[title="childVegan"]').value || 0;

    if (FirstName == '' || LastName == '' || Email == '' || Phone == '' || Address == '') {
        BtnSubmit.innerHTML = 'Vul alle velden in!';
        BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        return;
    }

    var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);

    data.push({
        'Voornaam': FirstName,
        'Achternaam': LastName,
        'UserCode': UserCode,
        'Email': Email,
        'Telefoonnummer': Phone,
        'Adres': Address,
        'Volwassenen vlees': AdultMeat,
        'Volwassenen vis': AdultFish,
        'Volwassenen vegetarisch': AdultVegetarian,
        'Kinderen vlees': ChildMeat,
        'Kinderen vegetarisch': ChildVegetarian
    });

    uploadFile(data);
    showSuccess(UserCode);
});

document.querySelector('.btn-submit-email').addEventListener('click', function () {
    var BtnSubmit = document.querySelector('.btn-submit-email');
    var BtnClose = document.querySelector('.btn-close-email');
    var EmailInput = document.querySelector('.form-check-code').querySelector('[title="email"]');
    var UserCodeElement = document.querySelector('.UserCode');
    const formEmail = document.querySelector('.form-check-code');
    var Email = formEmail.querySelector('[title="email"]').value;

    if (Email == '') {
        BtnSubmit.innerHTML = 'Vul alle velden in!';
        BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        return;
    }

    getDownloadURL(ref(storage, 'shop.json')).then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onload = function (event) {
            data = JSON.parse(xhr.response);
        }
    }).catch((error) => {
        console.log(error);
    });

    for (var i = 0; i < data.length; i++) {
        if (data[i].Email == Email) {
            UserCodeElement.innerHTML = data[i].UserCode;

            EmailInput.setAttribute('style', 'display: none !important;');
            UserCodeElement.setAttribute('style', 'display: block !important;');
            BtnSubmit.setAttribute('style', 'display: none !important;');
            BtnClose.setAttribute('style', 'display: block !important;');
            return;
        }
    }
    
    BtnSubmit.innerHTML = 'Email niet gevonden!';
    BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
});

document.querySelector('.btn-close-email').addEventListener('click', function () {
    document.querySelector('.UserCode').style.display = 'none';
    document.querySelector('.btn-close-email').style.display = 'none';
    document.querySelector('.btn-submit-email').style.display = 'block';
    document.querySelector('.form-check-code').querySelector('[title="email"]').style.display = 'block';
});

document.querySelectorAll('.form-signup .form-control[type=number]').forEach(function (element) {
    element.addEventListener('change', function () {
        var total = 0;
        var inputFields = document.querySelectorAll('.form-signup .form-control[type=number]');
        
        for (var i = 0; i < inputFields.length; i++) {
            if (inputFields[i].value != '') {
                total += parseFloat(inputFields[i].getAttribute('data-price')) * parseFloat(inputFields[i].value);
            }
        }

        document.querySelector('.form-total').innerHTML = '€' + total;
    });
});