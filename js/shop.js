// FILE IN PROGRESS - NOT READY FOR PRODUCTION

let data = [];

// Create User Code
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

// GET Request
function getRequest(target) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://hoeve-lootens-email.onrender.com/api/v2/' + target, true);
        xhr.send();
        xhr.onload = function () {
            resolve(this);
        }
    });
}

// POST Request
function postRequest(target, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://hoeve-lootens-email.onrender.com/api/v2/' + target, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onload = function () {
            resolve(this);
        }
    });
}

// PUT Request
function putRequest(target, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', 'https://hoeve-lootens-email.onrender.com/api/v2/' + target, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onload = function () {
            resolve(this);
        }
    });
}

// Reset Modal
function resetModal() {
    let modal = document.querySelector('.modal');

    modal.classList.remove('modal-open');
    modal.querySelector('.shop-form').style.display = 'block';
    modal.querySelector('.shop-info').style.display = 'flex';
    modal.querySelector('.btn-shop-submit').style.display = 'block';
    modal.querySelector('.btn-shop-submit').style.backgroundColor = '#FCC000';
    modal.querySelector('.btn-shop-submit').innerHTML = 'Inschrijven';
    modal.querySelector('.shop-success').style.display = 'none';
    
    document.querySelector('.shop-success-payconiq-qr').src = '';
}

// Get Available Events
function getAvailableEvents() {
    return new Promise((resolve, reject) => {
        postRequest('init/public', {}).then((res) => {
            if (res.status == 200) {
                let data = JSON.parse(res.response);
                let availableEvents = [];

                Object.keys(data).forEach(function (key) {
                    if (data[key]['Available Places'] > 0 && data[key]['Type'] != 'Food') {
                        let now = new Date();
                        let start = data[key]['Start Date'] != undefined ? new Date(data[key]['Start Date']) : null;
                        let end = data[key]['End Date'] != undefined ? new Date(data[key]['End Date']) : null;

                        // Check if Event can be shown
                        if (start != null && now < start) return;
                        if (end != null && now > end) return;

                        availableEvents.push(key);
                    }
                });

                resolve(availableEvents);
            } else {
                reject(res);
            }
        });
    });
}

// Get All Events
if (window.location.pathname == '/pages/shop.html') {
    postRequest('init/public', {}).then((res) => {
        if (res.status == 200) {
            data = JSON.parse(res.response);
            let shop = document.querySelector('.shop-container');
            let cardFood;

            // Create Event Cards
            Object.keys(data).forEach(function (key) {
                let now = new Date();
                let start = data[key]['Start Date'] != undefined ? new Date(data[key]['Start Date']) : null;
                let end = data[key]['End Date'] != undefined ? new Date(data[key]['End Date']) : null;
                
                // Check if Event can be shown
                if (start != null && now < start) return;
                if (end != null && now > end) return;

                if (data[key]['Available Places'] > 0) {
                    // Create Card
                    var card = document.createElement('div');

                    if (data[key]['Type'] == 'Activity' || data[key]['Type'] == 'QR' || data[key]['Type'] == 'Quiz') {
                        card.innerHTML = `
                            <img src="` + data[key]['Image'] + `">
                            <div class="shop-card-header">
                                <h3>` + key + `</h3>
                                <h3>€` + data[key]['Price'] + `</h3>
                            </div>
                            <p class="status">` + data[key]['Date'] + `</p>
                            <a class="btn btn-primary btn-primary-sm btn-shop-add" data-value="` + key + `" data-target-modal="modal-signup">Schrijf in</a>
                        `;
                    
                        card.classList.add('shop-card');
                        shop.appendChild(card);
                    } else if (data[key]['Type'] == 'Food') { // Unique for Food
                        cardFood = document.createElement('div');
                        cardFood.innerHTML = `
                            <h3>` + key + `</h3>
                            <a class="btn btn-secondary btn-secondary-sm btn-shop-food" href="/pages/form.html">Schrijf in</a>
                        `;
                    }
                } else {
                    // Create Card (Sold Out)
                    if (data[key]['Type'] == 'Activity' || data[key]['Type'] == 'QR' || data[key]['Type'] == 'Quiz') {
                        var card = document.createElement('div');

                        card.innerHTML = `
                            <img src="` + data[key]['Image'] + `">
                            <div class="shop-card-header">
                                <h3>` + key + `</h3>
                                <h3>€` + data[key]['Price'] + `</h3>
                            </div>
                            <p class="status">` + data[key]['Date'] + `</p>
                            <a class="btn btn-secondary btn-secondary-sm btn-shop-add">Volzet!</a>
                        `;
                    
                        card.classList.add('shop-card');
                        shop.appendChild(card);
                    }
                }
            });
                    
            if (cardFood != undefined) {
                cardFood.classList.add('shop-card');
                shop.appendChild(cardFood);
            }

            // Show Signup Modal
            document.querySelectorAll('.btn-shop-add').forEach((el) => {
                el.addEventListener('click', (e) => {
                    // Change Modal Content Based on Event
                    let target = e.target.getAttribute('data-target-modal');
                    let modal = document.getElementById(target);
                    let closeTrough = modal.getAttribute('close-trough') || null;

                    modal.querySelector('.modal-title').innerHTML = e.target.getAttribute('data-value');
                    modal.querySelector('.shop-image').setAttribute('src', data[e.target.getAttribute('data-value')]['Image']);
                    modal.querySelector('.shop-price').innerHTML = data[e.target.getAttribute('data-value')]['Type'] == 'QR' ? '€' + data[e.target.getAttribute('data-value')]['Price'] + '/pp' : '€' + data[e.target.getAttribute('data-value')]['Price'];
                    modal.querySelector('.shop-title').innerHTML = e.target.getAttribute('data-value');
                    modal.querySelector('.shop-date').innerHTML = data[e.target.getAttribute('data-value')]['Date'];
                    modal.querySelector('.shop-description').innerHTML = data[e.target.getAttribute('data-value')]['Description'];
                    modal.querySelector('.btn-shop-submit').setAttribute('data-value', e.target.getAttribute('data-value'));
                    modal.querySelector('.shop-form-options').innerHTML = '';
            
                    if (data[e.target.getAttribute('data-value')]['Type'] == 'Quiz') {
                        // Show Custom Options for Quiz
                        if (modal.querySelector('.shop-input[name="Personen"]') != undefined) {
                            modal.querySelector('.shop-input[name="Personen"]').parentElement.remove();
                        }

                        modal.querySelector('.shop-total').innerHTML = '€' + data[e.target.getAttribute('data-value')]['Price'];

                        Object.keys(data[e.target.getAttribute('data-value')]['Options']).forEach(function (key) {
                            let label = document.createElement('label');
                            label.classList.add('label');
                            label.innerHTML = key;
                            label.setAttribute('for', key);

                            let input = document.createElement('input');
                            input.classList.add('shop-input', 'input');
                            
                            if (typeof data[e.target.getAttribute('data-value')]['Options'][key] === 'string') {
                                input.setAttribute('type', 'text');
                            } else if (typeof data[e.target.getAttribute('data-value')]['Options'][key] === 'number') {
                                input.setAttribute('type', 'number');
                            }

                            input.setAttribute('name', key);
                            input.setAttribute('id', key);
                            input.setAttribute('placeholder', key);

                            modal.querySelector('.shop-form-options').appendChild(label);
                            modal.querySelector('.shop-form-options').appendChild(input);
                        });
                    } else {
                        if (modal.querySelector('.shop-input[name="Personen"]') != null) {
                            modal.querySelector('.shop-input[name="Personen"]').setAttribute('max', data[e.target.getAttribute('data-value')]['Available Places']);
                            modal.querySelector('.shop-input[name="Personen"]').setAttribute('data-value', e.target.getAttribute('data-value'));
                        } else {
                            let personsContainer = document.createElement('div');
                            personsContainer.innerHTML = `
                                <label class="label" for="Personen">Personen</label>
                                <input class="shop-input input" type="number" name="Personen" id="Personen" placeholder="Personen" min="1" max="` + data[e.target.getAttribute('data-value')]['Available Places'] + `">
                            `;
                            modal.querySelector('.shop-persons-line').appendChild(personsContainer);
                        }

                        modal.querySelector('.shop-input[name="Personen"]').addEventListener('keyup', (input) => {
                            modal.querySelector('.shop-total').innerHTML = '€' + (input.target.value * data[e.target.getAttribute('data-value')]['Price']);
                        });
                    }

                    modal.classList.add('modal-open');

                    e.stopPropagation();
                    if (closeTrough !== null) {
                        // Close Modal When Clicked Outside
                        modal.classList.add('close-trough');
            
                        document.addEventListener('click', (event) => {
                            const withinBoundaries = event.composedPath().includes(document.querySelector('.modal-content'));
            
                            if (!withinBoundaries) {
                                modal.classList.remove('modal-open');
                            } else {
                                return;
                            }
                        });
                    }
                });
            });
            
            // Close Modal
            document.querySelectorAll('.modal-close').forEach((el) => {
                el.addEventListener('click', (e) => {
                    resetModal();
                });
            });
        }
    });

    // Submit Form
    document.querySelector('.btn-shop-submit').addEventListener('click', async function () {
        // Get Event Data To Check If Event Is Still Available
        postRequest('init/public', {}).then((res) => {
            if (res.status == 200) {
                let dataEvent = JSON.parse(res.response)[document.querySelector('.btn-shop-submit').getAttribute('data-value')];
                
                // Get Form Data
                var form = document.querySelector('.shop-form');
                var EventName = document.querySelector('.btn-shop-submit').getAttribute('data-value');
                var BtnAdd = document.querySelector('.btn-shop-submit');
                var FirstName = form.querySelector('[name="Voornaam"]').value.trim();
                var LastName = form.querySelector('[name="Achternaam"]').value.trim();
                var Email = form.querySelector('[name="Email"]').value.trim();
                var Phone = form.querySelector('[name="Telefoonnummer"]').value;
                var Address = form.querySelector('[name="Adres"]').value.trim();
    
                if (dataEvent['Type'] == 'Quiz') {
                    // Get Unique Options For Type Quiz
                    var Amount = 1;
                    var Options = {};
    
                    Object.keys(dataEvent['Options']).forEach(function (key) {
                        Options[key] = form.querySelector('[name="' + key + '"]').value;
                    });
    
                    if (Object.values(Options).includes('')) {
                        BtnAdd.innerHTML = 'Vul alle velden in!';
                        BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                    }
    
                    // Create Data Object From Values
                    var data = {
                        'FirstName': FirstName,
                        'LastName': LastName,
                        'Email': Email,
                        'Phone': Phone,
                        'Amount': dataEvent['Price'],
                        'Address': Address,
                        'Options': Options,
                        'Event': EventName
                    };
                } else {
                    // Create Data Object From Values
                    var Amount = form.querySelector('[name="Personen"]').value;
    
                    var data = {
                        'FirstName': FirstName,
                        'LastName': LastName,
                        'Email': Email,
                        'Phone': Phone,
                        'Quantity': Amount,
                        'Address': Address,
                        'Amount': dataEvent['Price'] * Amount,
                    };
                }
    
                BtnAdd.innerHTML = 'Bezig met inschrijven...';
    
                // Check If Event Is Still Available
                if (dataEvent['Available Places'] < Amount || dataEvent['Available Places'] == 0) {
                    BtnAdd.innerHTML = 'Geen plaatsen meer beschikbaar!';
                    BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                    return;
                }
    
                // Check If All Fields Are Filled In
                if (FirstName == "" || LastName == "" || Email == "" || Phone == "" || Amount == "") {
                    BtnAdd.innerHTML = 'Vul alle velden in!';
                    BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                    return;
                }
    
                // Create User Code
                var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);
                UserCode = UserCode.toUpperCase();
                data['UserCode'] = UserCode;
    
                // Add User To Database
                putRequest('set', {Event: EventName, Data: data}).then((res) => {
                    if (res.status === 200) {
                        document.querySelector('.shop-form').style.display = 'none';
                        document.querySelector('.shop-info').style.display = 'none';
                        document.querySelector('.btn-shop-submit').style.display = 'none';
                        document.querySelector('.shop-success-methods').style.display = 'block';
    
                        // Get Choosed Payment Method
                        document.querySelectorAll('.btn-shop-method').forEach((el) => {
                            el.addEventListener('click', (e) => {
                                let method = e.target.getAttribute('data-method');
    
                                document.querySelector('.shop-success-methods').style.display = 'none';
                                document.querySelector('.shop-success-' + method).style.display = 'block';
    
                                if (method == 'overschrijving') {
                                    // Show Info For Overschrijving
                                    document.querySelector('.shop-success-overschrijving-price').innerHTML = '€' + dataEvent['Price'] * Amount;
                                    document.querySelector('.shop-success-overschrijving-code').innerHTML = UserCode;
                                } else if (method == 'payconiq') {
                                    let qrcodeImg = document.querySelector('.shop-success-payconiq-qr');
                                    let phoneLink = document.querySelector('.shop-success-payconiq-mobile');
                                    
                                    qrcodeImg.src = '';
                                    phoneLink.href = '';
                                    document.querySelector('.shop-success-payconiq-timer').innerHTML = '';

                                    // Create Payconiq QR Code
                                    postRequest('payconiq', {Amount: dataEvent['Price'] * Amount, Ref: UserCode, Event: EventName}).then((res) => {
                                        if (res.status == 200) {
                                            let links = JSON.parse(res.response);

                                            // Open Payconiq App On Mobile
                                            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                                                window.open(links['deeplink'], '_blank');
                                            }
                                            
                                            qrcodeImg.src = links['qr'];
                                            phoneLink.href = links['deeplink'];
    
                                            // Start Timer (15 Minutes)
                                            var start = Date.now();
                                            setInterval(function() {
                                                var delta = Date.now() - start;
                                                var seconds = Math.floor(delta / 1000);
                                                var minutes = Math.floor(seconds / 60);
                                                seconds = seconds % 60;
                                                minutes = minutes % 60;
                                                document.querySelector('.shop-success-payconiq-timer').innerHTML = 14 - minutes + ':' + (60 - seconds);
    
                                                if (minutes == 14 && seconds == 59) {
                                                    document.querySelector('.shop-success-payconiq-timer').innerHTML = 'De tijd is verstreken!';
                                                    document.querySelector('.shop-success-payconiq-timer').style.color = 'red';
                                                    clearInterval();
                                                }
                                            }, 1000);
                                        }
                                    });
                                }
                            });
                        });
                    } else if (res.status == 400) {
                        BtnAdd.innerHTML = 'U bent al ingeschreven!';
                        BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                    } else {
                        BtnAdd.innerHTML = 'Er is iets misgegaan!';
                        BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                    }
                });
            }
        });
    });

    // Get UserCode From Email
    document.querySelector('.btn-submit-email').addEventListener('click', (e) => {
        let BtnSubmit = e.target;
        let BtnClose = document.querySelector('.btn-close-email');
        let EmailInput = document.querySelector('.form-check-code').querySelector('[title="email"]');
        let Email = EmailInput.value;
        let UserCodeElement = document.querySelector('.UserCode');

        if (Email == '') {
            BtnSubmit.innerHTML = 'Vul alle velden in!';
            BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
            return;
        }
        
        getRequest('get/email?email=' + Email).then((response) => {
            if (response.response != 'User not found!' && response.response != '{}') {
                const data = JSON.parse(response.response);
                let result = '';
                Object.keys(data).forEach((key) => {
                    result += key + ' (' + data[key] + ')<br>';
                });

                UserCodeElement.innerHTML = result;

                EmailInput.setAttribute('style', 'display: none !important;');
                UserCodeElement.setAttribute('style', 'display: block !important;');
                BtnSubmit.setAttribute('style', 'display: none !important;');
                BtnClose.setAttribute('style', 'display: block !important;');
                return;
            }
        
            BtnSubmit.innerHTML = 'Email niet gevonden!';
            BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
        });
    });
}

export { getAvailableEvents };