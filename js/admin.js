/* --- CHIDON KITCHEN: ADMIN JAVASCRIPT --- */

// This script handles admin functionality: authentication, product CRUD, and Cloudinary integration.

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './config.js';

/**
 * Initializes the admin functionality.
 * @param {object} auth - Firebase Auth instance.
 * @param {object} db - Firestore database instance.
 * @param {object} authMethods - Auth methods (onAuthStateChanged, signInWithEmailAndPassword, signOut).
 * @param {object} cloudinaryConfig - Cloudinary configuration.
 */
export function initAdmin(auth, db, authMethods, cloudinaryConfig) {
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productIdInput = document.getElementById('product-id');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const imageUrlInput = document.getElementById('image-url');
    const imagePreview = document.getElementById('image-preview');
    const uploadStatus = document.getElementById('upload-status');
    const productList = document.getElementById('product-list');
    const formStatus = document.getElementById('form-status');

    // Auth State Listener
    authMethods.onAuthStateChanged(auth, (user) => {
        if (user) {
            loginSection.style.display = 'none';
            adminDashboard.style.display = 'block';
            loadProducts();
        } else {
            loginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            await authMethods.signInWithEmailAndPassword(auth, email, password);
            errorEl.textContent = '';
        } catch (error) {
            errorEl.textContent = 'Invalid credentials. Please try again.';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        authMethods.signOut(auth);
    });

    // Cloudinary Upload Widget
    uploadImageBtn.addEventListener('click', () => {
        cloudinary.openUploadWidget({
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFiles: 1,
            cropping: true,
            croppingAspectRatio: 1,
            showAdvancedOptions: true,
            showCrop: true
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                imageUrlInput.value = result.info.secure_url;
                imagePreview.src = result.info.secure_url;
                imagePreview.style.display = 'block';
                uploadStatus.textContent = 'Image uploaded successfully!';
                uploadStatus.style.color = 'var(--success-color)';
            } else if (error) {
                uploadStatus.textContent = 'Upload failed: ' + error.message;
                uploadStatus.style.color = 'var(--error-color)';
            }
        });
    });

    // Product Form Submit
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!imageUrlInput.value) {
            formStatus.textContent = 'Please upload an image.';
            formStatus.style.color = 'var(--error-color)';
            return;
        }

        const productData = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            featured: document.getElementById('product-featured').checked,
            imageUrl: imageUrlInput.value,
            createdAt: new Date()
        };

        try {
            const productId = document.getElementById('product-id').value;
            if (productId) {
                // Update existing
                const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
                await updateDoc(doc(db, 'products', productId), productData);
                formStatus.textContent = 'Product updated successfully!';
            } else {
                // Add new
                const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
                await addDoc(collection(db, 'products'), productData);
                formStatus.textContent = 'Product added successfully!';
            }
            productForm.reset();
            imageUrlInput.value = '';
            imagePreview.style.display = 'none';
            uploadStatus.textContent = '';
            formTitle.textContent = 'Add New Product';
            productIdInput.value = '';
            cancelEditBtn.style.display = 'none';
            loadProducts();
        } catch (error) {
            formStatus.textContent = 'Error: ' + error.message;
            formStatus.style.color = 'var(--error-color)';
        }
    });

    // Cancel Edit
    cancelEditBtn.addEventListener('click', () => {
        productForm.reset();
        imageUrlInput.value = '';
        imagePreview.style.display = 'none';
        uploadStatus.textContent = '';
        formTitle.textContent = 'Add New Product';
        productIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    });

    // Load Products
    async function loadProducts() {
        try {
            const { getDocs, collection, query, orderBy } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            productList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() };
                const productEl = document.createElement('div');
                productEl.className = 'product-item card mb-2 p-2 d-flex justify-content-between align-items-center';
                productEl.innerHTML = `
                    <div>
                        <h4>${product.name}</h4>
                        <p>${product.category} - $${product.price}</p>
                        <img src="${product.imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    </div>
                    <div class="d-flex gap-1">
                        <button onclick="editProduct('${product.id}')" class="btn btn-primary btn-sm">Edit</button>
                        <button onclick="deleteProduct('${product.id}')" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                `;
                productList.appendChild(productEl);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Edit Product
    window.editProduct = async (id) => {
        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
            const docSnap = await getDoc(doc(db, 'products', id));
            if (docSnap.exists()) {
                const product = docSnap.data();
                document.getElementById('product-id').value = id;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description;
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-featured').checked = product.featured || false;
                imageUrlInput.value = product.imageUrl;
                imagePreview.src = product.imageUrl;
                imagePreview.style.display = 'block';
                formTitle.textContent = 'Edit Product';
                cancelEditBtn.style.display = 'inline-block';
            }
        } catch (error) {
            formStatus.textContent = 'Error loading product: ' + error.message;
        }
    };

    // Delete Product
    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
                await deleteDoc(doc(db, 'products', id));
                loadProducts();
            } catch (error) {
                alert('Error deleting product: ' + error.message);
            }
        }
    };
}
