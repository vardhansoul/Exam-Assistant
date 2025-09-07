import type { LearningProgress, QuizResult, SyllabusProgress, SyllabusTopic, ApplicationRecord, StudyMaterial, LastSelection } from '../types';

const TRACKING_KEY = 'govPrepAiLearningTracker';
const SYLLABUS_TRACKING_KEY = 'govPrepAiSyllabusTracker';
const APPLICATION_TRACKER_KEY = 'govPrepAiApplicationTracker';
const STUDY_NOTES_CACHE_KEY = 'govPrepAiStudyNotesCache';
const API_CACHE_KEY = 'govPrepAiApiCache';
const LAST_SELECTION_KEY = 'govPrepAiLastSelection';
const API_CACHE_MAX_SIZE = 100; // Store up to 100 API responses
const API_CACHE_STALE_MS = 30 * 24 * 60 * 60 * 1000; // Data is stale after 30 days

// --- API Cache Functions for Offline Support ---

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
    } catch (error) {
        console.error("Failed to read from API cache", error);
        return null;
    }
};

export const setApiCache = <T>(key: string, data: T) => {
    try {
        const cacheStr = localStorage.getItem(API_CACHE_KEY);
        const cache = cacheStr ? JSON.parse(cacheStr) : {};
        
        cache[key] = {
            timestamp: Date.now(),
            data,
        };

        const keys = Object.keys(cache);
        if (keys.length > API_CACHE_MAX_SIZE) {
            // FIFO eviction policy
            delete cache[keys[0]];
        }
        localStorage.setItem(API_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error("Failed to write to API cache", error);
    }
};

export const isCacheStale = (timestamp: number): boolean => {
    return (Date.now() - timestamp) > API_CACHE_STALE_MS;
};

export const clearApiCache = () => {
    try {
        localStorage.removeItem(API_CACHE_KEY);
        console.log("API cache cleared.");
    } catch (error) {
        console.error("Failed to clear API cache", error);
    }
};


// --- Learning Tracker Functions ---

const getDefaultData = (): LearningProgress => ({
    studiedTopics: [],
    quizHistory: [],
});

export const getTrackingData = (): LearningProgress => {
    try {
        const data = localStorage.getItem(TRACKING_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to parse tracking data from localStorage", error);
    }
    return getDefaultData();
};

const saveData = (data: LearningProgress) => {
    try {
        localStorage.setItem(TRACKING_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save tracking data to localStorage", error);
    }
};

export const saveQuizResult = (result: QuizResult) => {
    const data = getTrackingData();
    data.quizHistory.unshift(result); // Add to the beginning of the array
    if (data.quizHistory.length > 20) { // Keep only the last 20 results
        data.quizHistory.pop();
    }
    saveData(data);
};

export const markTopicAsStudied = (topic: string) => {
    const data = getTrackingData();
    if (!data.studiedTopics.includes(topic)) {
        data.studiedTopics.push(topic);
        saveData(data);
    }
};

// --- Syllabus Tracker Functions ---

export const getSyllabusProgress = (): SyllabusProgress => {
    try {
        const data = localStorage.getItem(SYLLABUS_TRACKING_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Failed to parse syllabus progress data from localStorage", error);
        return {};
    }
};

export const saveSyllabusProgress = (
    syllabusKey: string,
    checkedIds: string[],
    syllabus: SyllabusTopic[]
) => {
    try {
        const allProgress = getSyllabusProgress();
        allProgress[syllabusKey] = { checkedIds, syllabus };
        localStorage.setItem(SYLLABUS_TRACKING_KEY, JSON.stringify(allProgress));
    } catch (error) {
        console.error("Failed to save syllabus progress to localStorage", error);
    }
};

// --- Application Tracker Functions ---

export const getApplicationRecords = (): ApplicationRecord[] => {
    try {
        const data = localStorage.getItem(APPLICATION_TRACKER_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse application records from localStorage", error);
        return [];
    }
};

export const saveApplicationRecord = (record: Omit<ApplicationRecord, 'id'>) => {
    try {
        const records = getApplicationRecords();
        const newRecord: ApplicationRecord = { ...record, id: new Date().toISOString() };
        records.unshift(newRecord);
        localStorage.setItem(APPLICATION_TRACKER_KEY, JSON.stringify(records));
    } catch (error) {
        console.error("Failed to save application record to localStorage", error);
    }
};

export const deleteApplicationRecord = (id: string) => {
    try {
        let records = getApplicationRecords();
        records = records.filter(record => record.id !== id);
        localStorage.setItem(APPLICATION_TRACKER_KEY, JSON.stringify(records));
    } catch (error) {
        console.error("Failed to delete application record from localStorage", error);
    }
};

// --- Study Notes Cache Functions ---

export const getStudyNotesFromCache = (topic: string, language: string): StudyMaterial | null => {
    try {
        const cacheStr = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
        if (!cacheStr) return null;
        const cache = JSON.parse(cacheStr);
        const key = `${topic}-${language}`;
        return cache[key] || null;
    } catch (error) {
        console.error("Failed to read study notes from cache", error);
        return null;
    }
};

export const saveStudyNotesToCache = (topic: string, language: string, material: StudyMaterial) => {
    try {
        const cacheStr = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
        const cache = cacheStr ? JSON.parse(cacheStr) : {};
        const key = `${topic}-${language}`;
        cache[key] = material;
        // Simple cache size limit to prevent localStorage from filling up
        const keys = Object.keys(cache);
        if (keys.length > 50) {
            delete cache[keys[0]]; // Remove the oldest entry (FIFO)
        }
        localStorage.setItem(STUDY_NOTES_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        // This can happen if localStorage is full.
        console.error("Failed to save study notes to cache", error);
    }
};

// --- Last Selection Persistence ---
export const getLastSelection = (): LastSelection | null => {
    try {
        const data = localStorage.getItem(LAST_SELECTION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Failed to parse last selection from localStorage", error);
        return null;
    }
};

export const saveLastSelection = (selection: LastSelection) => {
    try {
        localStorage.setItem(LAST_SELECTION_KEY, JSON.stringify(selection));
    } catch (error) {
        console.error("Failed to save last selection to localStorage", error);
    }
};