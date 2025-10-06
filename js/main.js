document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons
    feather.replace();

    // --- FIREBASE & PAGE-SPECIFIC LOGIC --- //
    const pathname = window.location.pathname;

    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        const db = firebase.firestore();
        const auth = firebase.auth();
        const storage = firebase.storage();

        // --- SHOP PAGE LOGIC --- //
        if (pathname.includes('shop.html')) {
            loadProducts(db);
            setupFilters(db);
        }

        // --- ADMIN PAGE LOGIC --- //
        if (pathname.includes('admin.html')) {
            handleAdminPage(auth, db, storage);
        }
    } else {
        if (pathname.includes('shop.html') || pathname.includes('admin.html')) {
            console.error('Firebase is not initialized. Please check your firebase-config.js');
            const productGrid = document.getElementById('product-grid');
            if(productGrid) productGrid.innerHTML = '<p class="text-danger">Error: Could not connect to the database. Please configure Firebase.</p>';
        }
    }
});

/**
 * Loads products from Firestore and displays them on the Shop page.
 * @param {firebase.firestore.Firestore} db - The Firestore database instance.
 * @param {Object} filters - Optional filters for category and search query.
 */
function loadProducts(db, filters = {}) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    const phoneNumber = '+61412345678'; // IMPORTANT: Replace with your WhatsApp number

    let query = db.collection('products');

    if (filters.category && filters.category !== 'All Categories') {
        query = query.where('category', '==', filters.category);
    }

    query.orderBy('name').get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            productGrid.innerHTML = '<p>No products found. Add some in the admin dashboard!</p>';
            return;
        }

        let products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(product => product.name.toLowerCase().includes(searchTerm));
        }

        let html = '';
        products.forEach((product) => {
            const whatsappLink = `https://wa.me/${phoneNumber}?text=Hi!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}.`;
            html += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="${product.imageUrl || 'images/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                            <a href="${whatsappLink}" target="_blank" class="btn btn-primary">Order on WhatsApp</a>
                        </div>
                    </div>
                </div>
            `;
        });
        productGrid.innerHTML = html;
    }).catch(error => {
        console.error('Error fetching products: ', error);
        productGrid.innerHTML = '<p class="text-danger">Could not fetch products. Please try again later.</p>';
    });
}

/**
 * Sets up the category and search filters for the Shop page.
 * @param {firebase.firestore.Firestore} db - The Firestore database instance.
 */
function setupFilters(db) {
    const categoryFilter = document.getElementById('category-filter');
    const searchBar = document.getElementById('search-bar');

    const applyFilters = () => {
        const category = categoryFilter.value;
        const search = searchBar.value;
        loadProducts(db, { category, search });
    };

    categoryFilter.addEventListener('change', applyFilters);
    searchBar.addEventListener('input', applyFilters);
}

/**
 * Handles all logic for the Admin Dashboard page.
 * @param {firebase.auth.Auth} auth
 * @param {firebase.firestore.Firestore} db
 * @param {firebase.storage.Storage} storage
 */
function handleAdminPage(auth, db, storage) {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addProductForm = document.getElementById('add-product-form');
    const adminProductList = document.getElementById('admin-product-list');

    auth.onAuthStateChanged(user => {
        if (user) {
            // User is logged in
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadAdminProducts(db);
        } else {
            // User is logged out
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    });

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => alert(`Login Failed: ${error.message}`));
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // Add/Edit Product
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const imageFile = document.getElementById('product-image').files[0];

        let imageUrl = addProductForm.dataset.editingImageUrl || '';

        try {
            // Upload image if a new one is selected
            if (imageFile) {
                const imageRef = storage.ref(`product_images/${Date.now()}_${imageFile.name}`);
                const snapshot = await imageRef.put(imageFile);
                imageUrl = await snapshot.ref.getDownloadURL();
            }

            const productData = { name, description, price, category, imageUrl };

            if (productId) {
                // Update existing product
                await db.collection('products').doc(productId).update(productData);
            } else {
                // Add new product
                await db.collection('products').add(productData);
            }

            addProductForm.reset();
            document.getElementById('product-id').value = '';
            delete addProductForm.dataset.editingImageUrl;
            alert('Product saved successfully!');
            loadAdminProducts(db);
        } catch (error) {
            console.error('Error saving product: ', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Load products for the admin list
    function loadAdminProducts(db) {
        db.collection('products').orderBy('name').get().then(snapshot => {
            let html = '';
            snapshot.forEach(doc => {
                const product = doc.data();
                html += `
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="row g-0">
                                <div class="col-md-4">
                                    <img src="${product.imageUrl || 'images/placeholder.jpg'}" class="img-fluid rounded-start" alt="${product.name}">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.name}</h5>
                                        <p class="card-text">$${product.price.toFixed(2)}</p>
                                        <button class="btn btn-sm btn-primary btn-edit" data-id="${doc.id}">Edit</button>
                                        <button class="btn btn-sm btn-danger btn-delete" data-id="${doc.id}">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            adminProductList.innerHTML = html;
        });
    }

    // Handle Edit and Delete clicks
    adminProductList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await db.collection('products').doc(id).delete();
                    loadAdminProducts(db);
                } catch (error) {
                    console.error('Error deleting product: ', error);
                    alert('Failed to delete product.');
                }
            }
        }

        if (target.classList.contains('btn-edit')) {
            const doc = await db.collection('products').doc(id).get();
            const product = doc.data();

            document.getElementById('product-id').value = id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-category').value = product.category;
            addProductForm.dataset.editingImageUrl = product.imageUrl; // Store current image URL
            
            window.scrollTo(0, 0); // Scroll to top to see the form
        }
    });
}