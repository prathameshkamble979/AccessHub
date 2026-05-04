import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const missingConfig: string[] = [];
if (!firebaseConfig.apiKey) missingConfig.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingConfig.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingConfig.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.appId) missingConfig.push('VITE_FIREBASE_APP_ID');

const app = initializeApp(firebaseConfig);

if (missingConfig.length === 0 && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics initialization errors; auth should still work.
    });
}

let authInstance: Auth | null = null;
const googleProvider = new GoogleAuthProvider();

function getAuthInstance(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(app);
  setPersistence(authInstance, browserLocalPersistence);
  return authInstance;
}

export const loginWithGoogle = async () => {
  if (missingConfig.length > 0) {
    throw new Error(
      `Firebase config missing: ${missingConfig.join(', ')}`
    );
  }

  try {
    const auth = getAuthInstance();
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    const token = await user.getIdToken();

    return { user, token };
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error;
  }
};
