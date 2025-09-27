// js/firebase-init.js (VERSI FINAL TERAKHIR)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";

// Kode ini akan membaca 'window.firebaseConfig' yang dibuat oleh Vercel
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// PERBAIKAN DI BARIS DI BAWAH INI
// Memanggil createClient dari objek supabase global yang disediakan CDN
const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Ekspor semua fungsi dan instance yang kita butuhkan
export {
    auth,
    db,
    supabaseClient as supabase, // Kita ekspor client-nya dengan nama 'supabase' agar main.js tidak perlu diubah
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
