// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-9c5b0.firebaseapp.com",
  projectId: "mern-estate-9c5b0",
  storageBucket: "mern-estate-9c5b0.appspot.com",
  messagingSenderId: "109571725249",
  appId: "1:109571725249:web:79fc142ae336f179ce0140"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);