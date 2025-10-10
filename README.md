# Chidon Kitchen E-Commerce Website

Welcome to the Chidon Kitchen e-commerce website! This project is a complete, modern, and fully responsive website designed for a kitchen supply store. It's built with HTML, CSS, and vanilla JavaScript, and it uses Firebase for the backend and Cloudinary for image hosting. The site is designed to be fast, easy to customize, and simple to deploy.

## Features

*   **Modern & Responsive Design:** The website is designed to look great on all devices, from mobile phones to desktops.
*   **Dynamic Product Loading:** Products are loaded dynamically from a Firestore database, making it easy to manage your inventory.
*   **Client-Side Search & Filtering:** Users can search for products by name and filter by category on the shop page.
*   **Shopping Cart:** Add products to cart, update quantities, remove items, and checkout via WhatsApp.
*   **Admin Dashboard:** A secure admin dashboard allows you to easily add, edit, and delete products with Cloudinary image uploads.
*   **Firebase Integration:** The website is integrated with Firebase for database and authentication.
*   **Cloudinary Image Hosting:** Product images are hosted on Cloudinary, a powerful and scalable image hosting service.
*   **WhatsApp Ordering:** The shop page includes cart checkout via WhatsApp for easy ordering.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase (Firestore, Auth)
- **Image Hosting:** Cloudinary
- **Fonts:** Lora (headings), Poppins (body)
- **Icons:** Feather Icons
- **Deployment:** Firebase Hosting

## Getting Started

To get started with this project, you'll need to have a few things set up first:

### Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project
- A Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chidon-kitchen.git
cd chidon-kitchen
```

### 2. Set Up Firebase

1. Create a new project in the [Firebase console](https://console.firebase.google.com/).
2. Enable Firestore Database and Authentication (Email/Password).
3. Get your Firebase config from Project Settings > General > Your apps > Web app.
4. Update `js/firebase-config.js` with your actual config:

```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

5. Create an admin user in Authentication > Users.
6. Set up Firestore Security Rules (see below).

### 3. Set Up Cloudinary

1. Create a new account on [Cloudinary](https://cloudinary.com/).
2. Get your Cloud Name and create an unsigned upload preset in Settings > Upload.
3. Update `js/config.js` with your Cloudinary details:

```javascript
export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
export const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';
```

### 4. Configure WhatsApp and Currency

Update `js/config.js` with your WhatsApp number and currency symbol:

```javascript
export const WHATSAPP_NUMBER = '1234567890'; // Your WhatsApp number
export const CURRENCY_SYMBOL = '₦'; // Or '$' for USD
```

### 5. Import Sample Products

1. Install Firebase CLI if not already: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize the project: `firebase init` (select Hosting and Firestore)
4. Import sample products:

```bash
firebase firestore:import sample-products.json --project your-project-id
```

Or manually add them in the Firestore console.

### 6. Firestore Security Rules

Add these rules in Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users
    match /{document=**} {
      allow read: if true;
    }
    // Allow write access only to authenticated users (admin)
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

## Customization

This project is designed to be easy to customize:

*   **Logo:** Replace the text in `.main-nav__brand` in HTML files.
*   **Social Media Links:** Update `href` in `.social-icons` in footer.
*   **Colors:** Edit CSS variables in `css/style.css` (e.g., `--accent-color: #FFA94D`).
*   **Fonts:** Change Google Fonts link in HTML head.
*   **Content:** Edit text in HTML files or add new sections.

## Running Locally

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or using Firebase CLI
firebase serve
```

Open `http://localhost:8000` in your browser.

## Testing

- **Responsiveness:** Test on different screen sizes.
- **Cart Functionality:** Add items, update quantities, checkout via WhatsApp.
- **Admin Dashboard:** Login, add/edit/delete products, upload images.
- **Search/Filter:** Test product search and category filtering.

## Deployment

1. Build and deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

2. Your site will be live at `https://your-project.web.app`.

## Admin Access

- URL: `https://your-project.web.app/admin.html`
- Login with the admin email/password you created in Firebase Auth.

## Security Notes

- Admin pages are protected by Firebase Auth.
- Firestore rules restrict writes to authenticated users.
- Never commit real API keys to version control.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue on GitHub or contact the maintainers.
