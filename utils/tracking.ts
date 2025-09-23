

import type { LearningProgress, QuizResult, SyllabusProgress, SyllabusTopic, ApplicationRecord, StudyMaterial, LastSelection } from '../types';
import { auth } from '../firebase';

const TRACKING_KEY = 'clubOfCompetitionLearningTracker';
const SYLLABUS_TRACKING_KEY = 'clubOfCompetitionSyllabusTracker';
const APPLICATION_TRACKER_KEY = 'clubOfCompetitionApplicationTracker';
const STUDY_NOTES_CACHE_KEY = 'clubOfCompetitionStudyNotesCache';
const API_CACHE_KEY = 'clubOfCompetitionApiCache';
const LAST_SELECTION_KEY = 'clubOfCompetitionLastSelection';
const QUIZ_USAGE_KEY = 'clubOfCompetitionQuizUsage';

const API_CACHE_MAX_SIZE = 100;
const API_CACHE_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days


// --- Scoped Key Helper ---
const getScopedKey = (baseKey: string): string => {
    const user = auth.currentUser;
    const scope = user ? user.uid : 'guest';
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

export const getTrackingData = (): LearningProgress => {
    try {
        const scopedKey = getScopedKey(TRACKING_KEY);
        const data = localStorage.getItem(scopedKey);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (error) { return getDefaultData(); }
};

const saveData = (data: LearningProgress) => {
    try {
        const scopedKey = getScopedKey(TRACKING_KEY);
        localStorage.setItem(scopedKey, JSON.stringify(data));
    } catch (error) { console.error("Failed to save tracking data", error); }
};

export const saveQuizResult = (result: QuizResult) => {
    const data = getTrackingData();
    data.quizHistory.unshift(result);
    if (data.quizHistory.length > 50) data.quizHistory.pop();
    saveData(data);
};

export const markTopicAsStudied = (topic: string) => {
    const data = getTrackingData();
    if (!data.studiedTopics.includes(topic)) {
        data.studiedTopics.push(topic);
        saveData(data);
    }
};

// --- Quiz Usage Tracker Functions ---
interface QuizUsage {
    date: string; // YYYY-MM-DD
    count: number;
}

export const getQuizUsageToday = (): number => {
    try {
        const scopedKey = getScopedKey(QUIZ_USAGE_KEY);
        const usageStr = localStorage.getItem(scopedKey);
        if (!usageStr) return 0;
        
        const usage: QuizUsage = JSON.parse(usageStr);
        const today = new Date().toISOString().split('T')[0];
        
        if (usage.date === today) {
            return usage.count;
        }
        
        return 0; // It's a new day
    } catch (error) {
        return 0;
    }
};

export const logQuizGeneration = (questionsGenerated: number) => {
    try {
        const scopedKey = getScopedKey(QUIZ_USAGE_KEY);
        const usageStr = localStorage.getItem(scopedKey);
        const today = new Date().toISOString().split('T')[0];
        let count = questionsGenerated;
        
        if (usageStr) {
            const usage: QuizUsage = JSON.parse(usageStr);
            if (usage.date === today) {
                count += usage.count;
            }
        }
        
        const newUsage: QuizUsage = { date: today, count };
        localStorage.setItem(scopedKey, JSON.stringify(newUsage));
    } catch (error) {
        console.error("Failed to log quiz generation", error);
    }
};

// --- Syllabus Tracker Functions ---
export const getSyllabusProgress = (): SyllabusProgress => {
    try {
        const scopedKey = getScopedKey(SYLLABUS_TRACKING_KEY);
        const data = localStorage.getItem(scopedKey);
        return data ? JSON.parse(data) : {};
    } catch (error) { return {}; }
};

export const saveSyllabusProgress = (syllabusKey: string, checkedIds: string[], syllabus: SyllabusTopic[]) => {
    try {
        const allProgress = getSyllabusProgress();
        allProgress[syllabusKey] = { checkedIds, syllabus };
        const scopedKey = getScopedKey(SYLLABUS_TRACKING_KEY);
        localStorage.setItem(scopedKey, JSON.stringify(allProgress));
    } catch (error) { console.error("Failed to save syllabus progress", error); }
};

// --- Application Tracker Functions ---
export const getApplicationRecords = (): ApplicationRecord[] => {
    try {
        const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
        const data = localStorage.getItem(scopedKey);
        return data ? JSON.parse(data) : [];
    } catch (error) { return []; }
};

export const saveApplicationRecord = (record: Omit<ApplicationRecord, 'id'>) => {
    try {
        const records = getApplicationRecords();
        records.unshift({ ...record, id: new Date().toISOString() });
        const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
        localStorage.setItem(scopedKey, JSON.stringify(records));
    } catch (error) { console.error("Failed to save application record", error); }
};

export const deleteApplicationRecord = (id: string) => {
    try {
        const records = getApplicationRecords().filter(r => r.id !== id);
        const scopedKey = getScopedKey(APPLICATION_TRACKER_KEY);
        localStorage.setItem(scopedKey, JSON.stringify(records));
    } catch (error) { console.error("Failed to delete application record", error); }
};

// --- Study Notes Cache Functions ---
export const getStudyNotesFromCache = (topic: string, language: string): StudyMaterial | null => {
    try {
        const scopedKey = getScopedKey(STUDY_NOTES_CACHE_KEY);
        const cacheStr = localStorage.getItem(scopedKey);
        if (!cacheStr) return null;
        return JSON.parse(cacheStr)[`${topic}-${language}`] || null;
    } catch (error) { return null; }
};

export const saveStudyNotesToCache = (topic: string, language: string, material: StudyMaterial) => {
    try {
        const scopedKey = getScopedKey(STUDY_NOTES_CACHE_KEY);
        const cacheStr = localStorage.getItem(scopedKey);
        const cache = cacheStr ? JSON.parse(cacheStr) : {};
        cache[`${topic}-${language}`] = material;
        const keys = Object.keys(cache);
        if (keys.length > 50) delete cache[keys[0]];
        localStorage.setItem(scopedKey, JSON.stringify(cache));
    } catch (error) { console.error("Failed to save study notes", error); }
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