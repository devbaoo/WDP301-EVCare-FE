import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD82mzgWEy3RFIt6dLB6PM2BtTjdI16Zlo",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "evcare-ad417.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "evcare-ad417",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "evcare-ad417.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "434761208517",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:434761208517:web:a92472dd5f5b00d3f056ac",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FFJG12RDF9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
