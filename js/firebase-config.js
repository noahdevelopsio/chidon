// -----------------------------------------------------
// FIREBASE CONFIGURATION
// -----------------------------------------------------
// 1. Go to your Firebase project console.
// 2. In the project settings, find your web app's configuration object.
// 3. Copy the object and paste it here.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
