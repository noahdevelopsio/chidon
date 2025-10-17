/* --- CHIDON KITCHEN: ADMIN JAVASCRIPT --- */

// This script handles admin dashboard functionality like authentication, product CRUD, and Cloudinary uploads.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import firebaseConfig from './firebase-config.js';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_API_KEY, CURRENCY_SYMBOL } from './config.js';


let currentUser = null;
let products = [];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

function logout() {
    return signOut(auth);
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    if (user) {
        currentUser = user;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loadProducts();
        initCloudinaryWidget();
    } else {
        currentUser = null;
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

// Load products
async function loadProducts() {
    try {
        const q = query(collection(db, "products"));
        const querySnapshot = await getDocs(q);
        products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        // Sort products by name
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        renderProducts();
    } catch (error) {
        console.error("Error loading products:", error);
    }
}


// Render products
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `
            <div class="product-card__image-container">
                <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name || 'Product'}" class="product-card__image">
            </div>
            <div class="product-card__body">
                <h3 class="product-card__title">${product.name || 'Unnamed Product'}</h3>
                <p class="product-card__description">${product.description || ''}</p>
                <p class="product-card__price">${CURRENCY_SYMBOL}${Number(product.price || 0).toFixed(2)}</p>

                <div class="product-card__tags">
                    <span class="product-card__tag">${product.category || 'Uncategorized'}</span>
                    ${product.featured ? '<span class="product-card__tag featured">Featured</span>' : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary edit-btn" data-product-id="${product.id}">Edit</button>
                    <button class="btn btn-danger delete-btn" data-product-id="${product.id}">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(productDiv);
    });

    
    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            editProduct(productId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            deleteProduct(productId);
        });
    });

    // Make product cards visible with animation
    requestAnimationFrame(() => {
        document.querySelectorAll('#products-container .product-card').forEach(el => el.classList.add('is-visible'));
    });

}

// Add/Edit product
async function saveProduct(productData, productId = null) {
    try {
        if (productId) {
            await updateDoc(doc(db, "products", productId), productData);
        } else {
            await addDoc(collection(db, "products"), productData);
        }
        loadProducts();
        document.getElementById('product-form').reset();
        // Reset button text to add mode
        document.querySelector('#product-form button[type="submit"]').textContent = 'Add Product';
        document.getElementById('product-status').textContent = 'Product saved successfully!';
        setTimeout(() => {
            document.getElementById('product-status').textContent = '';
        }, 3000);
    } catch (error) {
        console.error("Error saving product:", error);
        document.getElementById('product-status').textContent = 'Error saving product.';
    }
}


// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('product-name').value = (product.name && product.name !== 'undefined') ? product.name : '';
    document.getElementById('product-description').value = (product.description && product.description !== 'undefined') ? product.description : '';
    document.getElementById('product-price').value = (product.price && product.price !== 'undefined' && !isNaN(Number(product.price))) ? product.price : '';
    document.getElementById('product-category').value = (product.category && product.category !== 'undefined') ? product.category : '';
    document.getElementById('product-image').value = product.imageUrl || '';
    document.getElementById('product-featured').checked = product.featured || false;

    // Show image preview if image exists
    const previewImg = document.getElementById('preview-img');
    if (product.imageUrl) {
        previewImg.src = product.imageUrl;
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }

    // Change button text to indicate update mode
    document.querySelector('#product-form button[type="submit"]').textContent = 'Update Product';

    // Store product ID for update
    document.getElementById('product-form').dataset.productId = productId;
}





// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await deleteDoc(doc(db, "products", productId));
        loadProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

/// Cloudinary widget
function initCloudinaryWidget() {
    if (typeof window.cloudinary === 'undefined') {
        console.error('Cloudinary not loaded yet. Retrying in 1 second...');
        setTimeout(initCloudinaryWidget, 1000);
        return;
    }

    const uploadDiv = document.getElementById('upload-widget');
    if (!uploadDiv) {
        console.error('Upload widget container not found.');
        return;
    }

    // ✅ Add both upload & folder-restricted browsing
    uploadDiv.innerHTML = `
        <button type="button" class="btn btn-secondary" id="upload-btn">Upload Image</button>
        <button type="button" class="btn btn-info" id="browse-btn">Browse from Folder</button>
    `;

    // ✅ Upload Widget (new image uploads only go to chidon/products)
    const uploadWidget = window.cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: 'chidon/products', // restrict uploads here
        sources: ['local', 'camera', 'url'],
        multiple: false,
        maxFileSize: 2097152, // 2MB
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: false,
        theme: 'minimal'
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const url = result.info.secure_url;
            document.getElementById('product-image').value = url;
            const previewImg = document.getElementById('preview-img');
            previewImg.src = url;
            previewImg.style.display = 'block';
        } else if (error) {
            console.error('Cloudinary upload error:', error);
        }
    });

    // ✅ Media Library Widget (only shows chidon/products folder)
    const libraryWidget = window.cloudinary.createMediaLibrary({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        multiple: false,
        search: { expression: 'folder:"chidon/products"' }, // restrict browsing
        resource_type: 'image'
    }, {
        insertHandler: (data) => {
            if (data.assets && data.assets.length > 0) {
                const url = data.assets[0].secure_url;
                document.getElementById('product-image').value = url;
                const previewImg = document.getElementById('preview-img');
                previewImg.src = url;
                previewImg.style.display = 'block';
            }
        }
    });

    // ✅ Event Listeners
    document.getElementById('upload-btn').addEventListener('click', () => uploadWidget.open(), false);
    document.getElementById('browse-btn').addEventListener('click', () => libraryWidget.show(), false);
}



// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const status = document.getElementById('login-status');
            
            try {
                await login(email, password);
                status.textContent = 'Login successful!';
                status.style.color = 'green';
            } catch (error) {
                status.textContent = 'Login failed: ' + error.message;
                status.style.color = 'red';
            }
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logout();
            } catch (error) {
                console.error("Error logging out:", error);
            }
        });
    }
    
    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productData = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: document.getElementById('product-price').value ? parseFloat(document.getElementById('product-price').value) : null,
                category: document.getElementById('product-category').value,
                imageUrl: document.getElementById('product-image').value || 'images/placeholder.jpg',
                featured: document.getElementById('product-featured').checked
            };

            
            const productId = productForm.dataset.productId;
            await saveProduct(productData, productId);
            delete productForm.dataset.productId;
        });
    }
});
