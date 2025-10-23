/* --- CHIDON KITCHEN: MAIN JAVASCRIPT --- */

// This script handles sitewide functionality like navigation, animations, and footer updates.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import firebaseConfig from './firebase-config.js';
import { CURRENCY_SYMBOL } from './config.js';


document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase app once
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // 1. Initialize Feather Icons
    feather.replace();

    // Load featured products if on homepage
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
                            <p class="product-card__price">${product.price ? CURRENCY_SYMBOL + Number(product.price).toFixed(2) : 'Price on request'}</p>
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


    // 2. Mobile Navigation Toggle
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

    // 5. Active Nav Link Highlighter
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

    // 6. Cart Toggle Functionality
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', () => {
            cartModal.style.display = 'flex';
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    // 7. Auth Listener for Admin Link
    onAuthStateChanged(auth, (user) => {
        const navMenu = document.getElementById('navbar-menu');
        if (user) {
            // Add admin link if not exists
            if (!document.querySelector('.main-nav__link[href="admin.html"]')) {
                const adminLi = document.createElement('li');
                adminLi.innerHTML = '<a href="admin.html" class="main-nav__link">Admin</a>';
                navMenu.appendChild(adminLi);
            }
        } else {
            // Remove admin link if exists
            const adminLink = document.querySelector('.main-nav__link[href="admin.html"]');
            if (adminLink) {
                adminLink.parentElement.remove();
            }
        }
    });

});
