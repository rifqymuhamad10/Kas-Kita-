// Firebase Client SDK Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Menggunakan config dari project ID "kas-kita-5a2f3" yang didapat dari firebase-service-account
// Ganti nilai apiKey, authDomain, dll. sesuai dengan yang didapat dari Firebase Console jika diperlukan.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyForTestingKasKitaApp",
  authDomain: "kas-kita-5a2f3.firebaseapp.com",
  projectId: "kas-kita-5a2f3",
  storageBucket: "kas-kita-5a2f3.appspot.com",
  messagingSenderId: "106811328191068407325",
  appId: "1:106811328191068407325:web:fakeappidfortesting"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
