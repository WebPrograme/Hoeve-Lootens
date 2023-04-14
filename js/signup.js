function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function getRequest(target) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://hoeve-lootens-email.onrender.com/api/' + target, true);
        xhr.send();
        xhr.onload = function () {
            resolve(this.response);
        }
    });
}

function postRequest(target, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://hoeve-lootens-email.onrender.com/api/' + target, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onload = function () {
            resolve(this.response);
        }
    });
}

function createPayment(UserCode, Amount) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://hoeve-lootens-email.onrender.com/api/payconiq', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            "Amount": Amount,
            "Ref": UserCode
        }));
        xhr.onload = function () {
            let data = JSON.parse(this.response);
            resolve(data);
        }
    });
}

function showSuccess(UserCode) {
    document.querySelector('.UserCodeResult').innerHTML = UserCode;
    document.querySelector('.form-signup').style.display = 'none';
    document.querySelector('.signup-subheader').style.display = 'none';
    document.querySelector('.UserCodeResult').style.display = 'block';
    document.querySelector('.form-success').style.display = 'block';
    
    window.scrollTo(0, 0);
}

document.querySelector('.btn-submit').addEventListener('click', async function () {
    var BtnSubmit = document.querySelector('.btn-submit');
    BtnSubmit.innerHTML = 'Verzenden...';
    
    const form = document.querySelector('.form-signup')
    var FirstName = form.querySelector('[title="firstname"]').value;
    var LastName = form.querySelector('[title="lastname"]').value;
    var Email = form.querySelector('[title="email"]').value;
    var Phone = form.querySelector('[title="phone"]').value;
    var Address = form.querySelector('[title="address"]').value;
    var FoodInputs = form.querySelectorAll('.signup-food');
    var FoodPrices = []
    var FoodValues = {};
    var Amount = 0;
    
    for (var i = 0; i < FoodInputs.length; i++) {
        FoodPrices.push(parseInt(FoodInputs[i].getAttribute('data-price')));
    }

    for (var i = 0; i < FoodInputs.length; i++) {
        FoodValues[FoodInputs[i].getAttribute('title')] = parseInt(FoodInputs[i].value) || 0;
        Amount += (parseInt(FoodInputs[i].value) * FoodPrices[i]) || 0;
    }
    
    if (FirstName == '' || LastName == '' || Email == '' || Phone == '' || Address == '') {
        BtnSubmit.innerHTML = 'Vul alle velden in!';
        BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        return;
    }
    
    var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(10000, 99999);
    var data = {'First Name': FirstName, 'Last Name': LastName, 'Email': Email, 'Phone': Phone, 'Address': Address, 'UserCode': UserCode};

    for (var key in FoodValues) {
        data[key] = FoodValues[key];
    }

    data['Amount'] = Amount;

    postRequest('signup', data)
    .then((response) => {
        if (response == 'success') {
            showSuccess(UserCode);
        } else {
            BtnSubmit.innerHTML = 'Er is iets fout gegaan!';
            BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;')
        }
    });


    document.querySelector('.payconiq-img img').addEventListener('click', async function () {
        document.querySelector('.payconiq-price').innerHTML = '€' + Amount;

        let links = await createPayment(UserCode, Amount);
        let qrcodeImg = document.querySelector('.payconiq-qrcode');
        let phoneLink = document.querySelector('.payconiq-link');

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            window.open(links['deeplink'], '_blank');
        }
        
        qrcodeImg.src = links['qr'];
        phoneLink.href = links['deeplink'];

        setTimeout(function () {
            console.log('test');
        }, 1200000);
    });
});

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
    
    getRequest('signup/users?email=' + Email).then((response) => {
        if (response != 'User not found!' && response != '{}') {
            UserCodeElement.innerHTML = response;

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

    getRequest('signup/users?email=' + Email).then((response) => {
        if (response != 'User not found!' && response != '{}') {
            UserCode = response;
            
            postRequest('signup/get', {'UserCode': UserCode}).then(async (response) => {
                if (response != 'User not found!' && response != '{}') {
                    response = JSON.parse(response);

                    if (response['Pay'] !== undefined) {
                        BtnSubmit.innerHTML = 'U heeft al betaald!';
                        BtnSubmit.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                        return;
                    }

                    let links = await createPayment(UserCode, response['Amount']);
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