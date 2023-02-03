// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
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
const analytics = getAnalytics(app);
const storage = getStorage(app);
let data = [];
console.log("Firebase is geladen");

function uploadFile(data) {
    // Upload a blob or file		
    var myJSON = JSON.stringify(data);
    var blob = new Blob([myJSON], {
        type: "application/json"
    })
    const storageRef = ref(storage, 'shop.json');
    uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Updated file!');
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
    document.querySelector('.form-shop').style.display = 'none';
    document.querySelector('.choosen-item').style.display = 'none';
    document.querySelector('.UserCodeResult').style.display = 'block';
    document.querySelector('.form-success').style.display = 'block';
    document.querySelector('.btn-shop-confirm').setAttribute('style', 'display: none !important');
    document.querySelector('.btn-shop-close').setAttribute('style', 'display: block !important');
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

// Download file
getDownloadURL(ref(storage, 'shop.json')).then((url) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onload = function (event) {
        data = JSON.parse(xhr.response);

        var cards = document.querySelector('.cards');
        var cardHTML = '';

        for (var i = 0; i < data.length; i++) {
            if (data[i]['Available Places'] > 0 && data[i]['Available']) {
                cardHTML += `
                    <div class="shop-card">
                        <img src="../images/` + data[i]['Image'] + `">
                        <div class="shop-card-header">
                            <h3>` + data[i]['Event Name'] + `</h3>
                            <h3>€` + data[i]['Price'] + `</h3>
                        </div>
                        <p class="status">` + data[i]['Date'] + `</p>
                        <a class="btn btn-main btn-main-sm btn-shop-add" data-value="` + data[i]['Event Name'] + `">Schrijf in</a>
                    </div>
                `;
            }
        }

        cards.innerHTML = cardHTML;

        document.querySelectorAll('.btn-shop-add').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const EventName = e.target.getAttribute('data-value');

                for (var i = 0; i < data.length; i++) {
                    if (data[i]['Event Name'] == EventName) {
                        var modal = document.querySelector('#shopBuyModal');
                        document.querySelector('.choosen-item-name').innerHTML = data[i]['Event Name'];
                        document.querySelector('.choosen-item-price').innerHTML = "€" + data[i]['Price'];
                        document.querySelector('.choosen-item-date').innerHTML = data[i]['Date'];
                        document.querySelector('.form-shop [title="amount"]').setAttribute('max', data[i]['Available Places'])
                        document.querySelector('.btn-shop-confirm').setAttribute('data-value', data[i]['Event Name'])
                    }
                }

                $('#shopBuyModal').modal('show');
            });
        });
    };
}).catch((error) => {
    console.log(error);
});

document.querySelector('.btn-shop-confirm').addEventListener('click', function () {
    downloadData();
    
    var form = document.querySelector('.form-shop');
    var EventName = document.querySelector('.btn-shop-confirm').getAttribute('data-value');
    var BtnAdd = document.querySelector('.btn-shop-confirm');
    var FirstName = form.querySelector('[title="firstname"]').value;
    var LastName = form.querySelector('[title="lastname"]').value;
    var Email = form.querySelector('[title="email"]').value;
    var Phone = form.querySelector('[title="phone"]').value;
    var Amount = form.querySelector('[title="amount"]').value;
    BtnAdd.innerHTML = 'Bezig met inschrijven...';
    if (FirstName == "" || LastName == "" || Email == "" || Phone == "" || Amount == "") {
        BtnAdd.innerHTML = 'Vul alle velden in!';
        BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
        return;
    }
    var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);
    for (var i = 0; i < data.length; i++) {
        if (data[i]['Event Name'] == EventName) {
            data[i]['Available Places'] = data[i]['Available Places'] - Amount;
            
            data[i]['Participants'].push({
                'First Name': FirstName,
                'Last Name': LastName,
                'Email': Email,
                'Phone': Phone,
                'Amount': Amount,
                'UserCode': UserCode
            });
            uploadFile(data);
            showSuccess(UserCode);
        }
    }
});

document.querySelector('.btn-submit-email').addEventListener('click', function () {
    var form = document.querySelector('.form-check-code');
    var BtnSubmit = document.querySelector('.btn-submit-email');
    var EventsElement = document.querySelector('.UserEventsResults');
    var Email = form.querySelector('[title="email"]').value;
    var SignedUpEvents = [];
    var SignedUpCodes = [];

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
    
    BtnSubmit.innerHTML = 'Bezig met zoeken...';

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i]['Participants'].length; j++) {
            if (data[i]['Participants'][j]['Email'] == Email) {
                SignedUpEvents.push(data[i]['Event Name']);
                SignedUpCodes.push(data[i]['Participants'][j]['UserCode']);
                break;
            }
        }
    }

    if (SignedUpEvents.length == 0) {
        BtnSubmit.innerHTML = 'Geen inschrijvingen gevonden!';
        BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        return;
    }

    var html = '';

    for (var i = 0; i < SignedUpEvents.length; i++) {
        if (i == SignedUpEvents.length - 1) {
            html += SignedUpEvents[i] + ' (' + SignedUpCodes[i] + ')';
            break;
        }
        html += SignedUpEvents[i] + ' (' + SignedUpCodes[i] + ')' + ', ';
    }

    document.querySelector('.form-check-code').setAttribute('style', 'display: none !important;')
    document.querySelector('.UserEvents').setAttribute('style', 'display: block !important;')
    document.querySelector('.btn-close-email').setAttribute('style', 'display: block !important;')
    BtnSubmit.setAttribute('style', 'display: none !important;')

    EventsElement.innerHTML = html;
});

document.querySelector('.btn-shop-close').addEventListener('click', function () {
    document.querySelector('.form-shop').style.display = 'block';
    document.querySelector('.choosen-item').style.display = 'block';
    document.querySelector('.UserCodeResult').style.display = 'none';
    document.querySelector('.form-success').style.display = 'none';
    document.querySelector('.btn-shop-confirm').setAttribute('style', 'display: block !important');
    document.querySelector('.btn-shop-close').setAttribute('style', 'display: none !important');
});