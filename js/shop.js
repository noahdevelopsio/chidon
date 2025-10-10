/* --- CHIDON KITCHEN: SHOP JAVASCRIPT --- */

// This script manages the functionality of the shop page, including
// fetching products from Firestore, filtering, searching, and cart management.

import { WHATSAPP_NUMBER, CURRENCY_SYMBOL } from './config.js';

/**
 * Initializes the shop functionality.
 * @param {object} db - The Firestore database instance.
 */
export function initShop(db) {
    const productGrid = document.getElementById('product-grid');
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const noResultsMessage = document.getElementById('no-results-message');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCountEl = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartModal = document.getElementById('cart-modal');

    let allProducts = []; // To store the master list of products
    let cart = JSON.parse(localStorage.getItem('chidon-cart')) || []; // Load cart from localStorage

    // Update cart count badge
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
            cartCountEl.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // Add to cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('chidon-cart', JSON.stringify(cart));
        updateCartCount();
        // Optional: Show toast notification
        showToast('Product added to cart!');
    }

    // Update cart quantity
    function updateCartQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                localStorage.setItem('chidon-cart', JSON.stringify(cart));
                updateCartCount();
                renderCart();
            }
        }
    }

    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('chidon-cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }

    // Get cart total
    function getCartTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Render cart items in modal
    function renderCart() {
        if (cartItemsEl) {
            cartItemsEl.innerHTML = '';
            if (cart.length === 0) {
                cartItemsEl.innerHTML = '<p class="text-center">Your cart is empty.</p>';
                cartTotalEl.textContent = `${CURRENCY_SYMBOL}0`;
                checkoutBtn.style.display = 'none';
            } else {
                cart.forEach(item => {
                    const cartItemEl = document.createElement('div');
                    cartItemEl.className = 'cart-item';
                    cartItemEl.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.imageUrl || 'images/placeholder.jpg'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>${CURRENCY_SYMBOL}${Number(item.price).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-quantity">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" class="qty-btn">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" class="qty-btn">+</button>
                        </div>
                        <div class="cart-item-total">
                            <p>${CURRENCY_SYMBOL}${Number(item.price * item.quantity).toFixed(2)}</p>
                            <button onclick="removeFromCart('${item.id}')" class="btn-remove">Remove</button>
                        </div>
                    `;
                    cartItemsEl.appendChild(cartItemEl);
                });
                const total = getCartTotal();
                cartTotalEl.textContent = `${CURRENCY_SYMBOL}${total.toFixed(2)}`;
                checkoutBtn.style.display = 'block';
            }
        }
    }

    // Build WhatsApp checkout message
    function buildWhatsAppMessage() {
        if (cart.length === 0) return '';
        let message = 'Hi! I\'d like to place an order:\n\n';
        cart.forEach(item => {
            message += `${item.name} x${item.quantity} - ${CURRENCY_SYMBOL}${Number(item.price * item.quantity).toFixed(2)}\n`;
        });
        message += `\nTotal: ${CURRENCY_SYMBOL}${getCartTotal().toFixed(2)}\n\nPlease confirm availability and delivery details.`;
        return encodeURIComponent(message);
    }

    // Checkout on WhatsApp
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const message = buildWhatsAppMessage();
            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
            window.open(url, '_blank');
        });
    }

    // Listen for cart modal open to render cart
    if (cartModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (cartModal.style.display === 'block') {
                        renderCart();
                    }
                }
            });
        });
        observer.observe(cartModal, { attributes: true });
    }

    // Expose cart functions globally for onclick handlers
    window.updateCartQuantity = updateCartQuantity;
    window.removeFromCart = removeFromCart;

    /**
     * Fetches products from the Firestore 'products' collection.
     */
    async function fetchProducts() {
        if (!db) {
            console.error("Firestore database instance is not available.");
            displayMessage("Could not connect to the database. Please check the console.", true);
            return;
        }

        productGrid.innerHTML = ''; // Clear existing products

        try {
            const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
            const querySnapshot = await getDocs(collection(db, "products"));
            
            allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (allProducts.length > 0) {
                populateCategories(allProducts);
                renderProducts(allProducts);
            } else {
                displayMessage("No products found. The shop is currently empty.");
            }
        } catch (error) {
            console.error("Error fetching products: ", error);
            displayMessage("There was an error loading products. Please try again later.", true);
        }
    }

    /**
     * Renders an array of product objects to the product grid.
     * @param {Array<object>} products - The products to render.
     */
    function renderProducts(products) {
        productGrid.innerHTML = ''; // Clear previous results
        noResultsMessage.style.display = 'none';

        if (products.length === 0) {
            displayMessage("No products match your search.");
            return;
        }

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
                    <p class="product-card__price">${CURRENCY_SYMBOL}${Number(product.price).toFixed(2)}</p>
                    ${product.category ? `<div class="product-card__tags"><span class="product-card__tag">${product.category}</span></div>` : ''}
                    <div class="product-card__footer">
                        <button onclick="addToCart(${JSON.stringify(product)})" class="btn btn-primary">Add to Cart</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            document.querySelectorAll('.product-card.fade-in').forEach(el => el.classList.add('is-visible'));
        });
    }

    /**
     * Populates the category filter dropdown from the list of products.
     * @param {Array<object>} products - All products from the database.
     */
    function populateCategories(products) {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))]; // Get unique, non-empty categories
        categories.sort();
        
        // Clear existing options except 'all'
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Filters and re-renders products based on current search and category values.
     */
    function filterAndRender() {
        const searchTerm = searchBar.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        let filteredProducts = allProducts;

        // Filter by category
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        renderProducts(filteredProducts);
    }
    
    /**
     * Displays a message in the product grid area.
     * @param {string} text - The message to display.
     * @param {boolean} [isError=false] - If true, displays the message in an error state.
     */
    function displayMessage(text, isError = false) {
        noResultsMessage.innerHTML = `<p>${text}</p>`;
        noResultsMessage.style.color = isError ? 'var(--error-color)' : 'inherit';
        noResultsMessage.style.display = 'block';
        productGrid.innerHTML = '';
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Event Listeners
    if (searchBar) searchBar.addEventListener('input', filterAndRender);
    if (categoryFilter) categoryFilter.addEventListener('change', filterAndRender);

    // Initial load
    updateCartCount();
    fetchProducts();
}

// Initialize shop when script loads (for shop.html)
if (document.getElementById('product-grid')) {
    import('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js').then(() => {
        import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js').then(() => {
            const { initializeApp } = window.firebase;
            const { getFirestore } = window.firebase.firestore;
            const app = initializeApp(window.firebaseConfig); // Assume firebase-config.js sets window.firebaseConfig
            const db = getFirestore(app);
            initShop(db);
        });
    });
}
