

import type { LearningProgress, QuizResult, SyllabusProgress, SyllabusTopic, ApplicationRecord, StudyMaterial, LastSelection } from '../types';

const TRACKING_KEY = 'govPrepAiLearningTracker';
const SYLLABUS_TRACKING_KEY = 'govPrepAiSyllabusTracker';
const APPLICATION_TRACKER_KEY = 'govPrepAiApplicationTracker';
const STUDY_NOTES_CACHE_KEY = 'govPrepAiStudyNotesCache';
const API_CACHE_KEY = 'govPrepAiApiCache';
const LAST_SELECTION_KEY = 'govPrepAiLastSelection';
// Fix: Add QUIZ_USAGE_KEY to fix import errors in QuizGenerator.tsx.
const QUIZ_USAGE_KEY = 'govPrepAiQuizUsage';

const API_CACHE_MAX_SIZE = 100;
const API_CACHE_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// --- API Cache Functions ---
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
        const data = localStorage.getItem(TRACKING_KEY);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (error) { return getDefaultData(); }
};

const saveData = (data: LearningProgress) => {
    try {
        localStorage.setItem(TRACKING_KEY, JSON.stringify(data));
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

// Fix: Add getQuizUsageToday and logQuizGeneration functions to fix import errors in QuizGenerator.tsx.
// --- Quiz Usage Tracker Functions ---
interface QuizUsage {
    date: string; // YYYY-MM-DD
    count: number;
}

export const getQuizUsageToday = (): number => {
    try {
        const usageStr = localStorage.getItem(QUIZ_USAGE_KEY);
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
        const usageStr = localStorage.getItem(QUIZ_USAGE_KEY);
        const today = new Date().toISOString().split('T')[0];
        let count = questionsGenerated;
        
        if (usageStr) {
            const usage: QuizUsage = JSON.parse(usageStr);
            if (usage.date === today) {
                count += usage.count;
            }
        }
        
        const newUsage: QuizUsage = { date: today, count };
        localStorage.setItem(QUIZ_USAGE_KEY, JSON.stringify(newUsage));
    } catch (error) {
        console.error("Failed to log quiz generation", error);
    }
};

// --- Syllabus Tracker Functions ---
export const getSyllabusProgress = (): SyllabusProgress => {
    try {
        const data = localStorage.getItem(SYLLABUS_TRACKING_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) { return {}; }
};

export const saveSyllabusProgress = (syllabusKey: string, checkedIds: string[], syllabus: SyllabusTopic[]) => {
    try {
        const allProgress = getSyllabusProgress();
        allProgress[syllabusKey] = { checkedIds, syllabus };
        localStorage.setItem(SYLLABUS_TRACKING_KEY, JSON.stringify(allProgress));
    } catch (error) { console.error("Failed to save syllabus progress", error); }
};

// --- Application Tracker Functions ---
export const getApplicationRecords = (): ApplicationRecord[] => {
    try {
        const data = localStorage.getItem(APPLICATION_TRACKER_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) { return []; }
};

export const saveApplicationRecord = (record: Omit<ApplicationRecord, 'id'>) => {
    try {
        const records = getApplicationRecords();
        records.unshift({ ...record, id: new Date().toISOString() });
        localStorage.setItem(APPLICATION_TRACKER_KEY, JSON.stringify(records));
    } catch (error) { console.error("Failed to save application record", error); }
};

export const deleteApplicationRecord = (id: string) => {
    try {
        const records = getApplicationRecords().filter(r => r.id !== id);
        localStorage.setItem(APPLICATION_TRACKER_KEY, JSON.stringify(records));
    } catch (error) { console.error("Failed to delete application record", error); }
};

// --- Study Notes Cache Functions ---
export const getStudyNotesFromCache = (topic: string, language: string): StudyMaterial | null => {
    try {
        const cacheStr = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
        if (!cacheStr) return null;
        return JSON.parse(cacheStr)[`${topic}-${language}`] || null;
    } catch (error) { return null; }
};

export const saveStudyNotesToCache = (topic: string, language: string, material: StudyMaterial) => {
    try {
        const cacheStr = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
        const cache = cacheStr ? JSON.parse(cacheStr) : {};
        cache[`${topic}-${language}`] = material;
        const keys = Object.keys(cache);
        if (keys.length > 50) delete cache[keys[0]];
        localStorage.setItem(STUDY_NOTES_CACHE_KEY, JSON.stringify(cache));
    } catch (error) { console.error("Failed to save study notes", error); }
};

// --- Last Selection Persistence ---
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