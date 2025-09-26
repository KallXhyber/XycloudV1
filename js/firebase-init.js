// js/firebase-init.js

// Impor fungsi yang kita butuhkan dari Firebase v9
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo } from "firebase/auth";
// PERBAIKAN: Menambahkan 'getDocs' di baris impor di bawah ini
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";

// 'firebaseConfig' akan diambil dari window object yang diset oleh config.js
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 'supabase' global diambil dari CDN, lalu kita buat client-nya.
const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Ekspor semua fungsi dan instance yang kita butuhkan
export {
    auth,
    db,
    supabaseClient as supabase,
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
    getDocs, // PERBAIKAN: Menambahkan 'getDocs' di daftar ekspor
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
