import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDXRqDobUbyx7B3BpcmhsVHC8F9zCHzt9g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'expense-management-d4e92.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'expense-management-d4e92',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'expense-management-d4e92.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1093412458262',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1093412458262:web:0ab2624fbea84238d64a37',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8K30LRSLCC',
};

let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  if (import.meta.env.DEV) {
    console.log('✅ Firebase initialized successfully');
    console.log('Project ID:', firebaseConfig.projectId);
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        if (import.meta.env.DEV) {
          console.log('✅ Analytics initialized');
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Analytics initialization failed:', error);
        }
      }
    }
  }).catch(() => {
  });
}

export { analytics };
export default app;

