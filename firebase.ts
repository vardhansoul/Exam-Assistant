
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import type { UserProfile, DisplaySettings, FullUserProfile, LastSelection } from "./types";
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

export const isPermissionError = (error: any) => {
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
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        } else {
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
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        } else {
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
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}`);
        } else {
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
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
        }
        console.error("Failed to save user profile:", error);
        throw error;
    }
};

export const checkAndIncrementDailyLimit = async (
    uid: string, 
    type: 'quiz' | 'imageQuery'
): Promise<{ allowed: boolean, remaining: number }> => {
    const userRef = db.collection('users').doc(uid);
    const today = new Date().toISOString().split('T')[0];
    
    // Limits: 5 quizzes, 5 image queries per day
    const LIMITS = {
        quiz: 5,
        imageQuery: 5
    };
    
    try {
        const doc = await userRef.get();
        let dailyUsage = doc.data()?.dailyUsage || { date: today, quizCount: 0, imageQueryCount: 0 };
        
        if (dailyUsage.date !== today) {
            dailyUsage = { date: today, quizCount: 0, imageQueryCount: 0 };
        }
        
        const currentCount = type === 'quiz' ? dailyUsage.quizCount : dailyUsage.imageQueryCount;
        const limit = LIMITS[type];
        
        if (currentCount >= limit) {
            return { allowed: false, remaining: 0 };
        }
        
        // Increment
        if (type === 'quiz') {
            dailyUsage.quizCount++;
        } else {
            dailyUsage.imageQueryCount++;
        }
        
        await userRef.set({ dailyUsage }, { merge: true });
        
        return { allowed: true, remaining: limit - (currentCount + 1) };
    } catch (error) {
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        } else {
            console.error("Error checking daily limit:", error);
        }
        // Fail open if there's an error so we don't block legitimate users on network issues
        return { allowed: true, remaining: 1 };
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
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
        } else {
            console.error("Failed to ensure admin permissions:", e);
        }
    }
};

const exportUserToSheet = async (user: firebase.User, method: string, role: string = 'user') => {
    if (!GOOGLE_SHEETS_WEBHOOK_URL) return;
    
    const payload = {
        uid: user.uid,
        displayName: user.displayName || 'User',
        email: user.email,
        method: method,
        role: role,
        timestamp: new Date().toISOString()
    };

    const tryExport = async (data: any) => {
        try {
            await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return true;
        } catch (e) {
            console.warn("Failed to export user to sheet:", e);
            return false;
        }
    };

    const success = await tryExport(payload);

    if (!success) {
        try {
            const pending = JSON.parse(localStorage.getItem('pending_sheet_exports') || '[]');
            pending.push(payload);
            localStorage.setItem('pending_sheet_exports', JSON.stringify(pending));
        } catch (e) {
            console.error("Failed to save pending export:", e);
        }
    }
};

export const retryFailedExports = async () => {
    if (!GOOGLE_SHEETS_WEBHOOK_URL || !navigator.onLine) return;

    try {
        const pendingStr = localStorage.getItem('pending_sheet_exports');
        if (!pendingStr) return;

        const pending = JSON.parse(pendingStr);
        if (!Array.isArray(pending) || pending.length === 0) return;

        const remaining: any[] = [];

        for (const payload of pending) {
            try {
                await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                remaining.push(payload);
            }
        }

        if (remaining.length > 0) {
            localStorage.setItem('pending_sheet_exports', JSON.stringify(remaining));
        } else {
            localStorage.removeItem('pending_sheet_exports');
        }
    } catch (e) {
        console.error("Error retrying exports:", e);
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

export const signInWithEmailPassword = async (email: string, password: string): Promise<{user: firebase.User, isNew: boolean}> => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user!;
        const userDocRef = db.collection('users').doc(firebaseUser.uid);
        try {
            await db.runTransaction(async (transaction) => {
                const userDocSnap = await transaction.get(userDocRef);
                if (userDocSnap.exists) {
                    updateUserDocument(transaction, userDocRef, firebaseUser);
                } else {
                    createNewUserDocument(transaction, userDocRef, firebaseUser);
                }
            });
        } catch (txError) {
            if (isPermissionError(txError)) {
                handleFirestoreError(txError, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
            throw txError;
        }
        return { user: firebaseUser, isNew: false };
    } catch (error) {
        console.error("Sign In Error:", error);
        throw error;
    }
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
            throw new Error("Account not found. Please contact the administrator.");
        }

        const userDocRef = db.collection('users').doc(user.uid);
        try {
            await db.runTransaction(async (transaction) => {
                const userDocSnap = await transaction.get(userDocRef);
                if (!userDocSnap.exists) {
                    createNewUserDocument(transaction, userDocRef, user);
                } else {
                    updateUserDocument(transaction, userDocRef, user);
                }
            });
        } catch (txError) {
            if (isPermissionError(txError)) {
                handleFirestoreError(txError, OperationType.WRITE, `users/${user.uid}`);
            }
            throw txError;
        }
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
        try {
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
        } catch (txError) {
            if (isPermissionError(txError)) {
                handleFirestoreError(txError, OperationType.WRITE, `users/${user.uid}`);
            }
            throw txError;
        }
        
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
    try { await db.collection('users').doc(uid).collection('settings').doc('display').set(settings); } catch (e) { 
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.WRITE, `users/${uid}/settings/display`);
        }
        console.warn("Failed to save display settings:", e); 
    }
};

export const getUserDisplaySettings = async (uid: string): Promise<DisplaySettings | null> => {
    try {
        const docSnap = await db.collection('users').doc(uid).collection('settings').doc('display').get();
        if (docSnap.exists) { return docSnap.data() as DisplaySettings; }
    } catch (e) { 
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/settings/display`);
        }
        console.warn("Could not load settings", e); 
    }
    return null;
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
    }, (error) => { 
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.LIST, 'users');
        }
        console.warn("Error listening to users:", error); 
        callback([]); 
    });
};

export const listenToActivityLog = (callback: (logs: any[]) => void) => {
    return db.collection('activity_log').orderBy('timestamp', 'desc').where('timestamp', '!=', null).limit(50).onSnapshot((snapshot) => {
            const logs: any[] = [];
            snapshot.forEach((doc) => { logs.push({ id: doc.id, ...doc.data() }); });
            callback(logs);
        }, (error) => { 
            if (isPermissionError(error)) {
                handleFirestoreError(error, OperationType.LIST, 'activity_log');
            }
            console.warn("Error listening to activity log:", error); 
        });
};

export const updateUserRole = async (uid: string, isAdmin: boolean) => {
    try {
        await db.collection('users').doc(uid).update({ isAdmin: isAdmin, role: isAdmin ? 'admin' : 'user' });
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
        }
        throw e;
    }
};

export const toggleUserBlockStatus = async (uid: string, isBlocked: boolean) => {
    try {
        await db.collection('users').doc(uid).update({ isBlocked: isBlocked });
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
        }
        throw e;
    }
};

export const deleteUserDocument = async (uid: string) => {
    try {
        await db.collection('users').doc(uid).delete();
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.DELETE, `users/${uid}`);
        }
        throw e;
    }
};

export const syncSession = async (uid: string, sessionId: string): Promise<void> => {
    try {
        await db.collection('users').doc(uid).set({
            currentSessionId: sessionId,
            lastSessionUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
        }
        console.warn("Failed to sync session:", e);
    }
};

export const listenToSession = (uid: string, callback: (sessionId: string | null) => void) => {
    return db.collection('users').doc(uid).onSnapshot((doc) => {
        if (doc.exists) {
            callback(doc.data()?.currentSessionId || null);
        }
    }, (error) => {
        if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        }
        console.warn("Error listening to session:", error);
    });
};

export const adminCreateUser = async (email: string, password: string, displayName: string, isAdmin: boolean) => {
    const secondaryApp = firebase.initializeApp(firebaseConfig, `SecondaryApp-${Date.now()}`);
    const secondaryAuth = secondaryApp.auth();
    try {
        const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user!;
        await newUser.updateProfile({ displayName });
        try {
            await db.collection('users').doc(newUser.uid).set({
                uid: newUser.uid, email, displayName, isAdmin, isBlocked: false, role: isAdmin ? 'admin' : 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), firstLogin: null, lastLogin: null,
                loginCount: 0, apiUsage: 0, photoURL: null,
                profile: { dob: '', college: '', school: '', course: '', place: '', gender: '', interestedJobs: '' }
            });
        } catch (e) {
            if (isPermissionError(e)) {
                handleFirestoreError(e, OperationType.CREATE, `users/${newUser.uid}`);
            }
            throw e;
        }
        exportUserToSheet(newUser, 'admin_console', isAdmin ? 'admin' : 'user');
        await secondaryAuth.signOut();
        return newUser.uid;
    } catch (error) { throw error; } finally { await secondaryApp.delete(); }
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
        const safeKey = generateKnowledgeKey(key);
        if (!safeKey) return null;
        
        const doc = await db.collection('universal_content_cache').doc(safeKey).get();
        if (doc.exists) {
            const data = doc.data();
            if (data?.status === 'generating') {
                return null; // Acknowledge it's locked, but we simulate a miss so the caller handles waiting
            }
            return { 
                data: data?.content, 
                timestamp: data?.timestamp?.toMillis() || Date.now() 
            };
        }
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `universal_content_cache/${generateKnowledgeKey(key)}`);
        }
    }
    return null;
};

// --- Thundering Herd Prevention ---
export const acquireGlobalCacheLock = async (key: string): Promise<boolean> => {
    const safeKey = generateKnowledgeKey(key);
    if (!safeKey) return false;
    
    const docRef = db.collection('universal_content_cache').doc(safeKey);
    try {
        return await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (doc.exists) {
                const data = doc.data();
                if (data?.status === 'generating') {
                    // Check if lock is stale (generator crashed) > 2 minutes
                    const lockTime = data?.timestamp?.toMillis() || Date.now();
                    if (Date.now() - lockTime > 120000) {
                        transaction.update(docRef, { timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                        return true; // Steal the stale lock
                    }
                    return false; // Someone else has a fresh lock
                }
                return false; // Already completely generated
            }
            // Acquire new lock
            transaction.set(docRef, {
                status: 'generating',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                key_id: safeKey
            });
            return true;
        });
    } catch (e) {
        console.warn("Failed to acquire generation lock:", e);
        return true; // If transaction fails (e.g. no connection), just allow generation to fallback
    }
};

export const waitForGlobalCache = async (key: string, timeoutMs: number = 30000): Promise<{ data: any, timestamp: number } | null> => {
    const safeKey = generateKnowledgeKey(key);
    if (!safeKey) return null;
    const docRef = db.collection('universal_content_cache').doc(safeKey);
    
    return new Promise((resolve) => {
        let timer: NodeJS.Timeout;
        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data?.status !== 'generating' && data?.content) {
                    clearTimeout(timer);
                    unsubscribe();
                    resolve({ data: data.content, timestamp: data.timestamp?.toMillis() || Date.now() });
                }
            }
        }, (error) => {
            clearTimeout(timer);
            unsubscribe();
            resolve(null);
        });
        
        timer = setTimeout(() => {
            unsubscribe();
            resolve(null); // Timeout occurred
        }, timeoutMs);
    });
};

export const saveGlobalCache = async (key: string, content: any): Promise<void> => {
    try {
        const safeKey = generateKnowledgeKey(key);
        if (!safeKey) return;

        // Removes 'generating' status implicitly by overwriting
        db.collection('universal_content_cache').doc(safeKey).set({
            content,
            status: 'ready',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            key_id: safeKey 
        }).catch((e) => {
            if (isPermissionError(e)) {
                handleFirestoreError(e, OperationType.WRITE, `universal_content_cache/${safeKey}`);
            }
        });
    } catch (e) {
        console.warn("Knowledge base save error:", e);
    }
};
