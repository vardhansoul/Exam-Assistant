
import type { LearningProgress, QuizResult, SyllabusProgress, ApplicationRecord, LastSelection, StudyMaterial, SyllabusTopic } from '../types';
import { db, doc, getDoc, setDoc, collection, query, getDocs, deleteDoc } from '../firebase';

const TRACKING_KEY = 'clubOfCompetitionLearningTracker';
const SYLLABUS_TRACKING_KEY = 'clubOfCompetitionSyllabusTracker';
const APPLICATION_TRACKER_KEY = 'clubOfCompetitionApplicationTracker';
const API_CACHE_KEY = 'clubOfCompetitionApiCache';
const LAST_SELECTION_KEY = 'clubOfCompetitionLastSelection';


const API_CACHE_MAX_SIZE = 100;
const API_CACHE_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days


// --- Scoped Key Helper ---
const getScopedKey = (baseKey: string): string => {
    // This function creates a key for localStorage for non-logged-in users.
    const scope = 'guest';
    return `${baseKey}_${scope}`;
};


// --- API Cache Functions (Global, not user-scoped) ---
interface CacheEntry<T> {
    timestamp: number;
    data: T;
}

export const getApiCache = <T>(key: string): CacheEntry<T> | null => {
    try {
        const cacheStr = localStorage.getItem(API_CACHE_KEY);
        if (!cacheStr) return null;
        const cache = JSON.parse(cacheStr);
        return cache[key] || null;
    } catch (error) { return null; }
};

export const setApiCache = <T>(key: string, data: T) => {
    try {
        const cacheStr = localStorage.getItem(API_CACHE_KEY);
        const cache = cacheStr ? JSON.parse(cacheStr) : {};
        cache[key] = { timestamp: Date.now(), data };
        const keys = Object.keys(cache);
        if (keys.length > API_CACHE_MAX_SIZE) delete cache[keys[0]];
        localStorage.setItem(API_CACHE_KEY, JSON.stringify(cache));
    } catch (error) { console.error("Failed to write to API cache", error); }
};

export const isCacheStale = (timestamp: number, staleMs: number = API_CACHE_STALE_MS): boolean => (Date.now() - timestamp) > staleMs;

// --- Learning Tracker Functions ---
const getDefaultData = (): LearningProgress => ({ studiedTopics: [], quizHistory: [] });

export const getTrackingData = async (uid: string | null): Promise<LearningProgress> => {
    if (!uid) {
        try {
            const scopedKey = getScopedKey(TRACKING_KEY);
            const data = localStorage.getItem(scopedKey);
            return data ? JSON.parse(data) : getDefaultData();
        } catch (error) { return getDefaultData(); }
    }
    // Firestore logic
    try {
        const docRef = doc(db, 'users', uid, 'tracking', 'learning');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as LearningProgress) : getDefaultData();
    } catch (error) {
        console.error("Failed to fetch tracking data from Firestore:", error);
        return getDefaultData();
    }
};

const saveData = async (data: LearningProgress, uid: string | null) => {
    if (!uid) {
        try {
            const scopedKey = getScopedKey(TRACKING_KEY);
            localStorage.setItem(scopedKey, JSON.stringify(data));
        } catch (error) { console.error("Failed to save tracking data to localStorage", error); }
        return;
    }
    // Firestore logic
    try {
        const docRef = doc(db, 'users', uid, 'tracking', 'learning');
        await setDoc(docRef, data);
    } catch (error) {
        console.error("Failed to save tracking data to Firestore:", error);
    }
};

export const saveQuizResult = async (result: QuizResult, uid: string | null) => {
    const data = await getTrackingData(uid);
    data.quizHistory.unshift(result);
    if (data.quizHistory.length > 50) data.quizHistory.pop();
    await saveData(data, uid);
};

export const markTopicAsStudied = async (topic: string, uid: string | null) => {
    const data = await getTrackingData(uid);
    if (!data.studiedTopics.includes(topic)) {
        data.studiedTopics.push(topic);
        await saveData(data, uid);
    }
};


// --- Syllabus Tracker Functions ---
export const getSyllabusProgress = async (uid: string | null): Promise<SyllabusProgress> => {
    if (!uid) { // Guest user
        try {
            const scopedKey = getScopedKey(SYLLABUS_TRACKING_KEY);
            const data = localStorage.getItem(scopedKey);
            return data ? JSON.parse(data) : {};
        } catch (error) { return {}; }
    }
    // Logged-in user
    try {
        const docRef = doc(db, 'users', uid, 'tracking', 'syllabus');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as SyllabusProgress) : {};
    } catch (error) {
        console.error("Failed to fetch syllabus progress from Firestore:", error);
        return {};
    }
};

export const saveSyllabusProgress = async (syllabusKey: string, checkedIds: string[], syllabus: SyllabusTopic[], uid: string | null) => {
    if (!uid) { // Guest user
        try {
            const scopedKey = getScopedKey(SYLLABUS_TRACKING_KEY);
            const allProgressStr = localStorage.getItem(scopedKey);
            const allProgress = allProgressStr ? JSON.parse(allProgressStr) : {};
            allProgress[syllabusKey] = { checkedIds, syllabus };
            localStorage.setItem(scopedKey, JSON.stringify(allProgress));
        } catch (error) { console.error("Failed to save syllabus progress to localStorage", error); }
        return;
    }
    // Logged-in user
    try {
        const docRef = doc(db, 'users', uid, 'tracking', 'syllabus');
        await setDoc(docRef, { [syllabusKey]: { checkedIds, syllabus } }, { merge: true });
    } catch (error) {
        console.error("Failed to save syllabus progress to Firestore:", error);
    }
};


// --- Application Tracker Functions ---
export const getApplicationRecords = async (uid: string | null): Promise<ApplicationRecord[]> => {
    if (!uid) { // Guest
        try {
            const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
            const data = localStorage.getItem(scopedKey);
            return data ? JSON.parse(data) : [];
        } catch (error) { return []; }
    }
    // Logged-in
    try {
        const recordsCol = collection(db, 'users', uid, 'applications');
        const q = query(recordsCol);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data() as ApplicationRecord);
    } catch (error) {
        console.error("Failed to fetch application records from Firestore:", error);
        return [];
    }
};

export const saveApplicationRecord = async (record: Omit<ApplicationRecord, 'id'>, uid: string | null) => {
    const newRecord = { ...record, id: new Date().toISOString() };
    if (!uid) { // Guest
        try {
            const records = await getApplicationRecords(null);
            records.unshift(newRecord);
            const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
            localStorage.setItem(scopedKey, JSON.stringify(records));
        } catch (error) { console.error("Failed to save application record locally", error); }
        return;
    }
    // Logged-in
    try {
        const docRef = doc(db, 'users', uid, 'applications', newRecord.id);
        await setDoc(docRef, newRecord);
    } catch (error) {
        console.error("Failed to save application record to Firestore:", error);
    }
};

export const deleteApplicationRecord = async (id: string, uid: string | null) => {
    if (!uid) { // Guest
        try {
            const records = (await getApplicationRecords(null)).filter(r => r.id !== id);
            const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
            localStorage.setItem(scopedKey, JSON.stringify(records));
        } catch (error) { console.error("Failed to delete application record locally", error); }
        return;
    }
    // Logged-in
    try {
        const docRef = doc(db, 'users', uid, 'applications', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete application record from Firestore:", error);
    }
};


// --- Last Selection Persistence (Global) ---
export const getLastSelection = (): LastSelection | null => {
    try {
        const data = localStorage.getItem(LAST_SELECTION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) { return null; }
};

export const saveLastSelection = (selection: LastSelection) => {
    try {
        localStorage.setItem(LAST_SELECTION_KEY, JSON.stringify(selection));
    } catch (error) { console.error("Failed to save last selection", error); }
};

export const getStudyNotesFromCache = (topic: string, language: string): StudyMaterial | null => {
    const cacheKey = `study-notes-v3-${topic}-${language}`;
    const cachedEntry = getApiCache<StudyMaterial>(cacheKey);
    return cachedEntry ? cachedEntry.data : null;
};
