
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { getApiCache, setApiCache, isCacheStale } from '../utils/tracking';
import { getGlobalCache, saveGlobalCache } from '../firebase';
import type { 
    Quiz, StudyMaterial, JobNotification, ExamDetailGroup, DailyBriefingData, 
    GroundedSummary, StudyRoadmap, MindMapNode, GuessPaper, SolvingMethod, 
    Tutorial, DictionaryEntry, Flashcard, ExamStatusUpdate, 
    DeepDiveMaterial, AdaptiveLearningPath, QuizQuestion, Syllabus, SyllabusTopic,
    RankPrediction, PerformanceSummary, StoryTutorResponse
} from '../types';

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing. Please check your environment variables.");
            throw new Error("GEMINI_API_KEY is required to use AI features.");
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}

const ai = {
    get models() { return getAI().models; },
    get chats() { return getAI().chats; }
};

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_SMART = 'gemini-3.1-pro-preview';
// Efficient multimodal model for vision tasks to save costs
const MODEL_VISION_ECONOMY = 'gemini-2.5-flash'; 
const MODEL_LITE = 'gemini-3.1-flash-lite-preview';

const FAST_JSON_CONFIG = { responseMimeType: "application/json" };

const TTL = {
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    // Content generated with INFINITE TTL will effectively never expire.
    // It turns the AI into a static content generator. 
    // Once a topic is generated, it is retrieved from storage forever.
    INFINITE: Number.MAX_SAFE_INTEGER 
};

// Helper for base64 encoding (replacing Buffer for browser compatibility)
const encodeBase64 = (str: string): string => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(parseInt(p1, 16))
    ));
};

// Simple hash for cache keys (handling long strings/images)
const hashString = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return '0';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
};

// Helper to normalize input strings for cache keys
const normalize = (str: string | undefined) => str ? str.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'unknown';

async function makeApiCall<T>(apiCall: () => Promise<T>, description: string): Promise<T> {
    try {
        return await apiCall();
    } catch (error: any) {
        console.error(`Gemini API Error (${description}):`, error);
        throw new Error(`Failed to ${description}: ${error.message || 'Unknown error'}`);
    }
}

async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl: number = TTL.DAY, forceRefresh: boolean = false): Promise<T> {
    if (!forceRefresh) {
        // 1. Try Local Cache (Fastest - L1)
        const localCache = getApiCache<T>(key);
        if (localCache && !isCacheStale(localCache.timestamp, ttl)) {
            console.log(`[Cache Hit - L1] ${key}`);
            return localCache.data;
        }

        // 2. Try Global Cloud Cache (Persistent Knowledge Base - L2)
        // This simulates a Redis call to check if content exists in the universal cache.
        try {
            const globalResult = await getGlobalCache(key);
            if (globalResult && !isCacheStale(globalResult.timestamp, ttl)) {
                console.log(`[Cache Hit - L2] ${key}`);
                // Refresh local cache with global data to save future Firestore reads
                setApiCache(key, globalResult.data);
                return globalResult.data as T;
            }
        } catch (e) {
            console.warn("Global cache check failed:", e);
        }
    }

    console.log(`[Cache Miss - Generating] ${key}`);

    // 3. Fetch from API (Expensive - L3)
    const data = await fetcher();
    
    // 4. Update Local Cache
    setApiCache(key, data);
    
    // 5. Seed to Global Cache (Become the seeder for others)
    saveGlobalCache(key, data).catch(err => console.warn("Failed to seed global cache:", err));
    
    return data;
}

function parseJsonResponse<T>(text: string | undefined): T {
    if (!text) throw new Error("Empty response from AI");
    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("JSON Parse Error:", e, text);
        throw new Error("The AI returned a response that was not valid JSON.");
    }
}

function getSmartModel(type: 'FAST' | 'SMART' = 'FAST', isTrial: boolean = false) {
    if (isTrial) return MODEL_FAST; // Force Flash model for trial users
    return type === 'SMART' ? MODEL_SMART : MODEL_FAST;
}

// --- Exports ---

// 1. Generate Shortcuts
export const generateShortcuts = async (topic: string, language: string): Promise<SolvingMethod[]> => {
    // Key: aptitude:shortcuts:{topic}:{language}
    const cacheKey = `aptitude:shortcuts:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide 3 distinct methods to solve typical problems related to "${topic}" (Aptitude/Reasoning).
        1. Method 1: Standard/Traditional Textbook Method.
        2. Method 2: Logical or Ratio-based Approach.
        3. Method 3: Shortcut Trick, Formula, or Option Elimination.
        Return JSON array: [{ "title": string, "explanation": string, "example": "Worked out example" }].
        Language: ${language}.`;
        
        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Shortcuts');
        return parseJsonResponse<SolvingMethod[]>(response.text);
    }, TTL.INFINITE);
};

// 2. Additional Shortcut
export const generateAdditionalShortcut = async (topic: string, language: string, currentCount: number): Promise<SolvingMethod> => {
    // Key: aptitude:shortcut_extra:{topic}:{language}:{count}
    const cacheKey = `aptitude:shortcut_extra:${normalize(topic)}:${normalize(language)}:${currentCount}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a distinct, alternative method (Method #${currentCount + 1}) to solve typical problems related to "${topic}" (Aptitude/Reasoning).
        Return JSON: { "title": string, "explanation": string, "example": "Worked out example" }
        Language: ${language}.`;
        
        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Additional Shortcut');
        return parseJsonResponse<SolvingMethod>(response.text);
    }, TTL.INFINITE);
};

// 3. Solve Image Query (Doubt Solver)
export const solveImageQuery = async (base64: string, mimeType: string, query: string, language: string): Promise<string> => {
    // Key: doubt:image:{hash}:{query}:{language}
    const imgHash = hashString(base64);
    const cacheKey = `doubt:image:${imgHash}:${normalize(query)}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `You are an expert tutor. Solve this doubt provided in the image. 
        Context/User Query: ${query}
        Language: ${language}.
        Provide a clear, step-by-step explanation.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: MODEL_VISION_ECONOMY,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: prompt }
                ]
            }
        }), 'Solve Image Query');
        return response.text || "I couldn't analyze the image.";
    }, TTL.INFINITE);
};

// 4. Get Explanation for Answer (Quiz)
export const getExplanationForAnswer = async (question: any, answer: string, language: string): Promise<string> => {
    // Key: quiz:explanation:{question_hash}:{answer}:{language}
    // Using question hash as the question itself is unique content.
    const qHash = encodeBase64(question.question).substring(0, 30);
    const cacheKey = `quiz:explanation:${qHash}:${normalize(answer)}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Question: ${question.question}
        Correct Answer: ${question.correctAnswer}
        Selected/Option to explain: ${answer}
        
        Explain why "${answer}" is correct or incorrect. Keep it concise (under 50 words). Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt
        }), 'Get Explanation');
        return response.text || "No explanation available.";
    }, TTL.INFINITE);
};

// 5. Generate Quiz
export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number, language: string, examContext: string): Promise<Quiz> => {
    // Key: quiz:static:{exam}:{topic}:{difficulty}:{count}:{language}
    const cacheKey = `quiz:static:${normalize(examContext)}:${normalize(topic)}:${normalize(difficulty)}:${numQuestions}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a ${difficulty} quiz with ${numQuestions} multiple-choice questions on "${topic}" for ${examContext}.
        Return JSON: { "title": string, "questions": [{ "question": string, "options": string[], "correctAnswer": string, "questionEnglish": string (if language is not English), "optionsEnglish": string[] (if language is not English) }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Generate Quiz');
        return parseJsonResponse<Quiz>(response.text);
    }, TTL.INFINITE);
};

// 6. Mock Interview Session - Realtime (No caching for chat stream start)
export const createInterviewSession = (jobRole: string, language: string): Chat => {
    return ai.chats.create({
        model: MODEL_LITE,
        config: {
            systemInstruction: `You are a strict but helpful interviewer for the role of ${jobRole}. 
            Conduct a mock interview. Ask one question at a time. Evaluate the answer, then ask the next question.
            Language: ${language}.`
        }
    });
};

// 7. Syllabus Info for Interview
export const generateSyllabusInfo = async (jobRole: string, language: string): Promise<string> => {
    // Key: interview:syllabus:{role}:{language}
    const cacheKey = `interview:syllabus:${normalize(jobRole)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a brief summary of the typical syllabus or key topics for an interview for the role of ${jobRole}. Language: ${language}.`;
        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt
        }), 'Interview Syllabus');
        return response.text || "";
    }, TTL.INFINITE);
};

// 8. Send Message to Chat Stream
export const sendMessageToChatStream = async (chat: Chat, message: string): Promise<AsyncIterable<Partial<GenerateContentResponse>>> => {
    // Must pass an object with a 'message' property
    return await chat.sendMessageStream({ message });
};

// 9. Generate Exam Details
export const generateExamDetails = async (exam: string, subCategory: string, tier: string, language: string, level: string): Promise<ExamDetailGroup[]> => {
    // Key: exam:details:{exam}:{subcategory}:{tier}:{language}
    const cacheKey = `exam:details:${normalize(exam)}:${normalize(subCategory)}:${normalize(tier)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide detailed eligibility criteria, pattern, and key details for ${exam} - ${subCategory} ${tier ? `(${tier})` : ''} (${level}).
        Return JSON array: [{ "groupTitle": string, "details": [{ "criteria": string, "details": string }] }].
        Include Age Limit, Qualification, Exam Pattern, and Important Dates (generic). Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Exam Details');
        return parseJsonResponse<ExamDetailGroup[]>(response.text);
    }, TTL.INFINITE);
};

// 10. Generate Study Notes
export const generateStudyNotes = async (topic: string, language: string, mainTopic?: string, examContext?: string, isTrial?: boolean): Promise<StudyMaterial> => {
    // Key: learn:notes:{topic}:{subtopic}:{examContext}:{language}
    const cacheKey = `learn:notes:${normalize(topic)}:${normalize(mainTopic || 'general')}:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const context = mainTopic ? `(Sub-topic of ${mainTopic})` : '';
        const examCtx = examContext ? `for ${examContext}` : '';
        const prompt = `Create study material for "${topic}" ${context} ${examCtx}.
        Return JSON: { 
            "notes": "Detailed notes in markdown", 
            "summary": "Concise summary", 
            "story": "A short analogy or story to explain concepts", 
            "practiceQuestions": [{ "question": string, "answer": string }],
            "shortcutsAndTricks": "Tips/Tricks/Formulas",
            "imageUrl": null 
        }. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Study Notes');
        return parseJsonResponse<StudyMaterial>(response.text);
    }, TTL.INFINITE);
};

// 11. Generate Tutorial
export const generateTutorialForTopic = async (topic: string, language: string, examContext: string, isTrial?: boolean): Promise<Tutorial> => {
    // Key: learn:tutorial:{topic}:{examContext}:{language}
    const cacheKey = `learn:tutorial:${normalize(topic)}:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create a step-by-step tutorial for "${topic}" for ${examContext}.
        Return JSON: { "title": string, "introduction": string, "prerequisites": string[], "steps": [{ "step": number, "title": string, "content": string, "example": string }], "workedExample": string, "commonPitfalls": string[], "summary": string, "nextSteps": string[] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Tutorial');
        return parseJsonResponse<Tutorial>(response.text);
    }, TTL.INFINITE);
};

// 12. Fetch Job Notifications
export const fetchLatestJobNotifications = async (language: string, isTrial?: boolean): Promise<JobNotification[]> => {
    // Key: live:jobs:{language} (Dynamic content, uses Time TTL)
    const cacheKey = `live:jobs:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `List 30 latest active government job notifications in India (Central/State).
        Prioritize jobs with high vacancies. Sort the list descending by vacancy count.
        Use Google Search grounding to get real and up-to-date data.
        Return JSON array: [{
            "postName": string,
            "organization": string,
            "vacancies": string,
            "eligibility": string,
            "startDate": string,
            "lastDate": string,
            "link": string
        }].
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }] 
            }
        }), 'Job Notifications');
        return parseJsonResponse<JobNotification[]>(response.text);
    }, TTL.HOUR * 4);
};

// 13. Generate Syllabus (Flat)
export const generateSyllabusForExam = async (exam: string, subCategory: string, tier: string, language: string, level: string, state?: string): Promise<Syllabus> => {
    // Key: syllabus:flat:{exam}:{subcategory}:{tier}:{state}:{language}
    const cacheKey = `syllabus:flat:${normalize(exam)}:${normalize(subCategory)}:${normalize(tier)}:${normalize(state)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const stateStr = state ? `State: ${state}, ` : '';
        const prompt = `Generate a comprehensive syllabus for ${exam} - ${subCategory} ${tier ? `(${tier})` : ''} (${level}). ${stateStr}
        Return JSON array: [{ "subject": string, "topics": string[] }].
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Syllabus Flat');
        return parseJsonResponse<Syllabus>(response.text);
    }, TTL.INFINITE);
};

// 14. Micro Topics
export const generateMicroTopics = async (topic: string, language: string, examContext: string): Promise<string[]> => {
    // Key: syllabus:micro:{topic}:{examContext}:{language}
    const cacheKey = `syllabus:micro:${normalize(topic)}:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Break down the topic "${topic}" into 5-10 specific micro-topics or sub-concepts for ${examContext}.
        Return JSON array of strings. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Micro Topics');
        return parseJsonResponse<string[]>(response.text);
    }, TTL.INFINITE);
};

// 15. Predict Rank
export const predictRank = async (performance: PerformanceSummary, exam: string, language: string): Promise<RankPrediction> => {
    // Key: analyze:rank:{exam}:{language}:{perf_hash}
    const perfHash = hashString(JSON.stringify(performance));
    const cacheKey = `analyze:rank:${normalize(exam)}:${normalize(language)}:${perfHash}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Based on this performance: ${JSON.stringify(performance)}, predict a simulated rank range for ${exam}.
        Return JSON: { "predictedRank": string, "analysis": string, "recommendations": string[] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Predict Rank');
        return parseJsonResponse<RankPrediction>(response.text);
    }, TTL.INFINITE);
};

// 16. Generate Syllabus (Hierarchical)
export const generateSyllabus = async (exam: string, language: string, state?: string): Promise<SyllabusTopic[]> => {
    // Key: syllabus:tree:{exam}:{state}:{language}
    const cacheKey = `syllabus:tree:${normalize(exam)}:${normalize(state)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const stateContext = state ? `for ${state}` : '';
        const prompt = `Generate a hierarchical syllabus structure for ${exam} ${stateContext}.
        Return JSON array: [{ "id": string, "title": string, "details": string, "children": [ ...recursive ] }].
        Limit depth to 2 levels. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Syllabus Hierarchy');
        return parseJsonResponse<SyllabusTopic[]>(response.text);
    }, TTL.INFINITE);
};

// 17. Status Update
export const generateStatusUpdate = async (exam: string, subCategory: string, tier: string, language: string, type: string, isTrial?: boolean): Promise<ExamStatusUpdate> => {
    // Key: live:status:{exam}:{subcategory}:{tier}:{type}:{language}
    const cacheKey = `live:status:${normalize(exam)}:${normalize(subCategory)}:${normalize(tier)}:${normalize(type)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Check the latest status of ${type} for ${exam} - ${subCategory} ${tier}.
        Use Google Search.
        Return JSON: { "status": string (e.g. Announced, Pending), "details": string, "link": string (official URL) }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }] 
            }
        }), 'Status Update');
        
        const data = parseJsonResponse<ExamStatusUpdate>(response.text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (sources) {
            data.sources = sources;
        }
        return data;
    }, TTL.HOUR);
};

// 18. Daily Briefing
export const generateDailyBriefing = async (language: string, isTrial?: boolean): Promise<DailyBriefingData> => {
    // Key: live:daily_briefing:{language}:{date}
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:daily_briefing:${normalize(language)}:${today}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a daily briefing on current affairs relevant for competitive exams in India.
        Include 150 words summary and 3 MCQs.
        Return JSON: { "summary": "markdown text", "mcqs": [{ "question": string, "options": string[], "correctAnswer": string }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }] 
            }
        }), 'Daily Briefing');
        
        const data = parseJsonResponse<DailyBriefingData>(response.text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (sources) data.sources = sources;
        return data;
    }, TTL.DAY);
};

// 19. Grounded Summary (Current Affairs)
export const generateGroundedSummary = async (topic: string, language: string, frequency: string, examContext: string, isTrial?: boolean): Promise<GroundedSummary> => {
    // Key: live:news_summary:{topic}:{frequency}:{language}
    const cacheKey = `live:news_summary:${normalize(topic)}:${normalize(frequency)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Summarize ${frequency} current affairs ${topic ? `focused on "${topic}"` : ''} relevant for ${examContext}.
        Use Google Search. Return text summary. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        }), 'Grounded Summary');
        
        return {
            text: response.text || "No summary generated.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.DAY);
};

// 20. Current Affairs Chat
export const createCurrentAffairsChat = (topic: string, context: string, language: string, frequency: string, examContext: string, isTrial?: boolean): Chat => {
    return ai.chats.create({
        model: getSmartModel('SMART', isTrial),
        config: {
            systemInstruction: `You are a Current Affairs expert for ${examContext}. 
            Context provided: ${context}.
            Topic: ${topic}. Frequency: ${frequency}.
            Answer follow-up questions based on this context and general knowledge. Language: ${language}.`
        }
    });
};

// 21. Mind Map
export const generateMindMap = async (topic: string, language: string): Promise<MindMapNode> => {
    // Key: visual:mindmap:{topic}:{language}
    const cacheKey = `visual:mindmap:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create a mind map for "${topic}".
        Return JSON: { "name": "${topic}", "children": [{ "name": string, "children": [...] }] }.
        Limit depth to 3. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Mind Map');
        return parseJsonResponse<MindMapNode>(response.text);
    }, TTL.INFINITE);
};

// 22. Guess Paper
export const generateGuessPaper = async (topic: string, language: string, examContext: string, isTrial?: boolean): Promise<GuessPaper> => {
    // Key: quiz:guess_paper:{exam}:{topic}:{language}
    const cacheKey = `quiz:guess_paper:${normalize(examContext)}:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a guess paper (predicted questions) for "${topic}" for ${examContext}.
        Return JSON: { "title": string, "questions": [{ "question": string, "answer": string }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Guess Paper');
        return parseJsonResponse<GuessPaper>(response.text);
    }, TTL.INFINITE);
};

// 23. Study Roadmap
export const generateStudyRoadmap = async (examContext: string, language: string, topics?: string[], isTrial?: boolean): Promise<StudyRoadmap> => {
    // Key: learn:roadmap:{exam}:{language}:{topic_hash}
    const topicKey = topics ? normalize(topics.sort().join(',')) : 'all';
    const cacheKey = `learn:roadmap:${normalize(examContext)}:${normalize(language)}:${topicKey}`;
    return getCachedData(cacheKey, async () => {
        const topicCtx = topics ? `Focus on these topics: ${topics.join(', ')}` : '';
        const prompt = `Create a study roadmap for ${examContext}. ${topicCtx}
        Return JSON: { "title": string, "phases": [{ "phaseTitle": string, "strategy": string, "topics": string[] }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Study Roadmap');
        return parseJsonResponse<StudyRoadmap>(response.text);
    }, TTL.INFINITE);
};

// 24. Story Tutor
export const generateStoryForTopic = async (topic: string, language: string, isTrial?: boolean): Promise<StoryTutorResponse> => {
    // Key: learn:story:{topic}:{language}
    const cacheKey = `learn:story:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Explain "${topic}" using a creative, engaging story or analogy.
        Before the story, provide 3-4 "Pre-points" (bullet points) that summarize the key concepts needed to understand the story or that the story illustrates.
        After the story, provide a "Challenge Question" related to the topic and explain how to "Solve it using the Story".
        
        Return JSON: {
          "prePoints": ["point 1", "point 2", ...],
          "story": "The story text...",
          "challengeQuestion": "The specific question...",
          "solutionWithStory": "Explanation solving the question using the story..."
        }
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Story Tutor');
        return parseJsonResponse<StoryTutorResponse>(response.text);
    }, TTL.INFINITE);
};

// 25. General Chat
export const createGeneralChat = (language: string, isTrial?: boolean): Chat => {
    return ai.chats.create({
        model: getSmartModel('SMART', isTrial),
        config: {
            systemInstruction: `You are a helpful AI Tutor for competitive exams. Language: ${language}.`
        }
    });
};

// 26. Prompt Suggestions
export const generatePromptSuggestions = async (examContext: string, language: string): Promise<string[]> => {
    // Key: chat:prompts:{exam}:{language}
    const cacheKey = `chat:prompts:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Suggest 4 quick questions a student might ask about ${examContext}.
        Return JSON array of strings. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Prompt Suggestions');
        return parseJsonResponse<string[]>(response.text);
    }, TTL.INFINITE);
};

// 27. Concept Link Map
export const generateConceptLinkMap = async (topic: string, language: string, isTrial?: boolean): Promise<MindMapNode> => {
    // Key: visual:concept_map:{topic}:{language}
    const cacheKey = `visual:concept_map:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        // Reusing MindMapNode type structure for concept map
        const prompt = `Create a concept link map for "${topic}" showing prerequisites and related concepts.
        Return JSON: { "name": "${topic}", "children": [{ "name": string, "children": [...] }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Concept Link Map');
        return parseJsonResponse<MindMapNode>(response.text);
    }, TTL.INFINITE);
};

// 28. Teach Back Session
export const createTeachBackSession = (topic: string, language: string, isTrial?: boolean): Chat => {
    return ai.chats.create({
        model: getSmartModel('SMART', isTrial),
        config: {
            systemInstruction: `You are a student learning about "${topic}". The user is the teacher.
            Listen to their explanation. Ask clarification questions if they miss key points or are unclear.
            Finally, summarize what you learnt. Language: ${language}.`
        }
    });
};

// 29. Evaluate User Summary
export const evaluateUserSummary = async (topic: string, summary: string, language: string, isTrial?: boolean): Promise<string> => {
    // Key: eval:summary:{topic}:{language}:{hash}
    const summaryHash = hashString(summary);
    const cacheKey = `eval:summary:${normalize(topic)}:${normalize(language)}:${summaryHash}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Evaluate this summary of "${topic}": "${summary}".
        Point out missing key concepts, inaccuracies, and give it a score out of 10. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt
        }), 'Evaluate Summary');
        return response.text || "Could not evaluate.";
    }, TTL.INFINITE);
};

// 30. Real Life Examples
export const generateRealLifeExamples = async (topic: string, language: string, isTrial?: boolean): Promise<string> => {
    // Key: learn:examples:{topic}:{language}
    const cacheKey = `learn:examples:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide 3 real-life examples or applications of "${topic}".
        Explain how the concept is used in the real world. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt
        }), 'Real Life Examples');
        return response.text || "No examples found.";
    }, TTL.INFINITE);
};

// 31. Career Advice
export const getCareerPathAdvice = async (role: string, performance: PerformanceSummary, language: string, isTrial?: boolean): Promise<string> => {
    // Key: career:advice:{role}:{language}:{perf_hash}
    const perfHash = hashString(JSON.stringify(performance));
    const cacheKey = `career:advice:${normalize(role)}:${normalize(language)}:${perfHash}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Give career advice for someone aspiring to be a "${role}".
        User Performance Context: ${JSON.stringify(performance)}.
        Suggest strengths to leverage and areas to improve. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt
        }), 'Career Advice');
        return response.text || "No advice generated.";
    }, TTL.INFINITE);
};

// 32. Skill Plan
export const generateSkillDevelopmentPlan = async (skill: string, language: string, isTrial?: boolean): Promise<string> => {
    // Key: career:skill_plan:{skill}:{language}
    const cacheKey = `career:skill_plan:${normalize(skill)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create a skill development plan for "${skill}".
        Include timeline and key milestones. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt
        }), 'Skill Plan');
        return response.text || "No plan generated.";
    }, TTL.INFINITE);
};

// 33. Find Resources
export const findUpskillingResources = async (skill: string, language: string, isTrial?: boolean): Promise<GroundedSummary> => {
    // Key: career:resources:{skill}:{language}
    const cacheKey = `career:resources:${normalize(skill)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Find top free online resources (courses, articles, videos) to learn "${skill}".
        Use Google Search. Return list with links. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        }), 'Find Resources');
        
        return {
            text: response.text || "No resources found.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.INFINITE);
};

// 34. Resume Summary
export const generateResumeSummary = async (userInput: string, language: string, isTrial?: boolean): Promise<string> => {
    // Key: career:resume:{input_hash}:{language}
    const inputHash = hashString(userInput);
    const cacheKey = `career:resume:${inputHash}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a professional resume summary based on this info: ${userInput}.
        Keep it impactful and concise. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt
        }), 'Resume Summary');
        return response.text || "";
    }, TTL.INFINITE);
};

// 35. Dictionary Definition
export const getDictionaryDefinition = async (word: string, language: string): Promise<DictionaryEntry> => {
    // Key: tool:dictionary:{word}:{language}
    const cacheKey = `tool:dictionary:${normalize(word)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Define "${word}".
        Return JSON: { "word": "${word}", "partOfSpeech": string, "definition": string, "example": string }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Dictionary');
        return parseJsonResponse<DictionaryEntry>(response.text);
    }, TTL.INFINITE);
};

// 36. Flashcards
export const generateFlashcards = async (topic: string, count: number, language: string): Promise<Flashcard[]> => {
    // Key: tool:flashcards:{topic}:{count}:{language}
    const cacheKey = `tool:flashcards:${normalize(topic)}:${count}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate ${count} flashcards for "${topic}".
        Return JSON array: [{ "front": string, "back": string }].
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Flashcards');
        return parseJsonResponse<Flashcard[]>(response.text);
    }, TTL.INFINITE);
};

// 37. PYQ
export const fetchPreviousYearQuestions = async (examContext: string, language: string, isTrial?: boolean): Promise<GroundedSummary> => {
    // Key: learn:pyq:{exam}:{language}
    const cacheKey = `learn:pyq:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Find previous year questions for ${examContext}.
        Use Google Search. Return questions with years. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        }), 'PYQ');
        
        return {
            text: response.text || "No questions found.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.WEEK);
};

// 38. Deep Dive
export const generateDeepDiveForTopic = async (topic: string, language: string, examContext: string, isTrial?: boolean): Promise<DeepDiveMaterial> => {
    // Key: learn:deep_dive:{topic}:{examContext}:{language}
    const cacheKey = `learn:deep_dive:${normalize(topic)}:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a deep dive analysis for "${topic}" for ${examContext}.
        Return JSON: { "coreConcepts": string[], "realWorldExample": string, "commonMistakes": string[], "quickQuiz": [{ "question": string, "answer": string }], "relatedTopics": string[] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Deep Dive');
        return parseJsonResponse<DeepDiveMaterial>(response.text);
    }, TTL.INFINITE);
};

// 39. Diagnostic Quiz (Adaptive)
export const generateDiagnosticQuiz = async (topics: string[], language: string, examContext: string): Promise<Quiz> => {
    // Key: adapt:diagnostic_quiz:{topics_hash}:{exam}:{language}
    const topicHash = hashString(topics.sort().join('-').toLowerCase());
    const cacheKey = `adapt:diagnostic_quiz:${topicHash}:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a diagnostic quiz to assess knowledge on these topics: ${topics.slice(0, 5).join(', ')}... for ${examContext}.
        5 Questions. Return JSON Quiz format. Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Diagnostic Quiz');
        return parseJsonResponse<Quiz>(response.text);
    }, TTL.INFINITE);
};

// 40. Adaptive Path
export const generateAdaptivePath = async (examContext: string, quizResults: any[], language: string, isTrial?: boolean): Promise<AdaptiveLearningPath> => {
    // Key: adapt:path:{exam}:{results_hash}:{language}
    const resultHash = hashString(JSON.stringify(quizResults));
    const cacheKey = `adapt:path:${normalize(examContext)}:${resultHash}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Create an adaptive learning path for ${examContext} based on these diagnostic results: ${JSON.stringify(quizResults)}.
        Return JSON: { "title": string, "initialAssessment": string, "steps": [{ "step": number, "action": "Review Concept" | "Deep Dive" | "Practice Questions" | "Final Quiz", "topic": string, "subject": string, "rationale": string }] }.
        Language: ${language}.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: getSmartModel('SMART', isTrial),
            contents: prompt,
            config: FAST_JSON_CONFIG
        }), 'Adaptive Path');
        return parseJsonResponse<AdaptiveLearningPath>(response.text);
    }, TTL.INFINITE);
};

// 41. Solve Homework Problem
export const solveHomeworkProblem = async (base64: string, mimeType: string, query: string, language: string): Promise<string> => {
    // Key: homework:solve:{image_hash}:{query}:{language}
    const imgHash = hashString(base64);
    const cacheKey = `homework:solve:${imgHash}:${normalize(query)}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `You are an expert academic tutor. Solve the homework problem provided in the image.
        Context/User Instruction: ${query}
        Language: ${language}.
        Provide a detailed, step-by-step solution.`;

        const response = await makeApiCall<GenerateContentResponse>(() => ai.models.generateContent({
            model: MODEL_VISION_ECONOMY,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: prompt }
                ]
            }
        }), 'Solve Homework');
        return response.text || "I couldn't analyze the homework image.";
    }, TTL.INFINITE);
};
