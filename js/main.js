if (document.querySelector('.nav-list-active')) {
	document.title = 'Hoeve Lootens - ' + document.querySelector('.nav-list-active').innerHTML;
} else if (window.location.pathname === '/pages/shop.html') {
	document.title = 'Hoeve Lootens - Shop';
} else if (window.location.pathname === '/pages/volunteers.html') {
	document.title = 'Hoeve Lootens - Vrijwilligers';
}

// Update The Mobile Navigation
function updateMobileNav() {
	let navLink = document.querySelector('.nav-link-projects');

	if (mediaQuery.matches) {
		navLink.innerHTML = 'Projecten';
	} else {
		navLink.innerHTML = 'Steun Ons';
	}
}

// Create Media Query And Add Event Listener
let mediaQuery = window.matchMedia('(max-width: 450px)');
updateMobileNav();
window.addEventListener('resize', updateMobileNav);

// Add Event Listener To Logo
document.querySelector('.logo img').addEventListener('click', function () {
	window.location.href = '/index.html';
});
