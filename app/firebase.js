// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASzMOxbekvR7mxOfsT4d65E3lVBg6hXp8",
  authDomain: "pantry-inventory-ai.firebaseapp.com",
  projectId: "pantry-inventory-ai",
  storageBucket: "pantry-inventory-ai.appspot.com",
  messagingSenderId: "203369649911",
  appId: "1:203369649911:web:01c1245cd448e9645465f2",
  measurementId: "G-FYP7J7H11M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { firestore, storage, auth, provider, signInWithPopup, signOut };