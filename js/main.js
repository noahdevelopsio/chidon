/* --- CHIDON KITCHEN: MAIN JAVASCRIPT --- */

// This script handles sitewide functionality like navigation, animations, footer updates, cart, and auth.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import firebaseConfig from './firebase-config.js';
import { CURRENCY_SYMBOL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // 1. Initialize Feather Icons
    feather.replace();

    // 2. Load featured products if on homepage
    const featuredProductsContainer = document.getElementById('featured-products');
    if (featuredProductsContainer) {
        try {
            const q = query(collection(db, "products"), where("featured", "==", true));
            const querySnapshot = await getDocs(q);
            let featuredProducts = [];
            querySnapshot.forEach((doc) => {
                featuredProducts.push({ id: doc.id, ...doc.data() });
            });
            featuredProductsContainer.innerHTML = '';
            if (featuredProducts.length > 0) {
                featuredProducts.slice(0, 4).forEach(product => {
                    const card = document.createElement('article');
                    card.className = 'product-card fade-in';
                    card.innerHTML = `
                        <div class="product-card__image-container">
                            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" class="product-card__image" loading="lazy">
                        </div>
                        <div class="product-card__body">
                            <h3 class="product-card__title">${product.name}</h3>
                            <p class="product-card__description">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                            <p class="product-card__price">${CURRENCY_SYMBOL}${Number(product.price).toFixed(2)}</p>
                            ${product.category ? `<div class="product-card__tags"><span class="product-card__tag">${product.category}</span></div>` : ''}
                        </div>
                    `;
                    featuredProductsContainer.appendChild(card);
                });
                requestAnimationFrame(() => {
                    document.querySelectorAll('.product-card.fade-in', featuredProductsContainer).forEach(el => el.classList.add('is-visible'));
                });
            } else {
                featuredProductsContainer.innerHTML = '<p class="text-center">No featured products available at the moment.</p>';
            }
        } catch (error) {
            console.error("Error loading featured products:", error);
            featuredProductsContainer.innerHTML = '<p class="text-center">Error loading featured products.</p>';
        }
    }

    // 3. Mobile Navigation Toggle
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navbarMenu = document.getElementById('navbar-menu');

    if (mobileNavToggle && navbarMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('is-open');
            const icon = mobileNavToggle.querySelector('i');
            if (navbarMenu.classList.contains('is-open')) {
                icon.setAttribute('data-feather', 'x');
            } else {
                icon.setAttribute('data-feather', 'menu');
            }
            feather.replace();
        });
    }

    // 4. Dynamic Copyright Year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 5. Smooth Fade-in Animation on Scroll
    const animatedElements = document.querySelectorAll('.fade-in');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // 6. Active Nav Link Highlighter
    const navLinks = document.querySelectorAll('.main-nav__link, .bottom-nav__item a');
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        link.classList.remove('active');
        if ((currentPage === '' || currentPage === 'index.html') && linkPage === 'index.html') {
            link.classList.add('active');
        } else if (linkPage !== 'index.html' && window.location.pathname.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // 7. Cart Toggle (only on shop page)
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');

    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', () => {
            cartModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });

        const closeCart = () => {
            cartModal.style.display = 'none';
            document.body.style.overflow = '';
        };

        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartModal.style.display === 'block') {
                closeCart();
            }
        });
    }

    // 8. Auth Listener for Admin Link
    const navbarMenu = document.getElementById('navbar-menu');
    if (navbarMenu) {
        onAuthStateChanged(auth, (user) => {
            const existingAdminLink = navbarMenu.querySelector('.admin-link');
            if (existingAdminLink) {
                existingAdminLink.remove();
            }
            if (user) {
                const adminLink = document.createElement('li');
                adminLink.innerHTML = '<a href="admin.html" class="main-nav__link admin-link">Admin</a>';
                navbarMenu.appendChild(adminLink);
            }
        });
    }
});
