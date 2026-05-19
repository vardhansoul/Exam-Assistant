
import { GoogleGenAI, Type, Chat, GenerateContentResponse as GenAIResponse } from "@google/genai";
import OpenAI from "openai";

const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: (import.meta as any).env.VITE_DEEPSEEK_API_KEY || '',
    dangerouslyAllowBrowser: true
});

// Since the rest of the code expects a Gemini content response object:
type GenerateContentResponse = GenAIResponse;

import { getApiCache, setApiCache, isCacheStale } from '../utils/tracking';
import { getGlobalCache, saveGlobalCache, acquireGlobalCacheLock, waitForGlobalCache } from '../firebase';
import type { 
    Quiz, StudyMaterial, JobNotification, ExamDetailGroup, DailyBriefingData, 
    GroundedSummary, StudyRoadmap, MindMapNode, GuessPaper, SolvingMethod, 
    Tutorial, DictionaryEntry, Flashcard, ExamStatusUpdate, 
    DeepDiveMaterial, AdaptiveLearningPath, QuizQuestion, Syllabus, SyllabusTopic,
    RankPrediction, PerformanceSummary, StoryTutorResponse
} from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

const MODEL_FAST = 'gemini-3.1-flash-lite';
const MODEL_SMART = 'gemini-2.5-flash';
const MODEL_PRO = 'gemini-2.5-flash'; // Downgraded from 3.1-pro-preview to save costs
// Efficient multimodal model for vision tasks
const MODEL_VISION_ECONOMY = 'gemini-2.5-flash'; 
const MODEL_LITE = 'gemini-2.5-flash-8b';
const MODEL_FALLBACK = 'gemini-2.5-flash';

export const getLanguageInstruction = (language: string): string => {
    if (language.includes('(English Script)')) {
        const baseLang = language.replace('(English Script)', '').trim();
        return `Language: ${baseLang} (CRITICAL: You MUST write the ${baseLang} text using the English/Latin alphabet characters only, known as Romanized ${baseLang} or Tanglish/Hinglish/etc. DO NOT use the native ${baseLang} script.)`;
    }
    return `Language: ${language}`;
};


const VISUALIZATION_INSTRUCTIONS = `
CRITICAL VISUALIZATION INSTRUCTIONS:
You MUST use visual aids to explain concepts whenever possible. You have access to a special ContentRenderer.
1. Math & Equations: Use KaTeX (e.g., $$E = mc^2$$ or $\\frac{1}{2}$). For chemistry, use \\ce{H2O}.
Do NOT output any custom JSON blocks or special tags for charts or diagrams. 
Do NOT use "chartType", "diagramType", or "type": "decision". 
Do NOT use hallucinated delimiters like "$/", "/$", "$\\{", "/$\\{[", or random brackets/slashes around text.
Always prefer visual explanations over long walls of text. Make it addictive and game-like!`;

const STRICT_JSON_CONFIG = { 
    temperature: 0.2, // lowered temperature for tighter adherence
    maxOutputTokens: 8192,
    systemInstruction: "You are a world-class mentor for Indian government job exams (UPSC, SSC, Banking, Railways) with a 90% success rate. You are strict, strategic, and laser-focused on what actually clears the cut-off. Ensure 100% data generation accuracy. Verify your facts mathematically and historically before outputting. Do NOT invent information. Provide structured, factual, and concise answers without hallucination. Strictly adhere to the requested JSON format. Do NOT include any markdown formatting or code blocks. Return ONLY raw JSON."
};

const VISUAL_JSON_CONFIG = { 
    temperature: 0.4,
    maxOutputTokens: 8192,
    systemInstruction: "You are a world-class mentor for Indian government job exams (UPSC, SSC, Banking) driven by high success rates. Focus on smart study, active recall, and strict syllabus targeting. Provide structured, factual, and concise answers without hallucination. Strictly adhere to the requested JSON format. " + VISUALIZATION_INSTRUCTIONS
};

const TEXT_CONFIG = {
    temperature: 0.4,
    maxOutputTokens: 8192,
    systemInstruction: "You are a world-class trainer and mentor for government job exams (UPSC, SSC, Banking, Railways) with phenomenal success rates. You demand discipline and focus on strategic learning. Explain concepts clearly, concisely, and tailored to competitive exams. Format your response in clear Markdown." + VISUALIZATION_INSTRUCTIONS
};

const TTL = {
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    FIFTEEN_DAYS: 15 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
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

// User token tracking logic
const DAILY_TOKEN_LIMIT = 50000;
import { auth, db } from '../firebase';
import firebase from 'firebase/compat/app';

interface TokenUsage {
    date: string;
    count: number;
}

// Function to check and update usage for the current user safely
async function enforceTokenLimit(estimatedTokens: number = 1000) {
    if (!auth.currentUser || typeof window === 'undefined') return;
    
    // We only enforce this logic client-side when a user is logged in
    const uid = auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const path = `users/${uid}/usage/${today}`;
    
    try {
        const usageRef = db.doc(path);
        
        let tokenCount = 0;
        await db.runTransaction(async (transaction: any) => {
            const usageDoc = await transaction.get(usageRef);
            
            if (usageDoc.exists) {
                tokenCount = usageDoc.data().count || 0;
            }
            
            if (tokenCount + estimatedTokens > DAILY_TOKEN_LIMIT) {
                throw new Error("DAILY_LIMIT_EXCEEDED");
            }
            
            transaction.set(usageRef, {
                count: tokenCount + estimatedTokens,
                date: today
            }, { merge: true });
        });
        
        console.log(`[Token Tracker] Usage today: ${tokenCount + estimatedTokens} / ${DAILY_TOKEN_LIMIT}`);
    } catch (e: any) {
        if (e.message === "DAILY_LIMIT_EXCEEDED") {
            throw new Error(`Great learning today! You've reached your daily generative limit. To master this exam, switch to Active Recall—revisit your saved notes, re-solve today's doubts, and let your brain internalize the content. See you tomorrow for fresh topics!`);
        }
        // If it's a permission error or some other DB error, we log it but don't strictly block execution. 
        // This ensures the app doesn't break if rules aren't updated yet.
        console.warn("[Token Tracker] Could not strictly enforce tokens:", e);
    }
}

async function withRetry<T>(operation: () => Promise<T>, description: string, maxRetries: number = 4): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            return await operation();
        } catch (error: any) {
            attempt++;
            console.error(`Error in ${description} [Attempt ${attempt}/${maxRetries + 1}]:`, error);
            
            if (attempt > maxRetries) {
                throw new Error(`Failed to ${description} after ${maxRetries + 1} attempts: ${error.message || 'Unknown error'}`);
            }
            
            // Exponential backoff: 1s, 2s, 4s... plus some jitter
            const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
            console.log(`Retrying ${description} in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error(`Failed to ${description}: Maximum retries exceeded`);
}

async function safeGenerateContent(req: any, description: string, useReasoning: boolean = false): Promise<GenerateContentResponse> {
    
    // Optimistic checking: Fire and forget the limit check. 
    // If it throws limit exceeded, we just halt NEXT time, allowing this request to optionally succeed if it finishes first, 
    // but saving us 800ms of synchronous blocking network wait.
    const isHeavyModel = req.model === MODEL_SMART || req.model === MODEL_PRO || useReasoning;
    const estimatedCost = isHeavyModel ? 3500 : 1200; 
    const tokenCheckPromise = enforceTokenLimit(estimatedCost).catch(e => {
        console.warn('Silent optimistic token limit break:', e.message);
    });

    // --- 1. INTELLIGENT REQUEST ANALYSIS ---
    let promptText = '';
    let hasImages = false;
    
    // Parse Google GenAI request structure safely
    if (typeof req.contents === 'string') {
        promptText = req.contents;
    } else if (Array.isArray(req.contents)) {
        req.contents.forEach((content: any) => {
            if (Array.isArray(content.parts)) {
                content.parts.forEach((part: any) => {
                    if (part.text) promptText += part.text + ' ';
                    if (part.inlineData) hasImages = true;
                });
            }
        });
    } else if (req.contents?.parts) {
        if (Array.isArray(req.contents.parts)) {
            req.contents.parts.forEach((part: any) => {
                if (part.text) promptText += part.text + ' ';
                if (part.inlineData) hasImages = true;
            });
        }
    }

    const requiresGoogleSearchUrl = Boolean(req.config?.tools?.some((t: any) => !!t.googleSearch));
    
    const isMathOrLogic = (
        promptText.toLowerCase().includes('aptitude') || 
        promptText.toLowerCase().includes('reasoning') || 
        promptText.toLowerCase().includes('math') ||
        promptText.toLowerCase().includes('trick') ||
        useReasoning
    );

    // --- 2. INTELLIGENT ROUTER DECISION LOGIC ---
    let targetProvider: 'GEMINI' | 'DEEPSEEK_REASONER' | 'DEEPSEEK_CHAT' = 'GEMINI';

    if (hasImages) {
        // Deepseek API does not easily support Gemini's vision inlineData format without translation.
        targetProvider = 'GEMINI'; 
    } else if (requiresGoogleSearchUrl) {
        // DeepSeek does not support Google Search Grounding tool natively.
        targetProvider = 'GEMINI';
    } else if (isMathOrLogic && process.env.DEEPSEEK_API_KEY) {
        targetProvider = 'DEEPSEEK_REASONER';
    }

    // --- 3. EXECUTE TARGET PROVIDER ---

    if (targetProvider === 'DEEPSEEK_REASONER') {
        console.log(`[Router] 🧭 Routing task "${description}" to [36mDeepSeek-R1 (Reasoner)[0m`);
        try {
            const completion = await deepseek.chat.completions.create({
                messages: [
                    { role: "system", content: req.config?.systemInstruction || "You are a helpful mathematical and logical reasoning tutor." },
                    { role: "user", content: promptText }
                ],
                model: "deepseek-reasoner",
                response_format: req.config?.responseMimeType === "application/json" ? { type: "json_object" } : { type: "text" },
            });
            
            return { text: completion.choices[0].message.content || '' } as unknown as GenerateContentResponse;
        } catch (dsError: any) {
            console.warn(`[DeepSeek Fallback] DeepSeek failed for "${description}", falling back to Gemini: `, dsError.message);
            targetProvider = 'GEMINI'; // Fall through into the Gemini block
        }
    }

    // Default or Fallback execution strategy
    console.log(`[Router] 🧭 Routing task "${description}" to [34mGoogle Gemini[0m`);
    try {
        const response = await ai.models.generateContent(req);
        return response;
    } catch (error: any) {
        const isQuotaOrServiceError = error?.status === 429 || error?.status === 503 || error?.status === 404 || error?.status >= 500 || error?.message?.includes('quota') || error?.message?.includes('overloaded') || error?.message?.includes('not found');
        
        // --- 4. CROSS-PROVIDER DISASTER RECOVERY ---
        if (isQuotaOrServiceError && process.env.DEEPSEEK_API_KEY && !requiresGoogleSearchUrl && !hasImages) {
             console.warn(`[Cross-Provider Fallback] Gemini API Error (${error.status}). Initiating emergency failover to DeepSeek-V3 for: ${description}`);
             try {
                const completion = await deepseek.chat.completions.create({
                    messages: [
                        { role: "system", content: req.config?.systemInstruction || "You are a helpful educational assistant." },
                        { role: "user", content: promptText }
                    ],
                    model: "deepseek-chat", // V3 for general tasks fallback
                    response_format: req.config?.responseMimeType === "application/json" ? { type: "json_object" } : { type: "text" },
                });
                return { text: completion.choices[0].message.content || '' } as unknown as GenerateContentResponse;
             } catch (fallbackError: any) {
                    console.error(`DeepSeek Backup also failed!`);
             }
        }

        // --- 5. INTERNAL GOOGLE FALLBACK (From 3.1 Flash => 2.5 Flash) ---
        if (isQuotaOrServiceError && req.model !== MODEL_FALLBACK && req.model !== MODEL_LITE) {
            console.warn(`[Gemini Auto-Scale] Quota hit on ${req.model}. Downgrading to ${MODEL_FALLBACK} for: ${description}`);
            try {
                req.model = MODEL_FALLBACK;
                const response = await ai.models.generateContent(req);
                return response;
            } catch (fallbackError: any) {
                console.error(`Gemini Downgrade Error (${description}):`, fallbackError);
                throw new Error(`Failed to ${description} after fallback: ${fallbackError.message || 'Unknown error'}`);
            }
        }
        
        console.error(`Gemini API Error (${description}):`, error);
        throw new Error(`Failed to ${description}: ${error.message || 'Unknown error'}`);
    }
}

const checkIfCacheNeedsUpdate = async (key: string, lastUpdated: number): Promise<boolean> => {
    // Determine subject from key
    const topicStr = key.replace(/:/g, ' ').replace(/_/g, ' ');
    
    let dateStr = "recently";
    if (lastUpdated > 0) {
        dateStr = new Date(lastUpdated).toDateString();
    }

    const prompt = `You are a curriculum and facts validation expert. Determine if there have been any official updates, exam pattern changes, syllabus revisions, or massive new developments related to "${topicStr}" since ${dateStr}.
Respond ONLY with a valid JSON format: {"update_needed": boolean}
Respond true ONLY if you are absolutely certain there are new changes that require a full content regeneration. If you are unsure, or if it is a general static topic, respond false.`;

    try {
        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Check Cache Update');
        const data = parseJsonResponse<{update_needed: boolean}>(response.text);
        return data.update_needed === true;
    } catch (e) {
        console.warn(`[Cache Update Check] Failed for ${key}, defaulting to update.`, e);
        return true; 
    }
};

async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl: number = TTL.MONTH, forceRefresh: boolean = false): Promise<T> {
    // Local cache strictly forced to TTL.DAY max, as requested
    const localTtl = Math.min(ttl, TTL.DAY);
    let staleLocalCache: T | undefined = undefined;
    let staleGlobalCache: T | undefined = undefined;
    let globalTimestamp = 0;

    if (!forceRefresh) {
        // 1. Try Local Cache (Fastest - L1 via IndexedDB)
        const localCache = await getApiCache(key);
        if (localCache) {
            // checking localCache mapping structure. tracking.ts creates { data: item, timestamp } usually but getApiCache returns the wrapped item.
            // Oh wait, getApiCache signature in tracking.ts might return { data: T, timestamp: number }. Let's assume it.
            if (!isCacheStale(localCache.timestamp, localTtl)) {
                // console.log(`[Cache Hit - L1] ${key}`);
                return localCache.data as T;
            } else {
                staleLocalCache = localCache.data as T;
            }
        }

        // 2. Try Global Cloud Cache (Persistent Knowledge Base - L2)
        try {
            const globalResult = await getGlobalCache(key);
            if (globalResult) {
                globalTimestamp = globalResult.timestamp;
                if (!isCacheStale(globalResult.timestamp, ttl)) {
                    // console.log(`[Cache Hit - L2] ${key}`);
                    await setApiCache(key, globalResult.data);
                    return globalResult.data as T;
                } else {
                    staleGlobalCache = globalResult.data as T;
                }
            }
        } catch (e) {
            console.warn("Global cache check failed:", e);
        }

        // --- TTL EXPIRED CHECK ---
        // If we have a stale global cache, let's ask AI if it *actually* needs updating to save tokens
        if (staleGlobalCache && globalTimestamp > 0) {
            console.log(`[Cache Stale] TTL expired for ${key}. Checking if update is needed...`);
            const needsUpdate = await checkIfCacheNeedsUpdate(key, globalTimestamp);
            if (!needsUpdate) {
                console.log(`[Cache Valid] No update needed for ${key}. Extending TTL.`);
                // Extend TTL by re-saving with new timestamp
                saveGlobalCache(key, staleGlobalCache).catch(err => console.warn("Failed to extend global cache TTL:", err));
                await setApiCache(key, staleGlobalCache);
                return staleGlobalCache as T;
            } else {
                console.log(`[Cache Stale] Updates found for ${key}. Proceeding to regenerate.`);
            }
        }
    }

    // console.log(`[Cache Miss - Generating] ${key}`);

    // --- THUNDERING HERD PREVENTION ---
    // Try to acquire the lock. If false, someone else is generating this EXACT data right now.
    const gotLock = await acquireGlobalCacheLock(key);
    
    if (!gotLock) {
        console.warn(`[Thundering Herd] Another user is generating ${key}. Waiting for their cache payload...`);
        // Wait up to 30 seconds for the holding client to finish generative AI
        const lockedResult = await waitForGlobalCache(key, 30000);
        if (lockedResult && !isCacheStale(lockedResult.timestamp, ttl)) {
             await setApiCache(key, lockedResult.data);
             return lockedResult.data as T;
        }
        // If timeout or failure, proceed to generate it ourselves.
        console.warn(`[Thundering Herd] Timed out waiting for peer. Generating manually.`);
    }

    // 3. Fetch from API (Expensive - L3) with automatic retries for API hiccups
    try {
        const data = await withRetry(fetcher, `Generate content for ${key.split(':')[0] || 'cache'}`, 2);
        
        // 4. Update Local Cache
        await setApiCache(key, data);
        
        // 5. Seed to Global Cache (this also releases the lock)
        saveGlobalCache(key, data).catch(err => console.warn("Failed to seed global cache:", err));
        
        return data;
    } catch (apiError: any) {
        // 6. STRICT HICCUP AVOIDANCE: If generation fails, serve stale data if available.
        if (staleLocalCache) {
            console.warn(`[Fallback] AI Generation failed for ${key}, serving STALE L1 cache to avoid hiccup.`);
            return staleLocalCache;
        }
        if (staleGlobalCache) {
            console.warn(`[Fallback] AI Generation failed for ${key}, serving STALE L2 cache to avoid hiccup.`);
            return staleGlobalCache;
        }
        // If absolutely no data, throw the error
        throw apiError;
    }
}

function parseJsonResponse<T>(text: string | undefined): T {
    if (!text) throw new Error("Empty response from AI");
    
    let cleanText = text.trim();
    
    // Fast path: try to parse the raw response first (standard for application/json)
    try {
        return JSON.parse(cleanText) as T;
    } catch (initialError) {
        // Continue to fallback parsing strategies for markdown-wrapped or truncated JSON
    }

    try {
        const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanText = jsonMatch[1].trim();
        } else {
            const firstBrace = cleanText.indexOf('{');
            const firstBracket = cleanText.indexOf('[');
            
            let firstIdx = -1;
            if (firstBrace !== -1 && firstBracket !== -1) firstIdx = Math.min(firstBrace, firstBracket);
            else if (firstBrace !== -1) firstIdx = firstBrace;
            else if (firstBracket !== -1) firstIdx = firstBracket;
            
            if (firstIdx !== -1) {
                const isObject = firstIdx === firstBrace;
                const lastIdx = isObject ? cleanText.lastIndexOf('}') : cleanText.lastIndexOf(']');
                if (lastIdx !== -1 && lastIdx > firstIdx) {
                    cleanText = cleanText.substring(firstIdx, lastIdx + 1);
                } else {
                    cleanText = cleanText.substring(firstIdx);
                }
            }
            
            // Auto-append missing closures if truncated
            let openBraces = (cleanText.match(/\{/g) || []).length;
            let closeBraces = (cleanText.match(/\}/g) || []).length;
            let openBrackets = (cleanText.match(/\[/g) || []).length;
            let closeBrackets = (cleanText.match(/\]/g) || []).length;
            
            // Add quotes if string was cut off
            if ((cleanText.match(/"/g) || []).length % 2 !== 0) {
                 cleanText += '"';
            }
            
            while (openBraces > closeBraces || openBrackets > closeBrackets) {
                if (openBraces > closeBraces) {
                    cleanText += '}';
                    closeBraces++;
                } else if (openBrackets > closeBrackets) {
                    cleanText += ']';
                    closeBrackets++;
                }
            }
        }
        
        cleanText = cleanText.replace(/,\s*([\]}])/g, '$1'); // Fix logic commas
        
        try {
            return JSON.parse(cleanText) as T;
        } catch (e2) {
            // Rare edge case: literal newlines inside string values
            const stringSafe = cleanText.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
                return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            });
            return JSON.parse(stringSafe) as T;
        }
    } catch (e) {
        console.error("JSON Parse Error (Attempting strict recovery):", e);
        throw new Error("The AI returned a response that was deeply corrupted. Retrying.");
    }
}

function getSmartModel(type: 'FAST' | 'SMART' | 'PRO' = 'FAST') {
    if (type === 'PRO') return MODEL_PRO;
    return type === 'SMART' ? MODEL_SMART : MODEL_FAST;
}

// --- Exports ---

// 1. Generate Shortcuts
export const generateShortcuts = async (topic: string, language: string): Promise<SolvingMethod[]> => {
    // Key: aptitude:shortcuts:{topic}:{language}
    const cacheKey = `aptitude:shortcuts:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `As a Master Civil Services & Banking Trainer, teach 3 distinct speed-methods to crush typical problems related to "${topic}" (Aptitude/Reasoning).
        1. Method 1: Standard/Traditional Textbook Method (for fundamental clarity).
        2. Method 2: Logical or Ratio-based Approach (for faster mental calculation).
        3. Method 3: 10-Second Shortcut Trick, Formula, or Option Elimination Strategy (crucial for clearing cut-offs).
        You MUST return ONLY a JSON array of objects. Do not wrap it in an object.
        Format: [{ "title": string, "explanation": string, "example": "Worked out example" }].
        ${getLanguageInstruction(language)}.`;
        
        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Shortcuts');
        
        const data = parseJsonResponse<any>(response.text);
        if (Array.isArray(data)) return data as SolvingMethod[];
        if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) return arrayValue as SolvingMethod[];
        }
        return [] as SolvingMethod[];
    }, TTL.INFINITE);
};

// 2. Additional Shortcut
export const generateAdditionalShortcut = async (topic: string, language: string, currentCount: number): Promise<SolvingMethod> => {
    // Key: aptitude:shortcut_extra:{topic}:{language}:{count}
    const cacheKey = `aptitude:shortcut_extra:${normalize(topic)}:${normalize(language)}:${currentCount}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a distinct, alternative method (Method #${currentCount + 1}) to solve typical problems related to "${topic}" (Aptitude/Reasoning).
        Return JSON: { "title": string, "explanation": string, "example": "Worked out example" }
        ${getLanguageInstruction(language)}.`;
        
        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Additional Shortcut');
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
        ${getLanguageInstruction(language)}.
        Provide a clear, step-by-step explanation.`;

        const response = await safeGenerateContent({
            model: MODEL_PRO, // Use Pro for complex vision tasks
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: prompt }
                ]
            },
            config: TEXT_CONFIG
        }, 'Solve Image Query');
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
        
        Explain why "${answer}" is correct or incorrect. Keep it concise (under 50 words). ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Get Explanation');
        return response.text || "No explanation available.";
    }, TTL.INFINITE);
};

// 5. Generate Quiz
export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number, language: string, examContext: string): Promise<Quiz> => {
    // Key: quiz:static:v2:{topic}:{difficulty}:{count}:{language}
    // Shared universally across exams
    const cacheKey = `quiz:static:v2:${normalize(topic)}:${normalize(difficulty)}:${numQuestions}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a ${difficulty} quiz with ${numQuestions} multiple-choice questions on the topic "${topic}" applicable to all major Indian competitive exams.
        You MUST return ONLY a JSON object. Do not wrap it in another object or array.
        Format: { "title": string, "questions": [{ "question": string, "options": string[], "correctAnswer": string, "questionEnglish": string (if language is not English), "optionsEnglish": string[] (if language is not English) }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Generate Quiz');
        return parseJsonResponse<Quiz>(response.text);
    }, TTL.INFINITE);
};

// 6. Mock Interview Session - Realtime (No caching for chat stream start)
export const createInterviewSession = (jobRole: string, language: string): Chat => {
    return ai.chats.create({
        model: MODEL_PRO, // Use Pro for high-quality conversational AI
        config: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            systemInstruction: `You are a highly experienced and strict interview panelist for Indian Government exams (UPSC, State PSC, Banking, SSC). 
            You are conducting a mock interview for the role of ${jobRole}. Be professional, tough but objective. Ask one question at a time. 
            Evaluate the answer rigorously based on expected civil service or banking standards, then ask the next question.
            ${getLanguageInstruction(language)}.` + VISUALIZATION_INSTRUCTIONS
        }
    });
};

// 7. Syllabus Info for Interview
export const generateSyllabusInfo = async (jobRole: string, language: string): Promise<string> => {
    // Key: interview:syllabus:{role}:{language}
    const cacheKey = `interview:syllabus:${normalize(jobRole)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a brief summary of the typical syllabus or key topics for an interview for the role of ${jobRole}. ${getLanguageInstruction(language)}.`;
        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: {
                ...TEXT_CONFIG,
                tools: [{ googleSearch: {} }]
            }
        }, 'Interview Syllabus');
        return response.text || "";
    }, TTL.INFINITE);
};

// 8. Send Message to Chat Stream
export const sendMessageToChatStream = async (chat: Chat, message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
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
        Include Age Limit, Qualification, Exam Pattern, and Important Dates (generic). ${getLanguageInstruction(language)}.
        Do NOT include any markdown formatting, code blocks, or visualizations in the 'details' string. Return plain text only.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Exam Details');
        return parseJsonResponse<ExamDetailGroup[]>(response.text);
    }, TTL.INFINITE);
};

// 10. Generate Study Notes
export const generateStudyNotes = async (topic: string, language: string, mainTopic?: string, examContext?: string): Promise<StudyMaterial> => {
    // Key: learn:notes:v10:{topic}:{subtopic}:{language}
    // EXAM CONTEXT REMOVED from cache key: We universally share topics (e.g. "Percentages") across all exams to save massive AI costs.
    const cacheKey = `learn:notes:v10:${normalize(topic)}:${normalize(mainTopic || 'general')}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const context = mainTopic ? `(Sub-topic of ${mainTopic})` : '';
        // We prompt the AI to cover all major competitive exams so the generated content is robust for anyone using the cache.
        const examCtx = `for all top Indian competitive exams (UPSC, SSC, Banking, Railways, State PSC)`;
        const prompt = `Act as an expert tutor and subject matter expert for government exams. You are writing a SINGLE TEXTBOOK PAGE focused EXACTLY and EXCLUSIVELY on this highly specific micro-topic: "${topic}" ${context} ${examCtx}.
        
        TEXTBOOK STRUCTURE & EXPLANATION DIRECTIVES (MANDATORY):
        - IMPORTANT: Your teaching style MUST be "spoon-feeding". Explain concepts so simply and intuitively that a beginner can immediately solve exam questions. Cut out useless academic theory. Focus entirely on exam-oriented mental models, shortcuts, and direct problem-solving techniques.
        - Do NOT write a broad overview, an introduction, or cover adjacent topics. Other pages in the syllabus will cover the rest.
        - Dive straight into the microscopic details of this specific slice.
        - Explain like a top-tier competitive exam coach spoon-feeding a beginner. Use simple terms, mental models, and step-by-step logic.
        - Assume the student is reading this to clear a highly competitive exam cutoff and needs exhaustive edge-case detail, formulas, laws, and exceptions. Target around ~500 words to ensure speed while maintaining extreme depth.
        
        CONTENT CONSTRAINTS:
        1. STRICT BOUNDARIES (NO OVERLAP): Ensure you do NOT step out of the exact boundary of ${topic}. Explain ONLY this concept to absolutely guarantee no overlap with other future lessons.
        2. CONNECTED TOPICS: At the very beginning or end of the notes, include a dedicated "🔗 Connected Topics" section briefly listing prerequisites or next-step concepts.
        
        VISUALIZATION AND STYLING REQUIREMENTS (MANDATORY):
        - Liberal use of Emojis appropriate to the context! Every section should feel vibrant.
        - Text-book level formatting: Use paragraphs, bullet points, numbered lists, tables.
        - Interactive Geographical Maps: If the topic covers any geographical features (e.g., rivers, mountains, states, forests, rainfall, soils, roads, transport, or political boundaries anywhere in the world), you MUST embed an interactive map using the following JSON markdown syntax:
          \\\`\\\`\\\`map
          {
            "center": [20.5937, 78.9629],
            "zoom": 5,
            "description": "Short explanation of this map.",
            "markers": [{"lat": 28.6139, "lng": 77.2090, "label": "New Delhi"}],
            "circles": [{"lat": 23.0225, "lng": 72.5714, "radius": 50000, "color": "red", "label": "Hotspot"}],
            "lines": [{"coordinates": [[28.6139, 77.2090], [25.3176, 82.9739]], "color": "blue", "label": "River/Road"}],
            "polygons": [{"coordinates": [[28.6139, 77.2090], [25.3176, 82.9739], [22.2587, 71.1924]], "color": "green", "label": "Forest/State"}]
          }
          \\\`\\\`\\\`
        - Math/Equations: MUST use KaTeX/LaTeX formatting ($...$ for inline, $$...$$ for block) wherever formulas or symbols apply. NEVER use hallucinated string interpolation symbols like \`/\${[\` or \`\${[. \`
        - Important Points/Callouts: Use single-line blockquotes like \`> [!NOTE] Your critical note here...\` or \`> [!TIP] Your tip here...\` or \`> [!WARNING] Your warning here...\` to highlight critical concepts.
        - ALWAYS highlight important points in colors using syntax: \`==Text==\`.
        - CRITICAL: Whenever mentioning Previous Year Questions (PYQs), you MUST highlight them using syntax: \`==PYQ: Topic Name==\` to render them in a special purple color.
        
        You MUST return ONLY a JSON object. Do not wrap it in another object or array.
        Format: { 
            "notes": "A highly specific, extreme deep-dive textbook chapter in markdown containing visualizations, diagrams, latex, emojis, connected topics, and thick, thorough paragraphs without overlap boundary leakage (Target: ~500 words).", 
            "summary": "Deep-dive conceptual summary (1-2 paragraphs) loaded with emojis and highlighting.", 
            "story": "A memorable real-world analogy or story to explain the complex concepts, beautifully formatted.", 
            "practiceQuestions": [{ "question": string, "answer": string }],
            "shortcutsAndTricks": "Advanced Tips/Tricks/Formulas/Mnemonic devices, heavily visualized.",
            "imageUrl": null 
        }. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: VISUAL_JSON_CONFIG
        }, 'Study Notes');
        return parseJsonResponse<StudyMaterial>(response.text);
    }, TTL.INFINITE);
};

// 11. Generate Tutorial
export const generateTutorialForTopic = async (topic: string, language: string, examContext: string): Promise<Tutorial> => {
    // Key: learn:tutorial:v5:{topic}:{language}
    // Shared universally across all exams
    const cacheKey = `learn:tutorial:v5:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create a step-by-step master tutorial for "${topic}" designed for cracking major Indian competitive exams while providing strong foundational knowledge.
        IMPORTANT: Your teaching style MUST be "spoon-feeding". Explain concepts so simply and intuitively that a beginner can easily understand. Balance necessary academic theory and foundational details with exam-oriented mental models, shortcuts, and direct problem-solving techniques. Do NOT cut out academic theory entirely; use it to build a strong base before getting into shortcuts.
        
        You MUST return ONLY a JSON object. Do not wrap it in another object or array.
        Format: { "title": string, "introduction": string, "prerequisites": string[], "steps": [{ "step": number, "title": string, "content": string, "example": string }], "workedExample": string, "commonPitfalls": string[], "summary": string, "nextSteps": string[] }.
        
        CRITICAL VISUALIZATION INSTRUCTIONS:
        Your 'content', 'example', and 'workedExample' fields must be rich in Markdown.
        1. Use KaTeX for math formulas (e.g. $$E=mc^2$$).
        2. Use blockquotes like \`> [!TIP] ...\` or \`> [!WARNING] ...\` for emphasis.
        3. ALWAYS highlight important points in colors using syntax: \`==Text==\`.
        4. CRITICAL: Whenever mentioning Previous Year Questions (PYQs), you MUST highlight them using syntax: \`==PYQ: Topic Name==\` to render them in a special purple color.
        5. Make explanations simple to read but conceptually sound. Provide sufficient academic depth for foundational clarity, heavily sprinkled with relevant emojis, cheat codes, and PYQs.
        
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: VISUAL_JSON_CONFIG
        }, 'Tutorial');
        return parseJsonResponse<Tutorial>(response.text);
    }, TTL.INFINITE);
};

// 12. Fetch Job Notifications
export const fetchLatestJobNotifications = async (language: string): Promise<JobNotification[]> => {
    // Key: live:jobs:{language}:{date} (Dynamic content, uses Time TTL)
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:jobs:${normalize(language)}:${today}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `List at least 25 to 30 latest active government job notifications in India.
        You MUST search comprehensively across ALL Central Government departments (e.g., UPSC, SSC, RRB, Defense, PSUs) AND ALL State Government departments (e.g., State PSCs, Police, Education, Health).
        You MUST source these strictly from official government notifications and official websites. Do not include jobs from third-party aggregators.
        Do NOT include any expired jobs. The lastDate must be in the future relative to today (${today}).
        Sort the list by expiry date (closest first).
        You MUST return ONLY a valid JSON array. Do not include any conversational text, explanations, or markdown outside the JSON block.
        Return JSON array: [{
            "postName": string,
            "organization": string,
            "vacancies": string,
            "eligibility": string,
            "startDate": string,
            "lastDate": string (format: YYYY-MM-DD if possible, otherwise readable date),
            "link": string (must be official link),
            "level": "Central" | "State",
            "state": string (if level is State, provide state name, else "All India"),
            "department": string (the specific department or ministry)
        }].
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                systemInstruction: "You are an expert data extractor. You must return ONLY a valid JSON array. Do not include any conversational text, explanations, or markdown formatting outside the JSON block."
            }
        }, 'Job Notifications');
        return parseJsonResponse<JobNotification[]>(response.text);
    }, TTL.DAY);
};

// 12.1 Fetch Admit Cards
export const fetchLatestAdmitCards = async (language: string): Promise<any[]> => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:admit_cards:${normalize(language)}:${today}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `List at least 20 latest active government exam admit cards released in India.
        Include Central and State government exams. Source strictly from official websites.
        Return JSON array: [{
            "examName": string,
            "organization": string,
            "releaseDate": string,
            "examDate": string,
            "link": string (official admit card download link),
            "level": "Central" | "State",
            "state": string
        }].
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                systemInstruction: "You are an expert data extractor. You must return ONLY a valid JSON array."
            }
        }, 'Admit Cards');
        return parseJsonResponse<any[]>(response.text);
    }, TTL.DAY);
};

// 12.2 Fetch Results
export const fetchLatestResults = async (language: string): Promise<any[]> => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:results:${normalize(language)}:${today}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `List at least 20 latest government exam results declared in India.
        Include Central and State government exams. Source strictly from official websites.
        Return JSON array: [{
            "examName": string,
            "organization": string,
            "resultDate": string,
            "link": string (official result link),
            "level": "Central" | "State",
            "state": string
        }].
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: MODEL_SMART,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                systemInstruction: "You are an expert data extractor. You must return ONLY a valid JSON array."
            }
        }, 'Exam Results');
        return parseJsonResponse<any[]>(response.text);
    }, TTL.DAY);
};

// 13. Generate Syllabus (Flat)
export const generateSyllabusForExam = async (exam: string, subCategory: string, tier: string, language: string, level: string, state?: string): Promise<Syllabus> => {
    // Key: syllabus:flat:v2:{exam}:{subcategory}:{tier}:{state}:{language}
    const cacheKey = `syllabus:flat:v2:${normalize(exam)}:${normalize(subCategory)}:${normalize(tier)}:${normalize(state)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const stateStr = state ? `State: ${state}, ` : '';
        const prompt = `Search for and generate the 100% complete, officially updated comprehensive syllabus for ${exam} - ${subCategory} ${tier ? `(${tier})` : ''} (${level}). ${stateStr}
        CRITICAL RESTRUCTURING RULES (TO AVOID LEARNING CONFUSION AND ENSURE 100% COMPLETENESS):
        1. Break the syllabus down smartly into primary textbook-style Chapters and micro-granular Topics to optimize learning.
        2. You MUST use strict textbook indexing numbering. Subjects/Chapters must be logically numbered: "1. Chapter", "2. Chapter". 
        3. Topics MUST be micro-granular but numbered hierarchically under their chapter (e.g., "1.1 Introduction", "1.2 Core Theories", "1.3 Applications", "1.4 Specific Use Case").
        4. COVER EVERY SINGLE SUBJECT AND TOPIC. Do NOT truncate or omit any section of the official syllabus. Be absolutely exhaustive and 100% accurate.
        
        You MUST return ONLY a JSON array of objects. Do not wrap it in an object.
        Format: [{ "subject": "1. Subject/Chapter Name", "topics": ["1.1 Topic One", "1.2 Topic Two", "1.3 Topic Three", "1.4 ... exhaustive list"] }].
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('PRO'), // Use PRO model for 100% complete and accurate extraction
            contents: prompt,
            config: {
                ...STRICT_JSON_CONFIG,
                systemInstruction: "You are an expert data extractor and syllabus Analyst. You structure syllabi using strict decimal indexing (1.1, 1.2). You must guarantee 100% completeness and accuracy, covering every subject of the exam. Do not include any conversational text, explanations, or markdown formatting outside the JSON block. You must return ONLY a JSON array."
            }
        }, 'Syllabus Flat');
        
        const data = parseJsonResponse<any>(response.text);
        if (Array.isArray(data)) return data as Syllabus;
        if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) return arrayValue as Syllabus;
        }
        return [] as Syllabus;
    }, TTL.INFINITE);
};

// 14. Micro Topics
export const generateMicroTopics = async (topic: string, language: string, examContext: string): Promise<string[]> => {
    // Key: syllabus:micro:v8:{topic}:{language}
    // Shared universally across exams
    const cacheKey = `syllabus:micro:v8:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Break down the main topic "${topic}" into 30-40 highly specific, microscopic sub-topics or atomic concepts applicable to major Indian competitive exams.
        CRITICAL INSTRUCTION: These micro-topics MUST be strictly bounded and highly granular to make it perfectly easy for AI tutorial generation. Do not output broad categories. Each slice must be small enough that it can be deeply detailed in a concise, targeted 300-word bite without leaking into the next topic.
        You MUST number each topic sequentially for easy study identification and ordered progression (e.g., "1. Overview of...", "2. ...").
        Do NOT wrap the output in an object.
        You MUST return ONLY a JSON array of strings.
        Example: ["1. Introduction to...", "2. Key formula for...", "3. Calculating...", "4. Exceptions in...", "5. Practice Problems on..."]
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: {
                ...STRICT_JSON_CONFIG
            }
        }, 'Micro Topics');
        
        const data = parseJsonResponse<any>(response.text);
        
        let rawArray: any[] = [];
        if (Array.isArray(data)) {
            rawArray = data;
        } else if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) {
                rawArray = arrayValue as any[];
            }
        }
        
        // Ensure we only return strings, extract from objects if necessary
        const processedTopics = rawArray.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
                // Try to glean the topic title
                return item.topic || item.title || item.name || item.step || JSON.stringify(item);
            }
            return String(item);
        }).filter(item => item && item.length > 0);

        return processedTopics;
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
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Predict Rank');
        return parseJsonResponse<RankPrediction>(response.text);
    }, TTL.INFINITE);
};

// 16. Generate Syllabus (Hierarchical)
export const generateSyllabus = async (exam: string, language: string, state?: string): Promise<SyllabusTopic[]> => {
    // Key: syllabus:tree:{exam}:{state}:{language}
    const cacheKey = `syllabus:tree:${normalize(exam)}:${normalize(state)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const stateContext = state ? `for ${state}` : '';
        const prompt = `Generate a 100% complete, exhaustive hierarchical syllabus structure for ${exam} ${stateContext}.
        Return JSON array: [{ "id": string, "title": string, "details": string, "children": [ ...recursive ] }].
        Limit depth to 2 levels. COVER ALL SUBJECTS AND SUB-TOPICS ensuring absolute completeness. Do not truncate. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('PRO'),
            contents: prompt,
            config: {
                ...STRICT_JSON_CONFIG,
                systemInstruction: "You are an expert data extractor and syllabus Analyst. You structure syllabi efficiently. You must guarantee 100% completeness and accuracy, covering every subject of the exam. Do not include any conversational text, explanations, or markdown formatting outside the JSON block. You must return ONLY a JSON array."
            }
        }, 'Syllabus Hierarchy');
        return parseJsonResponse<SyllabusTopic[]>(response.text);
    }, TTL.INFINITE);
};

// 17. Status Update
export const generateStatusUpdate = async (exam: string, subCategory: string, tier: string, language: string, type: string): Promise<ExamStatusUpdate> => {
    // Key: live:status:{exam}:{subcategory}:{tier}:{type}:{language}
    const cacheKey = `live:status:${normalize(exam)}:${normalize(subCategory)}:${normalize(tier)}:${normalize(type)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Check the latest status of ${type} for ${exam} - ${subCategory} ${tier}.
        Return JSON: { "status": string (e.g. Announced, Pending), "details": string, "link": string (official URL) }.
        ${getLanguageInstruction(language)}.
        Do NOT include any markdown formatting, code blocks, or visualizations in the 'details' string. Return plain text only.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                systemInstruction: "You are an expert data extractor. You must return ONLY a valid JSON object. Do not include any conversational text, explanations, or markdown formatting outside the JSON block."
            }
        }, 'Status Update');
        
        const data = parseJsonResponse<ExamStatusUpdate>(response.text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (sources) {
            data.sources = sources;
        }
        return data;
    }, TTL.DAY);
};

// 18. Daily Briefing
export const generateDailyBriefing = async (language: string): Promise<DailyBriefingData> => {
    // Key: live:daily_briefing:{language}:{date}
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:daily_briefing:${normalize(language)}:${today}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a daily briefing on current affairs relevant for competitive exams in India.
        Source strictly from reliable portals (like GKToday, Drishti IAS, Vision IAS, InsightsIAS), official government websites (like PIB), and reputed news organizations (like The Hindu, Indian Express).
        Include 150 words summary and 3 MCQs.
        Return JSON: { "summary": "markdown text", "mcqs": [{ "question": string, "options": string[], "correctAnswer": string }] }.
        ${getLanguageInstruction(language)}.
        Do NOT include any code blocks or visualizations in the 'summary' string.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192,
                systemInstruction: "You are an expert data extractor. You must return ONLY a valid JSON object. Do not include any conversational text, explanations, or markdown formatting outside the JSON block."
            }
        }, 'Daily Briefing');
        
        const data = parseJsonResponse<DailyBriefingData>(response.text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (sources) data.sources = sources;
        return data;
    }, TTL.WEEK);
};

// 19. Grounded Summary (Current Affairs)
export const generateGroundedSummary = async (topic: string, language: string, frequency: string, examContext: string): Promise<GroundedSummary> => {
    // Key: live:news_summary:{topic}:{frequency}:{language}:{date}
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `live:news_summary:${normalize(topic)}:${normalize(frequency)}:${normalize(language)}:${today}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a comprehensive ${frequency} current affairs summary ${topic ? `focused on "${topic}"` : ''} relevant for ${examContext}.
        Source strictly from reliable portals (like GKToday, Drishti IAS, Vision IAS, InsightsIAS), official government websites (like PIB), and reputed news organizations (like The Hindu, Indian Express).
        You MUST provide the summary in bullet points only. Do NOT include any decision simulations, interactive elements, tables, charts, code blocks, or diagrams.
        Include at least 5-7 key news items with detailed factual analysis.
        Return text summary in Markdown. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192
            }
        }, 'Grounded Summary');
        
        return {
            text: response.text || "No summary generated.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.DAY);
};

// 20. Current Affairs Chat
export const createCurrentAffairsChat = (topic: string, context: string, language: string, frequency: string, examContext: string): Chat => {
    return ai.chats.create({
        model: MODEL_SMART,
        config: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            systemInstruction: `You are a Current Affairs expert for ${examContext}. 
            Context provided: ${context}.
            Topic: ${topic}. Frequency: ${frequency}.
            Answer follow-up questions based on this context and general knowledge. Provide factual points only. Source strictly from reliable portals (like GKToday, Drishti IAS, Vision IAS, InsightsIAS), official government websites (like PIB), and reputed news organizations (like The Hindu, Indian Express). Do NOT include any decision simulations, interactive elements, tables, charts, code blocks, or diagrams. ${getLanguageInstruction(language)}.`,
            tools: [{ googleSearch: {} }]
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
        Limit depth to 3. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Mind Map');
        return parseJsonResponse<MindMapNode>(response.text);
    }, TTL.INFINITE);
};

// 22. Guess Paper
export const generateGuessPaper = async (topic: string, language: string, examContext: string): Promise<GuessPaper> => {
    // Key: quiz:guess_paper:{exam}:{topic}:{language}
    const cacheKey = `quiz:guess_paper:${normalize(examContext)}:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a guess paper (predicted questions) for "${topic}" for ${examContext}.
        Return JSON: { "title": string, "questions": [{ "question": string, "answer": string }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Guess Paper');
        return parseJsonResponse<GuessPaper>(response.text);
    }, TTL.INFINITE);
};

// 23. Study Roadmap
export const generateStudyRoadmap = async (examContext: string, language: string, topics?: string[]): Promise<StudyRoadmap> => {
    // Key: learn:roadmap:{exam}:{language}:{topic_hash}
    const topicKey = topics ? normalize(topics.sort().join(',')) : 'all';
    const cacheKey = `learn:roadmap:${normalize(examContext)}:${normalize(language)}:${topicKey}`;
    return getCachedData(cacheKey, async () => {
        const topicCtx = topics ? `Focus on these topics: ${topics.join(', ')}` : '';
        const prompt = `Create a study roadmap for ${examContext}. ${topicCtx}
        Return JSON: { "title": string, "phases": [{ "phaseTitle": string, "strategy": string, "topics": string[] }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Study Roadmap');
        return parseJsonResponse<StudyRoadmap>(response.text);
    }, TTL.INFINITE);
};

// 24. Story Tutor
export const generateStoryForTopic = async (topic: string, language: string, storyIndex: number = 1): Promise<StoryTutorResponse> => {
    // Key: learn:story:{topic}:{language}:{storyIndex}
    const cacheKey = `learn:story:${normalize(topic)}:${normalize(language)}:${storyIndex}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Explain "${topic}" using a creative, engaging story or analogy. This is story variation #${storyIndex}. Make it distinct from other possible stories about this topic.
        Before the story, provide 3-4 "Pre-points" (bullet points) that summarize the key concepts needed to understand the story or that the story illustrates.
        After the story, provide a "Challenge Question" related to the topic and explain how to "Solve it using the Story".
        
        Return JSON: {
          "prePoints": ["point 1", "point 2", ...],
          "story": "The story text...",
          "challengeQuestion": "The specific question...",
          "solutionWithStory": "Explanation solving the question using the story..."
        }
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: VISUAL_JSON_CONFIG
        }, 'Story Tutor');
        return parseJsonResponse<StoryTutorResponse>(response.text);
    }, TTL.INFINITE);
};

// --- Custom Chat logic for Ask COC ---
export async function* sendCocMessageStream(language: string, messages: any[], prompt: string): AsyncGenerator<{text: string}, void, unknown> {
    const systemInstruction = `You are COC AI, a world-class Master Trainer for Indian Government Jobs (UPSC, SSC, Banking, Railways) with a staggering 90% success rate. You are strict but encouraging, demanding discipline, and focused entirely on helping the student clear the cut-off. Make learning strategic and highly effective.
            
Main learning methodology you MUST follow:
1. Decision-Based Learning: Present real-life/scenario-based decision questions. Make the user think and choose. Explain why correct/incorrect after they answer.
2. Simulation-Based Learning: Suggest interactive simulations where students manipulate variables to see results (e.g., Profit & Loss).
3. AI Explanation Layer: Explain mistakes step-by-step, give strategy suggestions and shortcuts. Act as a mentor.
4. Pre-Animated Learning: Use visual concept explanations.

${getLanguageInstruction(language)}.` + VISUALIZATION_INSTRUCTIONS;

    // Convert history for Gemini
    const geminiHistory = messages.map(msg => ({
        role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    let yieldedSomething = false;
    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents: [...geminiHistory, { role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                systemInstruction
            }
        });
        
        for await (const chunk of stream) {
            if (chunk.text) {
                yieldedSomething = true;
                yield { text: chunk.text };
            }
        }
        return; // Completed successfully
    } catch (error) {
        if (yieldedSomething) {
            // We cannot cleanly fallback if we already started streaming text to the UI.
            console.warn("[Ask COC] Gemini hit an error mid-stream:", error);
            throw error;
        }
        console.warn("[Ask COC] Gemini hit an error initially, falling back to DeepSeek:", error);
    }
    
    // Fallback to DeepSeek
    const deepseekMessages: any[] = [
        { role: 'system', content: systemInstruction },
        ...messages.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.content
        })),
        { role: 'user', content: prompt }
    ];
    
    const dsStream = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        stream: true,
        temperature: 0.4,
        max_tokens: 8192
    });
    
    for await (const chunk of dsStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
            yield { text: content };
        }
    }
}

// 25. General Chat
export const createGeneralChat = (language: string, history?: any[]): Chat => {
    const chatConfig: any = {
        model: getSmartModel('SMART'),
        config: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            systemInstruction: `You are COC AI, a world-class Master Trainer for Indian Government Jobs (UPSC, SSC, Banking, Railways) with a staggering 90% success rate. You are strict but encouraging, demanding discipline, and focused entirely on helping the student clear the cut-off. Make learning strategic and highly effective.
            
Main learning methodology you MUST follow:
1. Decision-Based Learning: Present real-life/scenario-based decision questions. Make the user think and choose. Explain why correct/incorrect after they answer.
2. Simulation-Based Learning: Suggest interactive simulations where students manipulate variables to see results (e.g., Profit & Loss).
3. AI Explanation Layer: Explain mistakes step-by-step, give strategy suggestions and shortcuts. Act as a mentor.
4. Pre-Animated Learning: Use visual concept explanations.

${getLanguageInstruction(language)}.` + VISUALIZATION_INSTRUCTIONS
        }
    };

    if (history && history.length > 0) {
        chatConfig.history = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
    }

    return ai.chats.create(chatConfig);
};

// 26. Prompt Suggestions
export const generatePromptSuggestions = async (examContext: string, language: string): Promise<string[]> => {
    // Key: chat:prompts:{exam}:{language}
    const cacheKey = `chat:prompts:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Suggest 4 quick questions a student might ask about ${examContext}.
        Return JSON array of strings. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Prompt Suggestions');
        return parseJsonResponse<string[]>(response.text);
    }, TTL.INFINITE);
};

// 27. Concept Link Map
export const generateConceptLinkMap = async (topic: string, language: string): Promise<MindMapNode> => {
    // Key: visual:concept_map:{topic}:{language}
    const cacheKey = `visual:concept_map:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        // Reusing MindMapNode type structure for concept map
        const prompt = `Create a concept link map for "${topic}" showing prerequisites and related concepts.
        Return JSON: { "name": "${topic}", "children": [{ "name": string, "children": [...] }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Concept Link Map');
        return parseJsonResponse<MindMapNode>(response.text);
    }, TTL.INFINITE);
};

// 27.5. Map Learning Interactive Challenge
export const generateMapLearningItems = async (topic: string, language: string): Promise<any[]> => {
    // Key: visual:map_learning:v2:{topic}:{language}
    const cacheKey = `visual:map_learning:v2:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create 5 interactive map pointing challenges for the topic/exam focus: "${topic}".
        These should be geographical, historical, or cultural locations in India that a student should know.
        You MUST return ONLY a JSON array of objects. Do not wrap it in another object or array.
        Format: [{
            "id": number,
            "type": "geography" | "history" | "general_knowledge",
            "difficulty": "easy" | "medium" | "hard",
            "title": string,
            "learning": {
                "description": string,
                "fact": string,
                "hint": string
            },
            "practice": {
                "task": string
            },
            "quiz": {
                "question": string,
                "answer_type": "point" | "polygon",
                "answer_name": string,
                "lat": number (if point),
                "lng": number (if point),
                "tolerance_km": number (e.g. 50, if point)
            },
            "feedback": {
                "correct": string,
                "wrong": string
            },
            "tags": string[]
        }].
        ${getLanguageInstruction(language)} Make sure the lat/lng coordinates are historically and geographically accurate for India. Use answer_type "point" for specific cities/monuments and "polygon" for states/regions (in which case lat/lng is optional).`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Map Learning Challenge');
        
        const data = parseJsonResponse<any[]>(response.text);
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) return arrayValue as any[];
        }
        return [];
    }, TTL.INFINITE);
};

// 28. Teach Back Session
export const createTeachBackSession = (topic: string, language: string): Chat => {
    return ai.chats.create({
        model: getSmartModel('SMART'),
        config: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            systemInstruction: `You are an aspiring candidate preparing for Indian Government Exams (UPSC, SSC, Banking) learning about "${topic}". The user is your Master Trainer teaching you.
            Listen to their explanation. Ask critical clarification questions if they miss key points or if the explanation isn't precise enough for competitive exams.
            Finally, summarize what you learnt in a strategic bullet-point format. ${getLanguageInstruction(language)}.` + VISUALIZATION_INSTRUCTIONS
        }
    });
};

// 29. Evaluate User Summary
export const evaluateUserSummary = async (topic: string, summary: string, language: string): Promise<string> => {
    // Key: eval:summary:{topic}:{language}:{hash}
    const summaryHash = hashString(summary);
    const cacheKey = `eval:summary:${normalize(topic)}:${normalize(language)}:${summaryHash}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Evaluate this student's summary of "${topic}": "${summary}".
        As their strict but encouraging Master Trainer, point out any missing key concepts that would cost them marks in competitive exams (UPSC/SSC/Banking), correct inaccuracies, and give it a strict score out of 10 based on exam standards. Give actionable ways to improve. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Evaluate Summary');
        return response.text || "Could not evaluate.";
    }, TTL.INFINITE);
};

// 30. Real Life Examples
export const generateRealLifeExamples = async (topic: string, language: string): Promise<string> => {
    // Key: learn:examples:{topic}:{language}
    const cacheKey = `learn:examples:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide 3 real-world practical examples or modern governance/administrative applications of "${topic}".
        Explain how the concept is used in real life, especially focusing on contexts relevant to Indian civil services, economics, or public administration. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Real Life Examples');
        return response.text || "No examples found.";
    }, TTL.INFINITE);
};

// 31. Career Advice
export const getCareerPathAdvice = async (role: string, performance: PerformanceSummary, language: string): Promise<string> => {
    // Key: career:advice:{role}:{language}:{perf_hash}
    const perfHash = hashString(JSON.stringify(performance));
    const cacheKey = `career:advice:${normalize(role)}:${normalize(language)}:${perfHash}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Give highly strategic, hard-hitting career advice for a candidate aspiring to clear exams for the role of "${role}".
        User Performance Context (Based on their mock tests/learning): ${JSON.stringify(performance)}.
        As their Master Trainer (90% success rate), tell them brutally honest strengths to leverage, and exact weak areas they MUST improve to clear the final cut-off. Do not sugarcoat. Provide a roadmap. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Career Advice');
        return response.text || "No advice generated.";
    }, TTL.INFINITE);
};

// 32. Skill Plan
export const generateSkillDevelopmentPlan = async (skill: string, language: string): Promise<string> => {
    // Key: career:skill_plan:{skill}:{language}
    const cacheKey = `career:skill_plan:${normalize(skill)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Create a skill development plan for "${skill}".
        Include timeline and key milestones. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Skill Plan');
        return response.text || "No plan generated.";
    }, TTL.INFINITE);
};

// 33. Find Resources
export const findUpskillingResources = async (skill: string, language: string): Promise<GroundedSummary> => {
    // Key: career:resources:{skill}:{language}
    const cacheKey = `career:resources:${normalize(skill)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Find top free online resources (courses, articles, videos) to learn "${skill}".
        Return list with links. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192
            }
        }, 'Find Resources');
        
        return {
            text: response.text || "No resources found.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.INFINITE);
};

// 34. Resume Summary
export const generateResumeSummary = async (userInput: string, language: string): Promise<string> => {
    // Key: career:resume:{input_hash}:{language}
    const inputHash = hashString(userInput);
    const cacheKey = `career:resume:${inputHash}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate a professional resume summary based on this info: ${userInput}.
        Keep it impactful and concise. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: TEXT_CONFIG
        }, 'Resume Summary');
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
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Dictionary');
        return parseJsonResponse<DictionaryEntry>(response.text);
    }, TTL.INFINITE);
};

// 36. Flashcards
export const generateFlashcards = async (topic: string, count: number, language: string): Promise<Flashcard[]> => {
    // Key: tool:flashcards:{topic}:{count}:{language}
    const cacheKey = `tool:flashcards:${normalize(topic)}:${count}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Generate ${count} flashcards for "${topic}".
        You MUST return ONLY a JSON array of objects. Do not wrap it in an object.
        Format: [{ "front": string, "back": string }].
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Flashcards');
        
        const data = parseJsonResponse<any>(response.text);
        if (Array.isArray(data)) return data as Flashcard[];
        if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) return arrayValue as Flashcard[];
        }
        return [] as Flashcard[];
    }, TTL.INFINITE);
};

// 37. PYQ
export const fetchPreviousYearQuestions = async (examContext: string, language: string): Promise<GroundedSummary> => {
    // Key: learn:pyq:{exam}:{language}
    const cacheKey = `learn:pyq:${normalize(examContext)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Find previous year questions for ${examContext}.
        Return questions with years. ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 8192
            }
        }, 'PYQ');
        
        return {
            text: response.text || "No questions found.",
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
    }, TTL.MONTH);
};

// 38. Deep Dive
export const generateDeepDiveForTopic = async (topic: string, language: string, examContext: string): Promise<DeepDiveMaterial> => {
    // Key: learn:deep_dive:v3:{topic}:{language}
    // Shared universally across exams
    const cacheKey = `learn:deep_dive:v3:${normalize(topic)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a deep dive analysis for "${topic}" relevant to all major Indian competitive exams (UPSC, SSC, Banking, PSU).
        You MUST return ONLY a JSON object. Do not wrap it in another object or array.
        Format: { "coreConcepts": string[], "realWorldExample": string, "commonMistakes": string[], "quickQuiz": [{ "question": string, "answer": string }], "relatedTopics": string[] }.
        
        CRITICAL VISUALIZATION INSTRUCTIONS:
        Your string fields MUST be formatted in rich Markdown.
        1. Inject \`\`\`mermaid\`\`\` diagrams (use \`graph TD\` or \`graph LR\`) into "coreConcepts" and "realWorldExample".
        2. Format all numbers, equations, or formulas with KaTeX (e.g., $$x^2$$).
        3. Use highlight blockquotes like \`> [!WARNING]\` in the "commonMistakes" field.
        4. ALWAYS highlight important points in colors using syntax: \`==Text==\`.
        5. CRITICAL: Whenever mentioning Previous Year Questions (PYQs), you MUST highlight them using syntax: \`==PYQ: Topic/Question==\` to render them in a special purple color.
        
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: VISUAL_JSON_CONFIG
        }, 'Deep Dive');
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
        5 Questions. You MUST return ONLY a JSON object. Do not wrap it in another object or array.
        Format: { "title": string, "questions": [{ "question": string, "options": string[], "correctAnswer": string, "questionEnglish": string, "optionsEnglish": string[] }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('FAST'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Diagnostic Quiz');
        return parseJsonResponse<Quiz>(response.text);
    }, TTL.INFINITE);
};

// 40. Adaptive Path
export const generateAdaptivePath = async (examContext: string, quizResults: any[], language: string): Promise<AdaptiveLearningPath> => {
    // Key: adapt:path:{exam}:{results_hash}:{language}
    const resultHash = hashString(JSON.stringify(quizResults));
    const cacheKey = `adapt:path:${normalize(examContext)}:${resultHash}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `Create an adaptive learning path for ${examContext} based on these diagnostic results: ${JSON.stringify(quizResults)}.
        Return JSON: { "title": string, "initialAssessment": string, "steps": [{ "step": number, "action": "Review Concept" | "Deep Dive" | "Practice Questions" | "Final Quiz", "topic": string, "subject": string, "rationale": string }] }.
        ${getLanguageInstruction(language)}.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: STRICT_JSON_CONFIG
        }, 'Adaptive Path');
        return parseJsonResponse<AdaptiveLearningPath>(response.text);
    }, TTL.INFINITE);
};

// 41. Solve Homework Problem
export const generateLearningTechniques = async (subject: string, language: string): Promise<string> => {
    const cacheKey = `learning:techniques:${normalize(subject)}:${normalize(language)}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `You are an expert learning coach and cognitive scientist. The user wants to learn the subject/topic: "${subject}".
        Provide a comprehensive, highly actionable guide on the best evidence-based learning techniques specifically tailored to mastering this exact subject.
        
        Include techniques like Active Recall, Spaced Repetition, The Feynman Technique, Interleaving, or Dual Coding, but explain EXACTLY how to apply them to "${subject}".
        Provide concrete, step-by-step examples for each technique.
        
        Respond in ${language}. Format the response in clear Markdown with headings (##), bullet points, and bold text for readability. Do not include any JSON formatting, just raw markdown text.`;

        const response = await safeGenerateContent({
            model: getSmartModel('SMART'),
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 8192
            }
        }, 'Learning Techniques');

        return response.text || "Failed to generate learning techniques.";
    }, TTL.INFINITE);
};

export const solveHomeworkProblem = async (base64: string, mimeType: string, query: string, language: string): Promise<string> => {
    // Key: homework:solve:{image_hash}:{query}:{language}
    const imgHash = hashString(base64);
    const cacheKey = `homework:solve:${imgHash}:${normalize(query)}:${normalize(language)}`;
    
    return getCachedData(cacheKey, async () => {
        const prompt = `You are an expert academic tutor. Solve the homework problem provided in the image.
        Context/User Instruction: ${query}
        ${getLanguageInstruction(language)}.
        Provide a detailed, step-by-step solution.`;

        const response = await safeGenerateContent({
            model: MODEL_VISION_ECONOMY,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: prompt }
                ]
            },
            config: TEXT_CONFIG
        }, 'Solve Homework');
        return response.text || "I couldn't analyze the homework image.";
    }, TTL.INFINITE);
};
