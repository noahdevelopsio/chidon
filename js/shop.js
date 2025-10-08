/* --- CHIDON KITCHEN: SHOP JAVASCRIPT --- */

// This script manages the functionality of the shop page, including
// fetching products from Firestore, filtering, and searching.

/**
 * Initializes the shop functionality.
 * @param {object} db - The Firestore database instance.
 */
export function initShop(db) {
    // TODO: Replace with your WhatsApp number
    const WHATSAPP_NUMBER = "1234567890"; // Use your country code, no '+' or spaces

    const productGrid = document.getElementById('product-grid');
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResultsMessage = document.getElementById('no-results-message');

    let allProducts = []; // To store the master list of products

    /**
     * Fetches products from the Firestore 'products' collection.
     */
    async function fetchProducts() {
        if (!db) {
            console.error("Firestore database instance is not available.");
            displayMessage("Could not connect to the database. Please check the console.", true);
            return;
        }

        loadingSpinner.style.display = 'block';
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
        } finally {
            loadingSpinner.style.display = 'none';
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

            const whatsappMessage = encodeURIComponent(`Hi! I'm interested in your product: ${product.name}`);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

            card.innerHTML = `
                <div class="product-card__image-container">
                    <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" class="product-card__image" loading="lazy">
                </div>
                <div class="product-card__body">
                    <h3 class="product-card__title">${product.name}</h3>
                    <p class="product-card__description">${product.description}</p>
                    <p class="product-card__price">$${Number(product.price).toFixed(2)}</p>
                    ${product.category ? `<div class="product-card__tags"><span class="product-card__tag">${product.category}</span></div>` : ''}
                    <div class="product-card__footer">
                        <a href="${whatsappUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
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
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        renderProducts(filteredProducts);
    }
    
    /**
     * Displays a message in the product grid area.
     * @param {string} text - The message to display.
     * @param {boolean} [isError=false] - If true, displays the message in an error state.
     */
    function displayMessage(text, isError = false) {
        noResultsMessage.textContent = text;
        noResultsMessage.style.color = isError ? 'var(--error-color)' : 'inherit';
        noResultsMessage.style.display = 'block';
        productGrid.innerHTML = '';
        productGrid.appendChild(noResultsMessage);
    }

    // Event Listeners
    searchBar.addEventListener('input', filterAndRender);
    categoryFilter.addEventListener('change', filterAndRender);

    // Initial fetch
    fetchProducts();
}
