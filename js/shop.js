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

getRequest('events/init').then((res) => {
    data = JSON.parse(res);
    
    var cards = document.querySelector('.cards');

    for (var i in data) {
        if (data[i]['Available Places'] > 0 && data[i]['Available']) {
            var card = document.createElement('div');
            card.classList.add('shop-card');
            card.innerHTML = `
                <img src="../images/` + data[i]['Image'] + `">
                <div class="shop-card-header">
                    <h3>` + i + `</h3>
                    <h3>€` + data[i]['Price'] + `</h3>
                </div>
                <p class="status">` + data[i]['Date'] + `</p>
                <a class="btn btn-main btn-main-sm btn-shop-add" data-value="` + i + `">Schrijf in</a>
            `;

            cards.appendChild(card);
        }
    }

    document.querySelectorAll('.btn-shop-add').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const EventName = e.target.getAttribute('data-value');

            for (var i in data) {
                if (i == EventName) {
                    var modal = document.querySelector('#shopBuyModal');
                    document.querySelector('.choosen-item-name').innerHTML = i;
                    document.querySelector('.choosen-item-price').innerHTML = "€" + data[i]['Price'];
                    document.querySelector('.choosen-item-date').innerHTML = data[i]['Date'];
                    document.querySelector('.form-shop [title="amount"]').setAttribute('max', data[i]['Available Places'])
                    document.querySelector('.btn-shop-confirm').setAttribute('data-value', i)
                }
            }

            $('#shopBuyModal').modal('show');
        });
    });
});

document.querySelector('.btn-shop-confirm').addEventListener('click', async function () {    
    var form = document.querySelector('.form-shop');
    var EventName = document.querySelector('.btn-shop-confirm').getAttribute('data-value');
    var BtnAdd = document.querySelector('.btn-shop-confirm');
    var FirstName = form.querySelector('[title="firstname"]').value;
    var LastName = form.querySelector('[title="lastname"]').value;
    var Email = form.querySelector('[title="email"]').value;
    var Phone = form.querySelector('[title="phone"]').value;
    var Amount = form.querySelector('[title="amount"]').value;
    var Address = form.querySelector('[title="address"]').value;

    BtnAdd.innerHTML = 'Bezig met inschrijven...';

    if (FirstName == "" || LastName == "" || Email == "" || Phone == "" || Amount == "") {
        BtnAdd.innerHTML = 'Vul alle velden in!';
        BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
        return;
    }

    var UserCode = FirstName[0] + LastName[0] + getRandomIntInclusive(data, 1000, 9999);

    postRequest('events/set', {
        'First Name': FirstName,
        'Last Name': LastName,
        'Email': Email,
        'Phone': Phone,
        'Address': Address,
        'Amount': Amount,
        'Scannedtimes': 0,
        'Event': EventName,
        'UserCode': UserCode
    }).then((res) => {
        if (res == 'User already exists!') {
            BtnAdd.innerHTML = 'Er is al iemand ingeschreven met deze code!';
            BtnAdd.setAttribute('style', 'background-color: rgb(211, 115, 89) !important;');
            return;
        } else if (res == 'User added!') {
            showSuccess(UserCode);

            BtnAdd.innerHTML = 'Inschrijven';
        }
    });
});

document.querySelector('.btn-submit-email').addEventListener('click', async function () {
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
    
    BtnSubmit.innerHTML = 'Bezig met zoeken...';

    getRequest('events/init').then((res) => {
        data = JSON.parse(res);

        for (var i in data) {
            for (var j in data[i]['Participants']) {
                if (data[i]['Participants'][j]['Email'] == Email) {
                    SignedUpEvents.push(i);
                    SignedUpCodes.push(j);
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
});

document.querySelector('.btn-shop-close').addEventListener('click', function () {
    document.querySelector('.form-shop').style.display = 'block';
    document.querySelector('.choosen-item').style.display = 'flex';
    document.querySelector('.UserCodeResult').style.display = 'none';
    document.querySelector('.form-success').style.display = 'none';
    document.querySelector('.btn-shop-confirm').setAttribute('style', 'display: block !important');
    document.querySelector('.btn-shop-close').setAttribute('style', 'display: none !important');
});

$('#shopBuyModal').on("hidden.bs.modal", function () {
    var BtnAdd = document.querySelector('.btn-shop-confirm');
    BtnAdd.innerHTML = 'Inschrijven';

    document.querySelectorAll('.form-shop input').forEach(function (input) {
        input.value = '';
    });
    
    document.querySelector('.form-shop').style.display = 'block';
    document.querySelector('.choosen-item').style.display = 'flex';
    document.querySelector('.UserCodeResult').style.display = 'none';
    document.querySelector('.form-success').style.display = 'none';
    document.querySelector('.btn-shop-confirm').setAttribute('style', 'display: block !important');
    document.querySelector('.btn-shop-close').setAttribute('style', 'display: none !important');
});

window.onload = function () {
    document.querySelector('.loader').style.display = 'none';
}