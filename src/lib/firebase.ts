// Firebase client SDK initialization.
// NOTE: Firebase web API keys are PUBLIC by design — they identify the project,
// not authenticate it. Security is enforced by Firebase Auth rules and App Check.
// We still read them from import.meta.env so different environments can override.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY              ?? "AIzaSyDKR_oReh_lHle5wJutF_ydtdCPTvoCQUc",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN          ?? "roimusic-auth.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID           ?? "roimusic-auth",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET       ?? "roimusic-auth.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID  ?? "1089504419003",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID               ?? "1:1089504419003:web:c1641eed56bb12983a5d9e",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID       ?? "G-0R3Z5EP79B",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
