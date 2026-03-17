import type { QuizResult, LearningProgress, SyllabusProgress, ApplicationRecord, HistoryItem, HistoryType, DisplaySettings, LastSelection, UserNotes, SyllabusTopic, UserSession, ChatSession } from '../types';
import { db, saveUserDisplaySettings } from '../firebase';
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
        console.warn(`Error setting localStorage key “${key}”:`, error);
    }
};

// --- Active Component State Persistence ---
export const getComponentState = <T>(key: string): T | null => {
    return getLocalJson<T | null>(`active_state_${key}`, null);
};

export const saveComponentState = (key: string, data: any) => {
    if (data === null || data === undefined) {
        localStorage.removeItem(`active_state_${key}`);
    } else {
        setLocalJson(`active_state_${key}`, data);
    }
};

// --- API Caching ---
interface ApiCacheEntry {
    timestamp: number;
    data: any;
}
export const getApiCache = <T>(key: string): ApiCacheEntry | null => {
    return getLocalJson<ApiCacheEntry | null>(`api_cache_${key}`, null);
};
export const setApiCache = (key: string, data: any, timestamp: number = Date.now()) => {
    setLocalJson(`api_cache_${key}`, { timestamp, data });
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
        console.warn("Failed to load tracking data, using default:", e);
        return defaultData;
    }
};

const saveTrackingData = async (uid: string | null, data: LearningProgress) => {
    if (!uid) {
        setLocalJson(getStorageKey(null, 'tracking'), data);
        return;
    }
    await db.collection('users').doc(uid).collection('progress').doc('tracking').set(data, { merge: true });
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
    db.collection('activity_log').add({ ...fullItem, uid }).catch(e => console.warn("Failed to log global activity", e));

    try {
        await docRef.update({
            items: firebase.firestore.FieldValue.arrayUnion(fullItem)
        });
    } catch (err: any) {
        if(err.code === 'not-found') {
            await docRef.set({ items: [fullItem] });
        } else {
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
        setLocalJson(getStorageKey(null, 'syllabus'), updatedProgress);
        return;
    }
    await db.collection('users').doc(uid).collection('progress').doc('syllabus').set(updatedProgress);
};


// --- Bookmarks ---
export const getBookmarkedTopics = async (uid: string | null): Promise<string[]> => {
    let rawTopics: unknown;
    if (!uid) {
        rawTopics = getLocalJson(getStorageKey(null, 'bookmarks'), []);
    } else {
        try {
            const docSnap = await db.collection('users').doc(uid).collection('progress').doc('bookmarks').get();
            rawTopics = docSnap.exists ? docSnap.data()?.topics : [];
        } catch (e) {
            console.warn("Failed to load bookmarks:", e);
            rawTopics = [];
        }
    }
    
    if (Array.isArray(rawTopics)) {
        return rawTopics.filter((t): t is string => typeof t === 'string');
    }
    return [];
};

export const saveBookmarkedTopics = async (topics: string[], uid: string | null) => {
    if (!uid) {
        setLocalJson(getStorageKey(null, 'bookmarks'), topics);
        return;
    }
    await db.collection('users').doc(uid).collection('progress').doc('bookmarks').set({ topics });
};

// --- Last Selection ---
export const getLastSelection = async (uid: string | null): Promise<LastSelection | null> => {
    if (!uid) {
        return getLocalJson<LastSelection | null>(getStorageKey(null, 'lastSelection'), null);
    }
    try {
        const docSnap = await db.collection('users').doc(uid).collection('progress').doc('selection').get();
        return docSnap.exists ? (docSnap.data() as LastSelection) : null;
    } catch (e) {
        console.warn("Failed to load last selection:", e);
        return null;
    }
};

export const saveLastSelection = async (selection: LastSelection | null, uid: string | null) => {
    if (!uid) {
        setLocalJson(getStorageKey(null, 'lastSelection'), selection);
        return;
    }
    const docRef = db.collection('users').doc(uid).collection('progress').doc('selection');
    if (selection) {
        await docRef.set(selection);
    } else {
        await docRef.delete();
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
    await db.collection('users').doc(uid).collection('applications').doc(id).set(newRecord);
};

export const deleteApplicationRecord = async (id: string, uid: string | null) => {
    if (!uid) {
        let records = await getApplicationRecords(null);
        records = records.filter(r => r.id !== id);
        setLocalJson(getStorageKey(null, 'applications'), records);
        return;
    }
    await db.collection('users').doc(uid).collection('applications').doc(id).delete();
};


// --- Display Settings ---
const DISPLAY_SETTINGS_KEY = 'display_settings';
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
        if (session) {
            await docRef.set(session);
        } else {
            await docRef.delete();
        }
    }
};

// --- Trial & Auth Helpers ---

export const startTrial = () => {
    localStorage.setItem('trial_start_date', new Date().toISOString());
};

export const isTrialActive = (): boolean => {
    const startDateStr = localStorage.getItem('trial_start_date');
    if (!startDateStr) return false;
    const startDate = new Date(startDateStr);
    const now = new Date();
    // 7 days in milliseconds
    const diff = now.getTime() - startDate.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
};

export const getTrialDaysRemaining = (): number => {
    const startDateStr = localStorage.getItem('trial_start_date');
    if (!startDateStr) return 0;
    const startDate = new Date(startDateStr);
    const now = new Date();
    const diff = now.getTime() - startDate.getTime();
    const daysPassed = diff / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - daysPassed));
};

export const saveVerifiedPhoneNumber = (phoneNumber: string) => {
    localStorage.setItem('verified_phone_number', phoneNumber);
};

export const getVerifiedPhoneNumber = (): string | null => {
    return localStorage.getItem('verified_phone_number');
};

export const clearTrialData = () => {
    localStorage.removeItem('trial_start_date');
    localStorage.removeItem('verified_phone_number');
};

export const getDeviceFingerprint = async (): Promise<string> => {
    // Basic fingerprinting for trial limitation (User Agent + Screen + Timezone)
    const str = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}-${new Date().getTimezoneOffset()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
};

export const migrateGuestDataToUser = async (uid: string) => {
    // Migrate Display Settings
    const localSettings = getDisplaySettings();
    if (localSettings) {
        await saveUserDisplaySettings(uid, localSettings);
    }
    
    // Future: Migrate other local storage data like history or syllabus progress if needed.
};
