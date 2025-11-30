import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtXt_mx217dS4KmIzQ78_KafufDwuGhm4",
  authDomain: "careerquest-7a741.firebaseapp.com",
  projectId: "careerquest-7a741",
  storageBucket: "careerquest-7a741.firebasestorage.app",
  messagingSenderId: "864822379969",
  appId: "1:864822379969:web:2e86263d38376c9a219b40"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
