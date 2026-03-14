// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ganti dengan konfigurasi dari Firebase Console Anda
const firebaseConfig = {
  apiKey: "AIzaSyB0KGnboKM8019wYFX-cXhv-gt8O0w3WfQ",
  authDomain: "zakat-baiturrahim.firebaseapp.com",
  projectId: "zakat-baiturrahim",
  storageBucket: "zakat-baiturrahim.firebasestorage.app",
  messagingSenderId: "511327449438",
  appId: "1:511327449438:web:b3bc6f8747825737615fcf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);