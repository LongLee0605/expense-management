import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDXRqDobUbyx7B3BpcmhsVHC8F9zCHzt9g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'expense-management-d4e92.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'expense-management-d4e92',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'expense-management-d4e92.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1093412458262',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1093412458262:web:0ab2624fbea84238d64a37',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8K30LRSLCC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch {
      }
    }
  }).catch(() => {
  });
}

export { analytics };
export default app;

