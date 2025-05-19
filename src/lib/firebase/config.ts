// Firebase configuration for IyàCare

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyBvh8X0JQpSL0KRwbTgfzGZzSPKwrVWM2A",
  authDomain: "iyacare-app.firebaseapp.com",
  projectId: "iyacare-app",
  storageBucket: "iyacare-app.appspot.com",
  messagingSenderId: "429648821359",
  appId: "1:429648821359:web:2e9d9a7c3d0c3b3c3d0c3b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 