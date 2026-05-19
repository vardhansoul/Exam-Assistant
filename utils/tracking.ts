import type { QuizResult, LearningProgress, SyllabusProgress, ApplicationRecord, HistoryItem, HistoryType, DisplaySettings, LastSelection, UserNotes, SyllabusTopic, UserSession, ChatSession } from '../types';
import { db, saveUserDisplaySettings, handleFirestoreError, OperationType, isPermissionError } from '../firebase';
import firebase from 'firebase/compat/app';
import { EXAM_DATA, INDIAN_STATES, QUALIFICATION_CATEGORIES, SCHOOL_CLASSES, SELECTION_LEVELS, SCHOOL_STREAMS } from '../constants';

const GUEST_STORAGE_PREFIX = 'guest_';

const getStorageKey = (uid: string | null, key: string): string => {
    const prefix = uid ? `user_${uid}_` : GUEST_STORAGE_PREFIX;
    return `${prefix}${key}`;
};

// --- Local Storage JSON Helpers ---
const getLocalJson = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setLocalJson = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            console.warn("LocalStorage quota exceeded, attempting cleanup...");
            cleanupCache();
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return;
            } catch (retryError) {
                console.error("LocalStorage still full after cleanup:", retryError);
            }
        }
        console.warn(`Error setting localStorage key “${key}”:`, error);
    }
};

const cleanupCache = () => {
    try {
        const keys = Object.keys(localStorage);
        const apiCacheKeys = keys.filter(k => k.startsWith('api_cache_'));
        
        if (apiCacheKeys.length === 0) return;

        // Sort by timestamp (oldest first)
        const entries = apiCacheKeys.map(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                return { key, timestamp: data.timestamp || 0 };
            } catch {
                return { key, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 20% of entries
        const toRemove = Math.max(1, Math.floor(entries.length * 0.2));
        for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(entries[i].key);
        }
        console.log(`Cleaned up ${toRemove} old cache entries.`);
    } catch (e) {
        console.error("Cache cleanup failed:", e);
    }
};

// --- Active Component State Persistence ---
// Synchronous read for useState initializers
export const getComponentState = <T>(key: string, uid: string | null = null): T | null => {
    const localKey = `active_state_${key}`;
    return getLocalJson<T | null>(localKey, null);
};

export const saveComponentState = async (key: string, data: any, uid: string | null = null) => {
    const localKey = `active_state_${key}`;
    if (data === null || data === undefined) {
        localStorage.removeItem(localKey);
    } else {
        setLocalJson(localKey, data);
    }

    // If user is logged in, sync to cloud for cross-device persistence
    if (uid) {
        try {
            const docRef = db.collection('users').doc(uid).collection('component_states').doc(key);
            if (data === null || data === undefined) {
                await docRef.delete();
            } else {
                await docRef.set({ ...data, _updatedAt: Date.now() });
            }
        } catch (e) {
            if (isPermissionError(e)) {
                handleFirestoreError(e, OperationType.WRITE, `users/${uid}/component_states/${key}`);
            }
            console.warn(`Failed to sync component state ${key} to cloud:`, e);
        }
    }
};

/**
 * Loads all component states from cloud for a user
 */
export const syncComponentStatesFromCloud = async (uid: string): Promise<void> => {
    try {
        const snapshot = await db.collection('users').doc(uid).collection('component_states').get();
        snapshot.forEach(doc => {
            const key = doc.id;
            const data = doc.data();
            setLocalJson(`active_state_${key}`, data);
        });
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/component_states`);
        }
        console.warn("Failed to sync component states from cloud:", e);
    }
};

// --- IndexedDB Wrapper for massive payloads ---
const DB_NAME = 'COC_Cache_DB';
const API_STORE = 'api_cache_store';

let idbPromise: Promise<IDBDatabase> | null = null;
const getIDB = async (): Promise<IDBDatabase> => {
    if (!window.indexedDB) {
        throw new Error("IndexedDB not supported");
    }
    if (!idbPromise) {
        idbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => {
                req.result.createObjectStore(API_STORE);
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    return idbPromise;
};

export const setIndexedDB = async (key: string, value: any): Promise<void> => {
    try {
        const db = await getIDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(API_STORE, 'readwrite');
            tx.objectStore(API_STORE).put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('IDB write failed', e);
    }
};

export const getIndexedDB = async <T>(key: string): Promise<T | null> => {
    try {
        const db = await getIDB();
        return new Promise<T | null>((resolve, reject) => {
            const tx = db.transaction(API_STORE, 'readonly');
            const req = tx.objectStore(API_STORE).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        return null;
    }
};

// --- API Caching ---
export interface ApiCacheEntry {
    timestamp: number;
    data: any;
}
export const getApiCache = async <T>(key: string): Promise<ApiCacheEntry | null> => {
    let val = await getIndexedDB<ApiCacheEntry>(`api_cache_${key}`);
    if (!val) {
        // Fallback/migration from old synchronous localStorage version
        val = getLocalJson<ApiCacheEntry | null>(`api_cache_${key}`, null);
        if (val) {
            setIndexedDB(`api_cache_${key}`, val).catch(() => {});
            localStorage.removeItem(`api_cache_${key}`);
        }
    }
    return val;
};
export const setApiCache = async (key: string, data: any, timestamp: number = Date.now()) => {
    await setIndexedDB(`api_cache_${key}`, { timestamp, data });
};
export const isCacheStale = (timestamp: number, staleMs = 1000 * 60 * 60 * 24): boolean => {
    return (Date.now() - timestamp) > staleMs;
};


// --- Learning Progress ---
export const getTrackingData = async (uid: string | null): Promise<LearningProgress> => {
    const defaultData: LearningProgress = { studiedTopics: [], quizHistory: [], likedTopics: [] };
    if (!uid) {
        return getLocalJson<LearningProgress>(getStorageKey(null, 'tracking'), defaultData);
    }
    try {
        const docSnap = await db.collection('users').doc(uid).collection('progress').doc('tracking').get();
        return docSnap.exists ? (docSnap.data() as LearningProgress) : defaultData;
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/tracking`);
        }
        console.warn("Failed to load tracking data, using default:", e);
        return defaultData;
    }
};

const saveTrackingData = async (uid: string | null, data: LearningProgress) => {
    if (!uid) {
        setLocalJson(getStorageKey(null, 'tracking'), data);
        return;
    }
    try {
        await db.collection('users').doc(uid).collection('progress').doc('tracking').set(data, { merge: true });
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.WRITE, `users/${uid}/progress/tracking`);
        }
        console.error("Failed to save tracking data:", e);
    }
};

export const saveQuizResult = async (result: QuizResult, uid: string | null) => {
    const data = await getTrackingData(uid);
    data.quizHistory.push(result);
    await saveTrackingData(uid, data);
};

export const markTopicAsStudied = async (topic: string, uid: string | null) => {
    const data = await getTrackingData(uid);
    if (!data.studiedTopics.includes(topic)) {
        data.studiedTopics.push(topic);
        await saveTrackingData(uid, data);
    }
};

export const unmarkTopicAsStudied = async (topic: string, uid: string | null) => {
    const data = await getTrackingData(uid);
    data.studiedTopics = data.studiedTopics.filter(t => t !== topic);
    await saveTrackingData(uid, data);
};

export const likeTopic = async (topic: string, uid: string | null) => {
    const data = await getTrackingData(uid);
    if (!data.likedTopics.includes(topic)) {
        data.likedTopics.push(topic);
        await saveTrackingData(uid, data);
    }
};

export const unlikeTopic = async (topic: string, uid: string | null) => {
    const data = await getTrackingData(uid);
    data.likedTopics = data.likedTopics.filter(t => t !== topic);
    await saveTrackingData(uid, data);
};


// --- Activity History ---
export const getHistory = async (uid: string | null): Promise<HistoryItem[]> => {
    if (!uid) {
        const history = getLocalJson<HistoryItem[]>(getStorageKey(null, 'history'), []);
        return history.sort((a,b) => b.timestamp - a.timestamp);
    }
    try {
        const docSnap = await db.collection('users').doc(uid).collection('progress').doc('history').get();
        return docSnap.exists ? (docSnap.data()?.items as HistoryItem[]).sort((a,b) => b.timestamp - a.timestamp) : [];
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/history`);
        }
        console.warn("Failed to load history:", e);
        return [];
    }
};

export const logActivity = async (uid: string | null, item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const fullItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
  
    if (!uid) {
      const history = getLocalJson<HistoryItem[]>(getStorageKey(null, 'history'), []);
      history.unshift(fullItem);
      setLocalJson(getStorageKey(null, 'history'), history.slice(0, 100));
      return;
    }
  
    const docRef = db.collection('users').doc(uid).collection('progress').doc('history');
    
    // Log to global activity log
    db.collection('activity_log').add({ ...fullItem, uid }).catch(e => {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.CREATE, `activity_log`);
        }
        console.warn("Failed to log global activity", e);
    });

    try {
        await docRef.update({
            items: firebase.firestore.FieldValue.arrayUnion(fullItem)
        });
    } catch (err: any) {
        if(err.code === 'not-found') {
            try {
                await docRef.set({ items: [fullItem] });
            } catch (setErr) {
                if (isPermissionError(setErr)) {
                    handleFirestoreError(setErr, OperationType.WRITE, `users/${uid}/progress/history`);
                }
                console.error("Error creating activity log: ", setErr);
            }
        } else {
            if (isPermissionError(err)) {
                handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/progress/history`);
            }
            console.error("Error logging activity: ", err);
        }
    }
};


// --- Syllabus Progress ---
export const getSyllabusProgress = async (uid: string | null): Promise<SyllabusProgress> => {
    const isGuest = !uid;
    let rawData: unknown = {};
    
    if (isGuest) {
        rawData = getLocalJson(getStorageKey(null, 'syllabus'), {});
    } else {
        try {
            const docSnap = await db.collection('users').doc(uid).collection('progress').doc('syllabus').get();
            if (docSnap.exists) {
                rawData = docSnap.data();
            }
        } catch (e) {
            if (isPermissionError(e)) {
                handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/syllabus`);
            }
            console.warn("Failed to load syllabus progress:", e);
        }
    }

    if (typeof rawData === 'object' && rawData !== null) {
        const cleanedData: SyllabusProgress = {};
        for (const key in rawData) {
            if (Object.prototype.hasOwnProperty.call(rawData, key)) {
                const progressEntry = (rawData as Record<string, any>)[key];
                const rawIds: unknown = progressEntry?.checkedIds;
                const checkedIds = Array.isArray(rawIds) ? rawIds.filter((id): id is string => typeof id === 'string') : [];
                
                cleanedData[key] = {
                    checkedIds: checkedIds,
                    syllabus: (progressEntry?.syllabus || []) as SyllabusTopic[],
                };
            }
        }
        return cleanedData;
    }
    return {};
};

export const saveSyllabusProgress = async (key: string, checkedIds: string[], syllabus: SyllabusTopic[], uid: string | null) => {
    const allProgress = await getSyllabusProgress(uid);
    const updatedProgress = { ...allProgress, [key]: { checkedIds, syllabus } };

    if (!uid) {
        setIndexedDB(getStorageKey(null, 'syllabus'), updatedProgress).catch(e => console.warn(e));
        return;
    }
    try {
        await db.collection('users').doc(uid).collection('progress').doc('syllabus').set(updatedProgress);
        // Also persist locally via IDB for offline
        setIndexedDB(getStorageKey(uid, 'syllabus'), updatedProgress).catch(e => console.warn(e));
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.WRITE, `users/${uid}/progress/syllabus`);
        }
        console.error("Failed to save syllabus progress:", e);
    }
};


// --- Bookmarks ---
export const getBookmarkedTopics = async (uid: string | null): Promise<string[]> => {
    let rawTopics: unknown;
    if (!uid) {
        let lcl = await getIndexedDB(getStorageKey(null, 'bookmarks'));
        rawTopics = lcl || getLocalJson(getStorageKey(null, 'bookmarks'), []);
    } else {
        try {
            const docSnap = await db.collection('users').doc(uid).collection('progress').doc('bookmarks').get();
            rawTopics = docSnap.exists ? docSnap.data()?.topics : [];
            setIndexedDB(getStorageKey(uid, 'bookmarks'), rawTopics).catch(e => console.warn(e));
        } catch (e) {
            if (isPermissionError(e)) {
                handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/bookmarks`);
            }
            console.warn("Failed to load bookmarks:", e);
            rawTopics = await getIndexedDB(getStorageKey(uid, 'bookmarks')) || getLocalJson(getStorageKey(uid, 'bookmarks'), []);
        }
    }
    
    if (Array.isArray(rawTopics)) {
        return rawTopics.filter((t): t is string => typeof t === 'string');
    }
    return [];
};

export const saveBookmarkedTopics = async (topics: string[], uid: string | null) => {
    if (!uid) {
        setIndexedDB(getStorageKey(null, 'bookmarks'), topics).catch(e => console.warn(e));
        return;
    }
    try {
        await db.collection('users').doc(uid).collection('progress').doc('bookmarks').set({ topics });
        setIndexedDB(getStorageKey(uid, 'bookmarks'), topics).catch(e => console.warn(e));
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.WRITE, `users/${uid}/progress/bookmarks`);
        }
        console.error("Failed to save bookmarked topics:", e);
    }
};

// --- Last Selection ---
export const getLastSelection = async (uid: string | null): Promise<LastSelection | null> => {
    // ALWAYS eagerly load from local storage
    const localSelection = getLocalJson<LastSelection | null>(getStorageKey(uid, 'lastSelection'), null);
    
    if (!uid) {
        return localSelection;
    }
    
    // For authenticated users, try to get from Firebase to get latest cross-device
    try {
        const docSnap = await db.collection('users').doc(uid).collection('progress').doc('selection').get();
        if (docSnap.exists) {
            const fbSelection = docSnap.data() as LastSelection;
            setLocalJson(getStorageKey(uid, 'lastSelection'), fbSelection);
            return fbSelection;
        }
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/selection`);
        }
        console.warn("Failed to load last selection from cloud, falling back to local:", e);
    }
    
    return localSelection;
};

export const saveLastSelection = async (selection: LastSelection | null, uid: string | null) => {
    // ALWAYS save locally for instant persistence
    if (selection) {
        setLocalJson(getStorageKey(uid, 'lastSelection'), selection);
    } else {
        localStorage.removeItem(getStorageKey(uid, 'lastSelection'));
    }
    
    if (!uid) return;

    const docRef = db.collection('users').doc(uid).collection('progress').doc('selection');
    try {
        if (selection) {
            await docRef.set(selection);
        } else {
            await docRef.delete();
        }
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, selection ? OperationType.WRITE : OperationType.DELETE, `users/${uid}/progress/selection`);
        }
        console.error("Failed to save last selection to cloud:", e);
    }
};

export const isLastSelectionValid = (selection: LastSelection | null): boolean => {
    if (!selection || typeof selection !== 'object' || !selection.selectionLevel || !SELECTION_LEVELS.includes(selection.selectionLevel)) {
        return false;
    }

    try {
        switch (selection.selectionLevel) {
            case 'National Level': {
                if (!selection.selectedExam || !selection.selectedSubCategory) return false;
                const exam = EXAM_DATA.national.find(e => e.name === selection.selectedExam);
                const subCategory = exam?.subCategories?.find(sc => sc.name === selection.selectedSubCategory);
                if (!subCategory) return false;
                if (selection.selectedTier) {
                    const hasTiers = subCategory.tiers?.some(t => t.name === selection.selectedTier);
                    const hasSubSubCategories = subCategory.subCategories?.some(ssc => ssc.name === selection.selectedTier);
                    if (!hasTiers && !hasSubSubCategories) return false;
                }
                return true;
            }
            case 'State Level': {
                if (!selection.selectedState || !INDIAN_STATES.some(s => s.name === selection.selectedState) || !selection.selectedExam || !selection.selectedSubCategory) return false;
                const stateExams = EXAM_DATA.state[selection.selectedState as keyof typeof EXAM_DATA.state];
                if (!stateExams) return false;
                const exam = stateExams.find(e => e.name === selection.selectedExam);
                const subCategory = exam?.subCategories?.find(sc => sc.name === selection.selectedSubCategory);
                if (!subCategory) return false;
                if (selection.selectedTier) {
                    if (!subCategory.tiers?.some(t => t.name === selection.selectedTier)) return false;
                }
                return true;
            }
            case 'Entrance Exams': {
                if (!selection.selectedExam || !selection.selectedSubCategory) return false;
                const exam = EXAM_DATA.entrance.find(e => e.name === selection.selectedExam);
                const subCategory = exam?.subCategories?.find(sc => sc.name === selection.selectedSubCategory);
                if (!subCategory) return false;
                return true;
            }
            case 'Exams by Qualification': {
                return !!selection.selectedQualification && QUALIFICATION_CATEGORIES.includes(selection.selectedQualification);
            }
            case 'School Syllabus (NCERT)': {
                if (!selection.selectedExam || !SCHOOL_CLASSES.includes(selection.selectedExam) || !selection.selectedTier) return false; 
                const classNum = parseInt(selection.selectedExam.replace('Class ', ''));
                if (classNum > 10) {
                    if (!selection.selectedSubCategory || !SCHOOL_STREAMS.includes(selection.selectedSubCategory)) return false;
                }
                return true;
            }
        }
    } catch (e) {
        return false;
    }

    return false;
};


// --- Application Records ---
export const getApplicationRecords = async (uid: string | null): Promise<ApplicationRecord[]> => {
    if (!uid) {
        return getLocalJson<ApplicationRecord[]>(getStorageKey(null, 'applications'), []);
    }
    try {
        const querySnapshot = await db.collection('users').doc(uid).collection('applications').get();
        return querySnapshot.docs.map(doc => doc.data() as ApplicationRecord);
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/applications`);
        }
        console.warn("Failed to load application records:", e);
        return [];
    }
};

export const saveApplicationRecord = async (record: Omit<ApplicationRecord, 'id'>, uid: string | null) => {
    const id = Date.now().toString();
    const newRecord = { ...record, id };
    
    if (!uid) {
        const records = await getApplicationRecords(null);
        records.push(newRecord);
        setLocalJson(getStorageKey(null, 'applications'), records);
        return;
    }
    try {
        await db.collection('users').doc(uid).collection('applications').doc(id).set(newRecord);
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.WRITE, `users/${uid}/applications/${id}`);
        }
        console.error("Failed to save application record:", e);
    }
};

export const deleteApplicationRecord = async (id: string, uid: string | null) => {
    if (!uid) {
        let records = await getApplicationRecords(null);
        records = records.filter(r => r.id !== id);
        setLocalJson(getStorageKey(null, 'applications'), records);
        return;
    }
    try {
        await db.collection('users').doc(uid).collection('applications').doc(id).delete();
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.DELETE, `users/${uid}/applications/${id}`);
        }
        console.error("Failed to delete application record:", e);
    }
};


// --- Display Settings ---
const DISPLAY_SETTINGS_KEY = 'display_settings';

// Because React hooks expect synchronous return for initial state, we leave getDisplaySettings
// attached to localStorage for instantly painting the UI.
export const getDisplaySettings = (): DisplaySettings => {
    return getLocalJson<DisplaySettings>(DISPLAY_SETTINGS_KEY, {
        fontSize: 'base',
        fontFamily: 'sans',
        language: 'English',
        theme: 'system'
    });
};
export const saveDisplaySettings = (settings: DisplaySettings) => {
    setLocalJson(DISPLAY_SETTINGS_KEY, settings);
    setIndexedDB(DISPLAY_SETTINGS_KEY, settings).catch(() => {});
};

// --- User Session Persistence ---
export const getUserSession = async (uid: string | null): Promise<UserSession | null> => {
    const localKey = getStorageKey(uid, 'session');
    const localSession = getLocalJson<UserSession | null>(localKey, null);
    
    if (localSession) {
        return localSession;
    }

    if (!uid) {
        return null;
    }

    try {
        const docSnap = await db.collection('users').doc(uid).collection('progress').doc('session').get();
        if (docSnap.exists) {
            const session = docSnap.data() as UserSession;
            setLocalJson(localKey, session);
            return session;
        }
    } catch (e) {
        if (isPermissionError(e)) {
            handleFirestoreError(e, OperationType.GET, `users/${uid}/progress/session`);
        }
        console.warn("Failed to load user session:", e);
    }
    return null;
};

export const saveUserSession = async (uid: string | null, session: UserSession | null): Promise<void> => {
    const localKey = getStorageKey(uid, 'session');
    if (session) {
        setLocalJson(localKey, session);
    } else {
        localStorage.removeItem(localKey);
    }

    if (uid) {
        const docRef = db.collection('users').doc(uid).collection('progress').doc('session');
        try {
            if (session) {
                await docRef.set(session);
            } else {
                await docRef.delete();
            }
        } catch (e) {
            if (isPermissionError(e)) {
                handleFirestoreError(e, session ? OperationType.WRITE : OperationType.DELETE, `users/${uid}/progress/session`);
            }
            console.error("Failed to save user session:", e);
        }
    }
};


