let data = [];

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

postRequest('init', {Target: 'Events'}).then((res) => {
    if (res.status == 200) {
        data = JSON.parse(res.response);
        let shop = document.querySelector('.shop-container');

        Object.keys(data).forEach(function (key) {
            if (data[key]['Available Places'] > 0) {
                var card = document.createElement('div');

                if (data[key]['Type'] == 'Activity' || data[key]['Type'] == 'QR') {
                    card.innerHTML = `
                        <img src="` + data[key]['Image'] + `">
                        <div class="shop-card-header">
                            <h3>` + key + `</h3>
                            <h3>€` + data[key]['Price'] + `</h3>
                        </div>
                        <p class="status">` + data[key]['Date'] + `</p>
                        <a class="btn btn-primary btn-primary-sm btn-shop-add" data-value="` + key + `" data-target-modal="modal-signup">Schrijf in</a>
                    `;
                } else if (data[key]['Type'] == 'Food') {
                    card.innerHTML = `
                        <h3>` + key + `</h3>
                        <a class="btn btn-secondary btn-secondary-sm btn-shop-food" href="/pages/form.html">Schrijf in</a>
                    `;
                }
                
                card.classList.add('shop-card');
                shop.appendChild(card);
            }
        });

        document.querySelectorAll('.btn-shop-add').forEach((el) => {
            el.addEventListener('click', (e) => {
                let target = e.target.getAttribute('data-target-modal');
                let modal = document.getElementById(target);
                let closeTrough = modal.getAttribute('close-trough') || null;

                modal.querySelector('.modal-title').innerHTML = e.target.getAttribute('data-value');
                modal.querySelector('.shop-image').setAttribute('src', data[e.target.getAttribute('data-value')]['Image']);
                modal.querySelector('.shop-price').innerHTML = '€' + data[e.target.getAttribute('data-value')]['Price'] + '/pp';
                modal.querySelector('.shop-title').innerHTML = e.target.getAttribute('data-value');
                modal.querySelector('.shop-date').innerHTML = data[e.target.getAttribute('data-value')]['Date'];
                modal.querySelector('.shop-description').innerHTML = data[e.target.getAttribute('data-value')]['Description'];
                modal.querySelector('.shop-input[name="Personen"]').setAttribute('max', data[e.target.getAttribute('data-value')]['Available Places']);
                modal.querySelector('.shop-input[name="Personen"]').setAttribute('data-value', e.target.getAttribute('data-value'));
                modal.querySelector('.btn-shop-submit').setAttribute('data-value', e.target.getAttribute('data-value'));
        
                modal.querySelector('.shop-input[name="Personen"]').addEventListener('keyup', (e) => {
                    modal.querySelector('.shop-total').innerHTML = '€' + (e.target.value * data[e.target.getAttribute('data-value')]['Price']);
                });

                modal.classList.add('modal-open');

                e.stopPropagation();
                if (closeTrough !== null) {
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
        
        document.querySelectorAll('.modal-close').forEach((el) => {
            el.addEventListener('click', (e) => {
                let modal = e.target.closest('.modal');
        
                modal.classList.remove('modal-open');
            });
        });
    }
});

document.querySelector('.btn-shop-submit').addEventListener('click', async function () {
    postRequest('init', {Target: 'Events'}).then((res) => {
        if (res.status == 200) {
            let dataEvent = JSON.parse(res.response)[document.querySelector('.btn-shop-submit').getAttribute('data-value')];
            
            var form = document.querySelector('.shop-form');
            var EventName = document.querySelector('.btn-shop-submit').getAttribute('data-value');
            var BtnAdd = document.querySelector('.btn-shop-submit');
            var FirstName = form.querySelector('[name="Voornaam"]').value;
            var LastName = form.querySelector('[name="Achternaam"]').value;
            var Email = form.querySelector('[name="Email"]').value;
            var Phone = form.querySelector('[name="Telefoonnummer"]').value;
            var Amount = form.querySelector('[name="Personen"]').value;
            var Address = form.querySelector('[name="Adres"]').value;

            BtnAdd.innerHTML = 'Bezig met inschrijven...';

            if (dataEvent['Available Places'] <= 0) {
                BtnAdd.innerHTML = 'Geen plaatsen meer beschikbaar!';
                BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                return;
            }

            if (FirstName == "" || LastName == "" || Email == "" || Phone == "" || Amount == "") {
                BtnAdd.innerHTML = 'Vul alle velden in!';
                BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                return;
            }

            var data = {
                'FirstName': FirstName,
                'LastName': LastName,
                'Email': Email,
                'Phone': Phone,
                'Quantity': Amount,
                'Address': Address,
                'Amount': dataEvent['Price'] * Amount,
            };

            var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);
            UserCode = UserCode.toUpperCase();
            data['UserCode'] = UserCode;

            putRequest('set', {Event: EventName, Data: data}).then((res) => {
                if (res.status === 200) {
                    document.querySelector('.shop-form').style.display = 'none';
                    document.querySelector('.shop-info').style.display = 'none';
                    document.querySelector('.btn-shop-submit').style.display = 'none';
                    document.querySelector('.shop-success-methods').style.display = 'block';

                    document.querySelectorAll('.btn-shop-method').forEach((el) => {
                        el.addEventListener('click', (e) => {
                            let method = e.target.getAttribute('data-method');

                            document.querySelector('.shop-success-methods').style.display = 'none';
                            document.querySelector('.shop-success-' + method).style.display = 'block';

                            if (method == 'overschrijving') {
                                document.querySelector('.shop-success-overschrijving-price').innerHTML = '€' + dataEvent['Price'] * Amount;
                                document.querySelector('.shop-success-overschrijving-code').innerHTML = UserCode;
                            } else if (method == 'payconiq') {
                                postRequest('payconiq', {Amount: dataEvent['Price'] * Amount, UserCode: UserCode, Event: EventName}).then((res) => {
                                    if (res.status == 200) {
                                        let links = JSON.parse(res.response);
                                        let qrcodeImg = document.querySelector('.shop-success-payconiq-qr');
                                        let phoneLink = document.querySelector('.shop-success-payconiq-mobile');
                                
                                        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                                            window.open(links['deeplink'], '_blank');
                                        }
                                        
                                        qrcodeImg.src = links['qr'];
                                        phoneLink.href = links['deeplink'];

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
                } else {
                    BtnAdd.innerHTML = 'Er is iets misgegaan!';
                    BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
                }
            });
        }
    });
});