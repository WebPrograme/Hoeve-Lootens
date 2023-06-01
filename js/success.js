// FILE IN PROGRESS - NOT READY FOR PRODUCTION

// GET Request
function getRequest(target) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8081/v2/' + target, true);
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
        xhr.open('POST', 'http://localhost:8081/api/v2/' + target, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onload = function () {
            resolve(this);
        }
    });
}

// Get Usercode and Event from URL
let usercode = window.location.search.split('=')[1].split('&')[0];
let event = window.location.search.split('=')[2];

// Verify Payment
postRequest('payconiq/verify', { UserCode: usercode, Event: event }).then((res) => {
    if (res.status == 200) {
        let response = JSON.parse(res.responseText);
        if (!response['pay']) {
            window.location.href = '/index.html';
        }
    } else {
        window.location.href = '/index.html';
    }
}).catch((err) => {
    window.location.href = '/index.html';
});