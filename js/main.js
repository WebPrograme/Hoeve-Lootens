function updateMobileNav() {
    let navLink = document.querySelector('.nav-link-projects');

    if (mediaQuery.matches) {
        navLink.innerHTML = 'Projecten';
    } else {
        navLink.innerHTML = 'Maatschappelijke Projecten';
    }
}

let mediaQuery = window.matchMedia('(max-width: 400px)');
updateMobileNav();
window.addEventListener('resize', updateMobileNav);