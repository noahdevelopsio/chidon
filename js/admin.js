/* --- CHIDON KITCHEN: ADMIN JAVASCRIPT --- */

// This script manages all functionality on the admin dashboard, including
// authentication, product CRUD (Create, Read, Update, Delete), and image uploads.

/**
 * Initializes the admin dashboard functionality.
 * @param {object} auth - The Firebase Auth instance.
 * @param {object} db - The Firestore database instance.
 * @param {object} firebaseAuthFns - Firebase auth functions like onAuthStateChanged.
 */
export function initAdmin(auth, db, firebaseAuthFns) {

    // --- START: Cloudinary Configuration --- //
    // TODO: Replace these with your Cloudinary details.
    // Find these in your Cloudinary dashboard -> Settings -> Upload.
    // Create an "unsigned" upload preset.
    const CLOUDINARY_CLOUD_NAME = "df2nojiq2";
    const CLOUDINARY_UPLOAD_PRESET = "Chidon-kitchen";
    // --- END: Cloudinary Configuration --- //

    // Import Firestore functions dynamically
    let getDocs, collection, doc, addDoc, setDoc, deleteDoc;
    import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js').then(firestore => {
        getDocs = firestore.getDocs;
        collection = firestore.collection;
        doc = firestore.doc;
        addDoc = firestore.addDoc;
        setDoc = firestore.setDoc;
        deleteDoc = firestore.deleteDoc;
    });

    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productIdField = document.getElementById('product-id');
    const imageUrlField = document.getElementById('image-url');
    const imagePreview = document.getElementById('image-preview');
    const imageUploadInput = document.getElementById('product-image');
    const uploadStatus = document.getElementById('upload-status');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productListDiv = document.getElementById('product-list');

    /**
     * Handles user authentication state changes.
     */
    firebaseAuthFns.onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in
            loginSection.style.display = 'none';
            adminDashboard.style.display = 'block';
            fetchAndDisplayProducts();
        } else {
            // User is signed out
            loginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    });

    /**
     * Handles the login form submission.
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;
        loginError.textContent = '';

        try {
            await firebaseAuthFns.signInWithEmailAndPassword(auth, email, password);
            // Auth state change will handle UI visibility
        } catch (error) {
            console.error("Login Error:", error);
            loginError.textContent = error.message;
        }
    });

    /**
     * Handles the logout button click.
     */
    logoutBtn.addEventListener('click', async () => {
        try {
            await firebaseAuthFns.signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });

    /**
     * Fetches all products from Firestore and displays them in a list.
     */
    async function fetchAndDisplayProducts() {
        if (!db) return;
        productListDiv.innerHTML = 'Loading...';
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            let products = [];
            querySnapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
            
            productListDiv.innerHTML = ''; // Clear loading message
            if (products.length === 0) {
                productListDiv.innerHTML = '<p>No products found. Add one using the form above.</p>';
                return;
            }

            products.forEach(product => {
                const productEl = document.createElement('div');
                productEl.className = 'd-flex justify-content-between align-items-center p-1 border-bottom';
                productEl.innerHTML = `
                    <span>
                        <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" width="50" height="50" style="object-fit: cover; border-radius: 4px; margin-right: 1rem;">
                        <strong>${product.name}</strong> - $${product.price}
                    </span>
                    <div>
                        <button class="btn btn-secondary btn-sm edit-btn" data-id="${product.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">Delete</button>
                    </div>
                `;
                productListDiv.appendChild(productEl);
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            productListDiv.innerHTML = '<p style="color: var(--error-color);">Error loading products.</p>';
        }
    }

    /**
     * Handles click events on the product list (for edit/delete buttons).
     */
    productListDiv.addEventListener('click', async (e) => {
        const target = e.target;
        const productId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            // Load product data into the form for editing
            const product = await getProductById(productId);
            if (product) populateFormForEdit(product);
        }

        if (target.classList.contains('delete-btn')) {
            // Confirm and delete the product
            if (confirm('Are you sure you want to delete this product?')) {
                await deleteProduct(productId);
            }
        }
    });
    
    /**
     * Handles the product form submission for both creating and updating.
     */
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = productIdField.value;
        const productData = {
            name: productForm['product-name'].value,
            description: productForm['product-description'].value,
            price: parseFloat(productForm['product-price'].value),
            category: productForm['product-category'].value,
            featured: productForm['product-featured'].checked,
            imageUrl: imageUrlField.value
        };

        if (!productData.name || !productData.price || !productData.imageUrl) {
            alert('Please fill out the name, price, and upload an image.');
            return;
        }

        try {
            if (id) {
                // Update existing product
                const productRef = doc(db, "products", id);
                await setDoc(productRef, productData, { merge: true });
            } else {
                // Create new product
                await addDoc(collection(db, "products"), productData);
            }
            resetForm();
            await fetchAndDisplayProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Error saving product. Check the console for details.");
        }
    });

    /**
     * Handles the image file input change and uploads to Cloudinary.
     */
    imageUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME" || CLOUDINARY_UPLOAD_PRESET === "YOUR_UNSIGNED_UPLOAD_PRESET") {
            alert("Cloudinary is not configured. Please update js/admin.js with your credentials.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        uploadStatus.textContent = 'Uploading...';

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.secure_url) {
                imageUrlField.value = data.secure_url;
                imagePreview.src = data.secure_url;
                imagePreview.style.display = 'block';
                uploadStatus.textContent = 'Upload successful!';
                uploadStatus.style.color = 'var(--success-color)';
            } else {
                throw new Error('Upload failed. No secure_url returned.');
            }
        } catch (error) {
            console.error("Image upload error:", error);
            uploadStatus.textContent = `Error uploading image: ${error.message}`;
            uploadStatus.style.color = 'var(--error-color)';
        }
    });

    /**
     * Fetches a single product by its ID.
     * @param {string} id - The ID of the product to fetch.
     */
    async function getProductById(id) {
        try {
            const { getDoc } = await import('https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js');
            const docRef = doc(db, "products", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                console.log("No such document!");
                return null;
            }
        } catch (error) {
            console.error("Error getting document:", error);
        }
    }

    /**
     * Deletes a product from Firestore by its ID.
     * @param {string} id - The ID of the product to delete.
     */
    async function deleteProduct(id) {
        try {
            await deleteDoc(doc(db, "products", id));
            await fetchAndDisplayProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert('Error deleting product.');
        }
    }

    /**
     * Populates the form fields with data from a product for editing.
     * @param {object} product - The product object.
     */
    function populateFormForEdit(product) {
        formTitle.textContent = 'Edit Product';
        productIdField.value = product.id;
        productForm['product-name'].value = product.name;
        productForm['product-description'].value = product.description;
        productForm['product-price'].value = product.price;
        productForm['product-category'].value = product.category;
        productForm['product-featured'].checked = product.featured || false;
        imageUrlField.value = product.imageUrl;
        imagePreview.src = product.imageUrl;
        imagePreview.style.display = 'block';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }

    /**
     * Resets the form to its default state for adding a new product.
     */
    function resetForm() {
        formTitle.textContent = 'Add New Product';
        productForm.reset();
        productIdField.value = '';
        imageUrlField.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        uploadStatus.textContent = '';
        cancelEditBtn.style.display = 'none';
    }

    // Event listener for the cancel edit button
    cancelEditBtn.addEventListener('click', resetForm);
}
