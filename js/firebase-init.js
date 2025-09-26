// js/firebase-init.js (VERSI 100% LENGKAP & FINAL UNTUK VERCEL)

// Impor semua fungsi yang kita butuhkan dari Firebase v9
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";

// Kode ini membaca variabel dari Vercel Environment Variables yang sudah Anda atur
// Awalan "NEXT_PUBLIC_" memberitahu Vercel bahwa variabel ini aman untuk digunakan di browser
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inisialisasi Firebase dan Supabase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ekspor semua fungsi dan instance yang kita butuhkan agar bisa diimpor oleh main.js
export {
    auth,
    db,
    supabase,
    // Firebase Auth functions
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getAdditionalUserInfo,
    // Firebase Firestore functions
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
};
