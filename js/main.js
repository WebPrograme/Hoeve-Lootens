if (document.querySelector('.nav-list-active')) {
	document.title = 'Hoeve Lootens - ' + document.querySelector('.nav-list-active').innerHTML;
} else if (window.location.pathname === '/pages/shop.html') {
	document.title = 'Hoeve Lootens - Shop';
} else if (window.location.pathname === '/pages/volunteers.html') {
	document.title = 'Hoeve Lootens - Vrijwilligers';
}

// Add Event Listener To Logo
document.querySelector('.logo img').addEventListener('click', function () {
	window.location.href = '/index.html';
});
