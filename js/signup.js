// UPDATED VERSION - NOT IN USE

// Create User Code
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
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

// Create Payconiq Payment
function createPayment(UserCode, Amount, Event) {
    return new Promise((resolve, reject) => {
        postRequest('payconiq', {"Amount": Amount, "Ref": UserCode, "Event": Event}).then((res) => {
            let data = JSON.parse(res.response);

            resolve(data);
        });
    });
}

// Show Success
function showSuccess(UserCode) {
    document.querySelector('.UserCodeResult').innerHTML = UserCode;
    document.querySelector('.form-signup').style.display = 'none';
    document.querySelector('.signup-subheader').style.display = 'none';
    document.querySelector('.UserCodeResult').style.display = 'block';
    document.querySelector('.form-success').style.display = 'block';
    
    window.scrollTo(0, 0);
}

// Get All Events
postRequest('init/public', {}).then((res) => {
    if (res.status == 200) {
        let events = JSON.parse(res.response);
        let data = [];
        let eventName;

        // Get ONLY Food Event
        Object.keys(events).forEach(function (key) {
            if (events[key]['Type'] == 'Food') {
                data = events[key];
                eventName = key;
                return;
            }
        });

        // Check if Event is Available
        if (data.length == 0) return;

        // Check if Event is Available
        if (data['Available Places'] == 0) {
            document.querySelector('.signup-count').innerHTML = 'Volzet!';
            document.querySelector('.btn-submit').innerHTML = 'Volzet!';
            document.querySelector('.btn-submit').setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        } else {
            document.querySelector('.signup-count').innerHTML = data['Available Places'] + ' Plaatsen Over';
        }

        document.querySelector('.signup-header').innerHTML = data['Name'];
        document.querySelector('.signup-description').innerHTML = data['Description'];
        document.querySelector('.btn-submit').setAttribute('data-name', data['Name']);

        // Create Options (Food & Prices)
        Object.keys(data['Options']).forEach(function (key) {
            let option = document.createElement('p');
            option.innerHTML = '<span>' + key + '</span> <span class="label-discription">€' + data['Options'][key] + '</span>';

            let input = document.createElement('input');
            input.setAttribute('type', 'number');
            input.setAttribute('data-price', data['Options'][key]);
            input.setAttribute('title', key);
            input.setAttribute('placeholder', 'Aantal personen');
            input.setAttribute('min', '0');
            input.classList.add('form-control', 'signup-input');
            
            document.querySelector('.form-signup').insertBefore(option, document.querySelector('.form-signup').querySelector('.form-footer'));
            document.querySelector('.form-signup').insertBefore(input, document.querySelector('.form-signup').querySelector('.form-footer'));
        });

        // Submit Form
        document.querySelector('.btn-submit').addEventListener('click', async function (e) {
            // Get All Events
            postRequest('init/public', {}).then((res) => {
                if (res.status == 200) {
                    let places = JSON.parse(res.response)[e.target.getAttribute('data-name')]['Available Places'];

                    // Check if Event is Available
                    if (places == 0) {
                        document.querySelector('.signup-count').innerHTML = 'Volzet!';
                        document.querySelector('.btn-submit').innerHTML = 'Volzet!';
                        document.querySelector('.btn-submit').setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
                    } else {
                        var BtnSubmit = document.querySelector('.btn-submit');
                        BtnSubmit.innerHTML = 'Verzenden...';
                        
                        // Get Form Data
                        const form = document.querySelector('.form-signup')
                        var FirstName = form.querySelector('[title="firstname"]').value;
                        var LastName = form.querySelector('[title="lastname"]').value;
                        var Email = form.querySelector('[title="email"]').value;
                        var Phone = form.querySelector('[title="phone"]').value;
                        var Address = form.querySelector('[title="address"]').value;
                        var FoodInputs = form.querySelectorAll('.signup-input');
                        var FoodPrices = []
                        var FoodValues = {};
                        var Amount = 0;
                        var Quantity = 0;
                        
                        // Get Food Prices
                        for (var i = 0; i < FoodInputs.length; i++) {
                            FoodPrices.push(parseInt(FoodInputs[i].getAttribute('data-price')));
                        }

                        // Get Choosen Food Values & Amount
                        for (var i = 0; i < FoodInputs.length; i++) {
                            FoodValues[FoodInputs[i].getAttribute('title')] = parseInt(FoodInputs[i].value) || 0;
                            Amount += (parseInt(FoodInputs[i].value) * FoodPrices[i]) || 0;
                            Quantity += parseInt(FoodInputs[i].value) || 0;
                        }
                        
                        // Check if Form is Valid
                        if (FirstName == '' || LastName == '' || Email == '' || Phone == '' || Address == '') {
                            BtnSubmit.innerHTML = 'Vul alle velden in!';
                            BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
                            return;
                        }
                        
                        // Create User Code
                        var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(10000, 99999);
                        UserCode = UserCode.toUpperCase();

                        // Create Data Object
                        var data = {'FirstName': FirstName, 'LastName': LastName, 'Email': Email, 'Phone': Phone, 'Address': Address, 'UserCode': UserCode};

                        // Add Food Values to Data Object
                        for (var key in FoodValues) {
                            data[key] = FoodValues[key];
                        }

                        data['Amount'] = Amount; // Add Amount to Data Object
                        data['Quantity'] = Quantity; // Add Quantity to Data Object

                        // Add User to Database
                        putRequest('set', {Data: data, Event: e.target.getAttribute('data-name')})
                        .then((response) => {
                            if (response.response == 'success') {
                                // Show Success Message
                                showSuccess(UserCode);
                            } else {
                                BtnSubmit.innerHTML = 'Er is iets fout gegaan!';
                                BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
                            }
                        });

                        // Show Payconiq if Choosen
                        document.querySelector('.payconiq-img img').addEventListener('click', async function () {
                            document.querySelector('.payconiq-price').innerHTML = '€' + Amount;

                            // Create Payment
                            let links = await createPayment(UserCode, Amount, eventName);
                            let qrcodeImg = document.querySelector('.payconiq-qrcode');
                            let phoneLink = document.querySelector('.payconiq-link');

                            // Open Payconiq App if Mobile
                            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                                window.open(links['deeplink'], '_blank');
                            }
                            
                            qrcodeImg.src = links['qr'];
                            phoneLink.href = links['deeplink'];
                        });
                    }
                }
            });
        });

        // Get User Code from Email
        document.querySelector('.btn-submit-email').addEventListener('click', async function () {
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
            
            getRequest('get/email?email=' + Email + '&event=' + eventName).then((response) => {
                if (response.response != 'User not found!' && response.response != '{}') {
                    UserCodeElement.innerHTML = response.response;

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

        // Create Payconiq from User Code
        document.querySelector('.btn-submit-email-code').addEventListener('click', async function () {
            const formEmail = document.querySelector('.form-email-to-code');
            var BtnSubmit = document.querySelector('.btn-submit-email-code');
            var Email = formEmail.querySelector('[title="email"]').value.trim().toLowerCase();
            var UserCode;

            if (Email == '') {
                BtnSubmit.innerHTML = 'Vul alle velden in!';
                BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
                return;
            }

            getRequest('get/email?email=' + Email + '&event=' + eventName).then((response) => {
                if (response != 'User not found!' && response != '{}') {
                    UserCode = response;
                    
                    postRequest('get/usercode', {'UserCode': UserCode}).then(async (response) => {
                        if (response.response != 'User not found!' && response.response != '{}') {
                            response = JSON.parse(response.response);

                            if (response['Pay'] !== undefined) {
                                BtnSubmit.innerHTML = 'U heeft al betaald!';
                                BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                                return;
                            }

                            let links = await createPayment(UserCode, response['Amount'], eventName);
                            let qrcodeImg = document.querySelector('.payconiq-qrcode');
                            let phoneLink = document.querySelector('.payconiq-link');
                    
                            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                                window.open(links['deeplink'], '_blank');
                            }
                            
                            qrcodeImg.src = links['qr'];
                            phoneLink.href = links['deeplink'];

                            document.querySelector('.btn-close-email-code').click();
                            return;
                        }
                    });
                    return;
                }
            
                BtnSubmit.innerHTML = 'Email niet gevonden!';
                BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
            });
        });

        document.querySelector('.btn-close-email').addEventListener('click', function () {
            document.querySelector('.UserCode').style.display = 'none';
            document.querySelector('.btn-close-email').style.display = 'none';
            document.querySelector('.btn-submit-email').style.display = 'block';
            document.querySelector('.form-check-code').querySelector('[title="email"]').style.display = 'block';
        });

        // Update Total Price on Change
        document.querySelectorAll('.form-signup .form-control[type=number]').forEach(function (element) {
            function updateValue() {
                var total = 0;
                var inputFields = document.querySelectorAll('.form-signup .form-control[type=number]');
                
                for (var i = 0; i < inputFields.length; i++) {
                    if (inputFields[i].value != '') {
                        total += parseFloat(inputFields[i].getAttribute('data-price')) * parseFloat(inputFields[i].value);
                    }
                }

                document.querySelector('.form-total').innerHTML = '€' + total;
            }

            element.addEventListener('change', updateValue);
            element.addEventListener('keyup', updateValue);
        });
    }
});