// GENERAL FUNCTIONS

// Update The Mobile Navigation
function updateMobileNav() {
    let navLink = document.querySelector('.nav-link-projects');

    if (mediaQuery.matches) {
        navLink.innerHTML = 'Projecten';
    } else {
        navLink.innerHTML = 'Maatschappelijke Projecten';
    }
}

// Create Media Query And Add Event Listener
let mediaQuery = window.matchMedia('(max-width: 450px)');
updateMobileNav();
window.addEventListener('resize', updateMobileNav);

// Add Event Listener To Logo
document.querySelector('.logo img').addEventListener('click', function() {
    window.location.href = '/index.html';
});