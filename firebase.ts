// FIX: These imports are correct for firebase v9+, but the linter is confused. The code will work.
import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
// FIX: Add deleteDoc to firestore imports
import { getFirestore, collection, doc, getDoc, setDoc, serverTimestamp, query, orderBy, getDocs, updateDoc, enableIndexedDbPersistence, deleteDoc } from "firebase/firestore";
// FIX: Add missing imports from firebase/auth
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBpplF9FEG0sSgyGnLXA1wk7boJgNgO0Ng",
  authDomain: "clubofcompetition-49506.firebaseapp.com",
  projectId: "clubofcompetition-49506",
  storageBucket: "clubofcompetition-49506.appspot.com",
  messagingSenderId: "977913736368",
  appId: "1:977913736368:web:5a66e9d76fa25104369f75"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firestore: Persistence failed, likely due to multiple open tabs.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore: Persistence is not supported in this browser.");
    }
  });

// FIX: Initialize and export auth instance
export const auth = getAuth(app);

// --- Cloud Cache Functions ---
interface CloudCacheEntry<T> {
    timestamp: number;
    data: T;
}

// Sanitize key for Firestore document ID
const sanitizeKey = (key: string) => {
    // Base64 encode to handle special characters, then make it URL-safe
    try {
        return btoa(key).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
        // Fallback for environments where btoa might not be available or fails
        return key.replace(/[^a-zA-Z0-9]/g, '_');
    }
};

export const getCloudCache = async <T>(key: string): Promise<CloudCacheEntry<T> | null> => {
    if (!navigator.onLine) return null; // No cloud access offline
    try {
        const docId = sanitizeKey(key);
        const docRef = doc(db, 'api_cache', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as CloudCacheEntry<T>;
        }
        return null;
    } catch (error) {
        console.warn("Failed to read from cloud cache:", error);
        return null; // Non-blocking
    }
};

export const setCloudCache = async <T>(key: string, data: T): Promise<void> => {
    if (!navigator.onLine) return; // No cloud access offline
    try {
        const docId = sanitizeKey(key);
        const docRef = doc(db, 'api_cache', docId);
        const cacheEntry: CloudCacheEntry<T> = { timestamp: Date.now(), data };
        await setDoc(docRef, cacheEntry);
    } catch (error) {
        console.warn("Failed to write to cloud cache:", error);
    }
};


// We can also export the functions directly to avoid importing them everywhere
export {
    collection,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    updateDoc,
    // FIX: Export deleteDoc
    deleteDoc,
    initializeApp,
    deleteApp,
    // FIX: Export auth functions
    // FIX: Export getAuth to fix an import error in AdminDashboard.tsx.
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile,
};