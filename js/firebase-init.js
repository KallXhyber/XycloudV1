// js/firebase-init.js (VERSI FINAL YANG BENAR UNTUK VERCEL)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";

// Kode ini akan membaca 'window.firebaseConfig' dan 'window.SUPABASE_URL'
// yang dibuat secara otomatis oleh Vercel dari build command di package.json.
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

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
