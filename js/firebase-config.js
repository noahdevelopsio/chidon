// --- CHIDON KITCHEN: FIREBASE CONFIGURATION --- //

// This file contains the Firebase project configuration.
// TODO: Replace the placeholder values below with your actual Firebase project settings.
// You can find these details in your Firebase project console:
// Project Settings > General > Your apps > Firebase SDK snippet > Config

// For modular SDK (recommended):
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';

// For compat mode (CDN):
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// etc.

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Export the configuration object to be used by other scripts
export default firebaseConfig;
