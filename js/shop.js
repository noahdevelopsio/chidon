/* --- CHIDON KITCHEN: SHOP JAVASCRIPT --- */

// This script handles shop page functionality like product loading, search, filtering, and cart management.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import firebaseConfig from './firebase-config.js';
import { WHATSAPP_NUMBER, CURRENCY_SYMBOL } from './config.js';

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
// Clean cart data to ensure valid numbers
cart = cart.filter(item => item && item.id).map(item => ({
    ...item,
    price: Number(item.price) || null,
    quantity: Number(item.quantity) || 1
}));


// Initialize shop
export async function initShop() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, "products"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(allProducts);
        populateCategoryFilter();
        updateCartDisplay();
    } catch (error) {
        console.error("Error loading products:", error);
        document.getElementById('product-grid').innerHTML = '<p class="text-center">Error loading products.</p>';
    }
}

// Render products
function renderProducts(products) {
    const productGrid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results-message');
    
    if (products.length === 0) {
        productGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    productGrid.innerHTML = '';
    
    products.forEach(product => {
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
                <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>

            </div>
        `;
        productGrid.appendChild(card);
    });


    requestAnimationFrame(() => {
        document.querySelectorAll('.product-card.fade-in').forEach(el => el.classList.add('is-visible'));
    });


}

// Populate category filter
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    const categories = [...new Set(allProducts.map(p => p.category).filter(c => c))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// Search and filter
function filterProducts() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filtered);
}

// Cart functions
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartDisplay();
}

function updateCartItem(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        if (item.quantity === 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Always show cart toggle
    cartToggle.style.display = 'flex';

    if (cart.length > 0) {
        cartCount.textContent = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }


    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemTotal = price * quantity;
        total += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.imageUrl || 'images/placeholder.jpg'}" alt="${item.name}" class="cart-item__image">
            <div class="cart-item__details">
                <h4>${item.name}</h4>
                <p>${price > 0 ? CURRENCY_SYMBOL + price.toFixed(2) : 'Price not set'} each</p>
                <div class="cart-item__controls">
                    <button class="qty-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                    <span class="qty">${quantity}</span>
                    <button class="qty-btn" data-action="increase" data-product-id="${item.id}">+</button>
                    <button class="remove-btn" data-product-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
        cartItems.appendChild(itemDiv);
    });


    cartTotal.textContent = `${CURRENCY_SYMBOL}${total.toFixed(2)}`;

    if (cart.length > 0) {
        checkoutBtn.style.display = 'block';
    } else {
        checkoutBtn.style.display = 'none';
    }

    // Add event listeners for cart controls
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const action = e.target.dataset.action;
            const item = cart.find(item => item.id === productId);
            if (action === 'increase') {
                updateCartItem(productId, (Number(item.quantity) || 0) + 1);
            } else if (action === 'decrease') {
                updateCartItem(productId, (Number(item.quantity) || 0) - 1);
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            removeFromCart(productId);
        });
    });
}


// WhatsApp checkout
function checkout() {
    if (cart.length === 0) return;

    let message = `Hello! I'd like to order the following items:\n\n`;
    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemTotal = price * quantity;
        total += itemTotal;
        message += `${item.name} (x${quantity}) - ${price > 0 ? CURRENCY_SYMBOL + itemTotal.toFixed(2) : 'Price not set'}\n`;
    });

    message += `\nTotal: ${CURRENCY_SYMBOL}${total.toFixed(2)}\n\nPlease confirm my order.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}





// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initShop();

    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const checkoutBtn = document.getElementById('checkout-btn');
    const productGrid = document.getElementById('product-grid');

    if (searchBar) {
        searchBar.addEventListener('input', filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    // Event delegation for add to cart buttons - using document to ensure it works
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            e.preventDefault();
            const productId = e.target.dataset.productId;
            addToCart(productId);
        }
    });





});
