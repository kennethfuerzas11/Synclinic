import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYL4PJei98cp9bz83x91aXuWOVl2m_jLA",
  authDomain: "synclinic-563b5.firebaseapp.com",
  projectId: "synclinic-563b5",
  storageBucket: "synclinic-563b5.firebasestorage.app",
  messagingSenderId: "1044161511231",
  appId: "1:1044161511231:web:849e521d089e191ab01d8a",
  measurementId: "G-8ZG3ZCLK9Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);