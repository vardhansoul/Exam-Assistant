
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import type { UserProfile, DisplaySettings, FullUserProfile, TrialUser, LastSelection } from "./types";
import { ADMIN_EMAILS, GOOGLE_SHEETS_WEBHOOK_URL } from "./constants";

export const firebaseConfig = {
  apiKey: "AIzaSyBpplF9FEG0sSgyGnLXA1wk7boJgNgO0Ng",
  authDomain: "clubofcompetition-49506.firebaseapp.com",
  projectId: "clubofcompetition-49506",
  storageBucket: "clubofcompetition-49506.appspot.com",
  messagingSenderId: "977913736368",
  appId: "1:977913736368:web:5a66e9d76fa25104369f75"
};

// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

export const db = firebase.firestore();
export const auth = firebase.auth();

// Enable offline persistence for Firestore
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported by browser');
    }
});

// Proxy export for App.tsx
export const onAuthStateChange = (observer: (user: firebase.User | null) => void) => auth.onAuthStateChanged(observer);
export const deleteUserAccount = (user: firebase.User) => user.delete();

export const RecaptchaVerifier = firebase.auth.RecaptchaVerifier;
export const signInWithPhoneNumber = (phoneNumber: string, appVerifier: any) => auth.signInWithPhoneNumber(phoneNumber, appVerifier);

const isPermissionError = (error: any) => {
    return error?.code === 'permission-denied' || 
           error?.message?.includes('Missing or insufficient permissions');
};

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
    const defaultProfile: UserProfile = {
        dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: '',
        isAdmin: false, isBlocked: false, apiUsage: 0
    };

    try {
        let userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            if (data) {
                 const fetchedProfile = (data.profile as Partial<UserProfile>) || {};
                 return {
                    ...defaultProfile,
                    ...fetchedProfile,
                    isAdmin: !!data.isAdmin,
                    isBlocked: !!data.isBlocked,
                    apiUsage: data.apiUsage || 0
                };
            }
        }
    } catch (error) {
        if (!isPermissionError(error)) {
            console.warn("Error fetching user profile (returning default):", error);
        }
    }
    return defaultProfile;
};

export const getUserDoc = async (uid: string): Promise<any> => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
        if (!isPermissionError(error)) {
            console.error("Error fetching user doc:", error);
        }
        return null;
    }
};

export const checkUserExists = async (uid: string): Promise<boolean> => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        return userDoc.exists;
    } catch (e) {
        if (!isPermissionError(e)) {
            console.error("Error checking user existence:", e);
        }
        return false;
    }
};

export const updateUserProfile = async (uid: string, profileData: UserProfile): Promise<void> => {
    try {
        const { isAdmin, isBlocked, apiUsage, ...profileFields } = profileData;
        await db.collection('users').doc(uid).set({ profile: profileFields }, { merge: true });
    } catch (error) {
        console.error("Failed to save user profile:", error);
        throw error;
    }
};

export const ensureAdminPermissions = async (uid: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) return;

    const userEmail = currentUser.email;
    const isSuperAdminEmail = userEmail && ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail.toLowerCase());

    if (!isSuperAdminEmail) return;

    try {
        await db.collection('users').doc(uid).set({
            isAdmin: true,
            role: 'admin'
        }, { merge: true });
    } catch (e) {
        if (!isPermissionError(e)) {
            console.error("Failed to ensure admin permissions:", e);
        }
    }
};

const exportUserToSheet = async (user: firebase.User, method: string, role: string = 'user') => {
    if (!GOOGLE_SHEETS_WEBHOOK_URL) return;
    try {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                displayName: user.displayName || 'User',
                email: user.email,
                method: method,
                role: role,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn("Failed to export user to sheet:", e);
    }
};

const createNewUserDocument = (transaction: firebase.firestore.Transaction, userDocRef: firebase.firestore.DocumentReference, user: firebase.User) => {
    const newUserDoc = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        firstLogin: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        loginCount: 1,
        isAdmin: false,
        isBlocked: false,
        apiUsage: 0,
        role: 'user',
        profile: { dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: '' },
    };
    transaction.set(userDocRef, newUserDoc);
};

const updateUserDocument = (transaction: firebase.firestore.Transaction, userDocRef: firebase.firestore.DocumentReference, user: firebase.User) => {
    const updates = {
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        loginCount: firebase.firestore.FieldValue.increment(1),
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
    };
    transaction.update(userDocRef, updates);
};

export const signUpWithEmailPassword = async (email: string, password: string, displayName: string): Promise<{user: firebase.User, isNew: boolean}> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName });
    }
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("Could not find user after sign up.");
    const userDocRef = db.collection('users').doc(firebaseUser.uid);
    await db.runTransaction(async (transaction) => {
        createNewUserDocument(transaction, userDocRef, firebaseUser);
    });
    exportUserToSheet(firebaseUser, 'email');
    return { user: firebaseUser, isNew: true };
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<{user: firebase.User, isNew: boolean}> => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user!;
    const userDocRef = db.collection('users').doc(firebaseUser.uid);
    await db.runTransaction(async (transaction) => {
        const userDocSnap = await transaction.get(userDocRef);
        if (userDocSnap.exists) {
            updateUserDocument(transaction, userDocRef, firebaseUser);
        } else {
            createNewUserDocument(transaction, userDocRef, firebaseUser);
        }
    });
    return { user: firebaseUser, isNew: false };
};

export const handleGoogleSignIn = async (): Promise<{user: firebase.User, isNew: boolean}> => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user!;
        const additionalUserInfo = result.additionalUserInfo;
        const isNewUser = additionalUserInfo?.isNewUser || false;

        if (isNewUser) {
            try { await user.delete(); } catch (deleteError) { console.error("Failed to delete new user record:", deleteError); }
            throw new Error("Account not found. Please sign up with Email/Password first.");
        }

        const userDocRef = db.collection('users').doc(user.uid);
        await db.runTransaction(async (transaction) => {
            const userDocSnap = await transaction.get(userDocRef);
            if (!userDocSnap.exists) {
                createNewUserDocument(transaction, userDocRef, user);
            } else {
                updateUserDocument(transaction, userDocRef, user);
            }
        });
        return { user, isNew: false };
    } catch (error) {
        console.error("Google Sign In Error:", error);
        throw error;
    }
};

export const handleAdminGoogleSignIn = async (): Promise<{user: firebase.User, isNew: boolean}> => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user!;
        const userEmail = user.email || '';
        const isAllowed = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail.toLowerCase());

        if (!isAllowed) {
            await auth.signOut();
            throw new Error("Access Denied: You are not authorized as a Super Admin.");
        }

        const userDocRef = db.collection('users').doc(user.uid);
        await db.runTransaction(async (transaction) => {
            const userDocSnap = await transaction.get(userDocRef);
            const adminData = {
                isAdmin: true,
                role: 'admin',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            };

            if (!userDocSnap.exists) {
                const newUserDoc = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    firstLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    loginCount: 1,
                    isBlocked: false,
                    apiUsage: 0,
                    profile: { dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: '' },
                    ...adminData
                };
                transaction.set(userDocRef, newUserDoc);
            } else {
                transaction.update(userDocRef, {
                    ...adminData,
                    loginCount: firebase.firestore.FieldValue.increment(1),
                });
            }
        });
        
        return { user, isNew: false };
    } catch (error) {
        console.error("Admin Google Sign In Error:", error);
        throw error;
    }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try { await auth.sendPasswordResetEmail(email); } catch (error) { console.error("Error sending password reset email:", error); throw error; }
};

export const handleSignOut = async (): Promise<void> => {
    try { await auth.signOut(); } catch (error) { console.error("Error signing out:", error); throw error; }
};

export const saveUserDisplaySettings = async (uid: string, settings: DisplaySettings): Promise<void> => {
    try { await db.collection('users').doc(uid).collection('settings').doc('display').set(settings); } catch (e) { console.warn("Failed to save display settings:", e); }
};

export const getUserDisplaySettings = async (uid: string): Promise<DisplaySettings | null> => {
    try {
        const docSnap = await db.collection('users').doc(uid).collection('settings').doc('display').get();
        if (docSnap.exists) { return docSnap.data() as DisplaySettings; }
    } catch (e) { console.warn("Could not load settings", e); }
    return null;
};

export const registerTrialUser = async (name: string, email: string, phoneNumber: string, fingerprint: string): Promise<void> => {
    const trialsRef = db.collection('trial_records');
    const [phoneDoc, emailSnapshot, fingerprintSnapshot] = await Promise.all([
        trialsRef.doc(phoneNumber).get(),
        trialsRef.where("email", "==", email).get(),
        trialsRef.where("fingerprint", "==", fingerprint).get()
    ]);

    if (phoneDoc.exists) throw new Error("Trial Over: This phone number has already claimed a trial.");
    if (!emailSnapshot.empty) throw new Error("Trial Over: This email address has already claimed a trial.");
    if (fingerprintSnapshot.size >= 2) throw new Error("Trial Over: This device has already reached the maximum number of free trials.");

    await trialsRef.doc(phoneNumber).set({
        name, email, phoneNumber, fingerprint,
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        apiUsage: 0
    });
};

export const listenToUsers = (callback: (users: FullUserProfile[]) => void) => {
    return db.collection('users').onSnapshot(async (snapshot) => {
        const users = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as FullUserProfile));
        users.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
        callback(users);
    }, (error) => { console.warn("Error listening to users:", error); callback([]); });
};

export const listenToTrialUsers = (callback: (users: TrialUser[]) => void) => {
    return db.collection('trial_records').orderBy('startedAt', 'desc').onSnapshot((snapshot) => {
        const users: TrialUser[] = [];
        snapshot.forEach((doc) => { users.push({ id: doc.id, ...doc.data() } as TrialUser); });
        callback(users);
    }, (error) => { console.warn("Error listening to trial users:", error); });
};

export const listenToActivityLog = (callback: (logs: any[]) => void) => {
    return db.collection('activity_log').orderBy('timestamp', 'desc').where('timestamp', '!=', null).limit(50).onSnapshot((snapshot) => {
            const logs: any[] = [];
            snapshot.forEach((doc) => { logs.push({ id: doc.id, ...doc.data() }); });
            callback(logs);
        }, (error) => { console.warn("Error listening to activity log:", error); });
};

export const updateUserRole = async (uid: string, isAdmin: boolean) => {
    await db.collection('users').doc(uid).update({ isAdmin: isAdmin, role: isAdmin ? 'admin' : 'user' });
};

export const toggleUserBlockStatus = async (uid: string, isBlocked: boolean) => {
    await db.collection('users').doc(uid).update({ isBlocked: isBlocked });
};

export const extendUserValidity = async (uid: string) => {
    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 5);
    await db.collection('users').doc(uid).update({ 
        customExpiryDate: firebase.firestore.Timestamp.fromDate(newExpiry) 
    });
};

export const deleteUserDocument = async (uid: string) => {
    await db.collection('users').doc(uid).delete();
};

export const adminCreateUser = async (email: string, password: string, displayName: string, isAdmin: boolean) => {
    const secondaryApp = firebase.initializeApp(firebaseConfig, `SecondaryApp-${Date.now()}`);
    const secondaryAuth = secondaryApp.auth();
    try {
        const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user!;
        await newUser.updateProfile({ displayName });
        await db.collection('users').doc(newUser.uid).set({
            uid: newUser.uid, email, displayName, isAdmin, isBlocked: false, role: isAdmin ? 'admin' : 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), firstLogin: null, lastLogin: null,
            loginCount: 0, apiUsage: 0, photoURL: null,
            profile: { dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: '' }
        });
        exportUserToSheet(newUser, 'admin_console', isAdmin ? 'admin' : 'user');
        await secondaryAuth.signOut();
        return newUser.uid;
    } catch (error) { throw error; } finally { await secondaryApp.delete(); }
};

export const getSignupAccessCode = async (): Promise<string> => {
    try {
        const doc = await db.collection('settings').doc('access_control').get();
        return doc.exists ? doc.data()?.signupCode || 'admin123' : 'admin123';
    } catch (e) { 
        if (!isPermissionError(e)) console.error("Error fetching access code:", e); 
        return 'admin123'; 
    }
};

export const setSignupAccessCode = async (newCode: string): Promise<void> => {
    await db.collection('settings').doc('access_control').set({ signupCode: newCode }, { merge: true });
};

// --- Smart Knowledge Base Caching ---

const generateKnowledgeKey = (key: string): string => {
    // Clean key for use as a Firestore Document ID (must be UTF-8 encoded, no slashes if not path)
    // We replace characters that are unsafe or confusing in a URL/path context
    // but keep semantic structure (colons) for readability in the DB console.
    
    const safeKey = key
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9:_-]/g, '_') // Replace spaces and special chars with underscore, keep colons
        .replace(/_+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, ''); // Trim underscores

    // Firestore IDs are limited to 1500 bytes. Truncate if extreme.
    return safeKey.substring(0, 512); 
};

export const getGlobalCache = async (key: string): Promise<{ data: any, timestamp: number } | null> => {
    try {
        // "Redis-style" check: Direct key lookup
        // We use 'universal_content_cache' to indicate this is shared, static knowledge.
        const safeKey = generateKnowledgeKey(key);
        if (!safeKey) return null;
        
        // Optimize: Use default source (Server/Cache) handled by Firestore persistence
        const doc = await db.collection('universal_content_cache').doc(safeKey).get();
        
        if (doc.exists) {
            const data = doc.data();
            // console.debug(`[Cache Hit] Knowledge retrieved for: ${safeKey}`);
            return { 
                data: data?.content, 
                timestamp: data?.timestamp?.toMillis() || Date.now() 
            };
        }
    } catch (e) {
        // Silent fail, proceed to generation
        // console.debug(`[Cache Miss] Knowledge fetch failed for: ${key}`, e);
    }
    return null;
};

export const saveGlobalCache = async (key: string, content: any): Promise<void> => {
    try {
        const safeKey = generateKnowledgeKey(key);
        if (!safeKey) return;

        // "Redis-style" set: Fire and forget write to the knowledge base
        db.collection('universal_content_cache').doc(safeKey).set({
            content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            key_id: safeKey // Store the key itself for easier searching/debugging
        }).catch(() => {});
    } catch (e) {
        console.warn("Knowledge base save error:", e);
    }
};
