import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import firebaseConfig from './firebase-config.js';

import sampleProducts from "../sample-products.json" assert { type: "json" };

const firebaseConfig = {
  apiKey: "AIzaSyBlIYNznti_Gnwkp-Rl90LC1V-Nf8At3Y4",
  authDomain: "chidon-kitchen.firebaseapp.com",
  projectId: "chidon-kitchen",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadProducts() {
  for (const product of sampleProducts) {
    await addDoc(collection(db, "products"), product);
    console.log(`✅ Uploaded: ${product.name}`);
  }
  console.log("🎉 All products uploaded successfully!");
}

uploadProducts();
