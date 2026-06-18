if (document.querySelector('.nav-list-active')) {
	document.title = 'Hoeve Lootens - ' + document.querySelector('.nav-list-active').innerHTML;
} else if (window.location.pathname === '/shop/' || window.location.pathname === '/shop/index.html' || window.location.pathname === '/shop') {
	document.title = 'Hoeve Lootens - Shop';
} else if (window.location.pathname === '/medewerkers/' || window.location.pathname === '/medewerkers/index.html' || window.location.pathname === '/medewerkers') {
	document.title = 'Hoeve Lootens - Vrijwilligers';
}

// Add Event Listener To Logo
document.querySelector('.logo img').addEventListener('click', function () {
	window.location.href = '/';
});
