/* --- CHIDON KITCHEN: MAIN JAVASCRIPT --- */

// This script handles sitewide functionality like navigation, animations, and footer updates.

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Feather Icons
    feather.replace();

    // 2. Mobile Navigation Toggle
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    if (mobileNavToggle && navbarMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('is-open'); // CORRECTED: Was 'is-active'
            // Change icon to 'x' when menu is open
            const icon = mobileNavToggle.querySelector('i');
            if (navbarMenu.classList.contains('is-open')) { // CORRECTED: Was 'is-active'
                icon.setAttribute('data-feather', 'x');
            } else {
                icon.setAttribute('data-feather', 'menu');
            }
            feather.replace(); // Re-render the icon
        });
    }

    // 3. Dynamic Copyright Year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 4. Smooth Fade-in Animation on Scroll
    const animatedElements = document.querySelectorAll('.fade-in');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: unobserve after animation to save resources
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // 5. Active Nav Link Highlighter
    const navLinks = document.querySelectorAll('.main-nav__link, .bottom-nav__item a'); // CORRECTED: Was '.nav-link'
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        
        // Remove active class from all links first
        link.classList.remove('active');

        // Add active class to the matching link
        if ((currentPage === '' || currentPage === 'index.html') && linkPage === 'index.html') {
            link.classList.add('active');
        } else if (linkPage !== 'index.html' && window.location.pathname.includes(link.getAttribute('href'))) {
             link.classList.add('active');
        }
    });
});
