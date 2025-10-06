

import { GoogleGenAI, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import type { ExamDetailGroup, SyllabusTopic, ExamStatusUpdate, StudyMaterial, ExamByQualification, GuessPaper, PerformanceSummary, RankPrediction, Quiz, StudyPlan, DeepDiveMaterial, JobNotification, MindMapNode, DailyBriefingData, GroundedSummary, GroundingSource, ChatMessage, QuizQuestion, PracticeQuestion, DeepDiveQuizQuestion } from '../types';
import { getApiCache, setApiCache, isCacheStale } from '../utils/tracking';
import { getCloudCache, setCloudCache } from '../firebase';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Caching Strategy ---
interface MemoryCacheEntry<T> {
    timestamp: number;
    data: T;
}
const memoryCache = new Map<string, MemoryCacheEntry<any>>();


const parseJsonResponse = <T>(text: string): T => {
    const markdownMatch = text.match(/```(json)?\n?([\s\S]*?)\n?```/);
    
    let jsonString = text.trim();

    if (markdownMatch && markdownMatch[2]) {
        jsonString = markdownMatch[2].trim();
    }

    const firstBracket = jsonString.indexOf('{');
    const firstSquare = jsonString.indexOf('[');
    let start = -1;

    if (firstBracket === -1) {
        start = firstSquare;
    } else if (firstSquare === -1) {
        start = firstBracket;
    } else {
        start = Math.min(firstBracket, firstSquare);
    }

    if (start === -1) {
        throw new Error("No JSON object or array found in the AI response.");
    }

    const lastBracket = jsonString.lastIndexOf('}');
    const lastSquare = jsonString.lastIndexOf(']');
    const end = Math.max(lastBracket, lastSquare);
    
    if (end === -1) {
        throw new Error("Could not find the end of the JSON object or array in the AI response.");
    }

    jsonString = jsonString.substring(start, end + 1);

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse cleaned JSON string:", jsonString);
        throw new Error(`The AI returned a response that could not be parsed as JSON. Raw response: "${text}"`);
    }
};

async function getCachedData<T>(key: string, fetcher: () => Promise<T>, staleMs?: number): Promise<T> {
    const isOnline = navigator.onLine;

    // 1. Check in-memory cache (fastest, for current session)
    if (memoryCache.has(key)) {
        const entry = memoryCache.get(key)!;
        if (!isCacheStale(entry.timestamp, staleMs)) {
            return entry.data;
        }
    }

    // 2. Check local storage cache (for repeat sessions & offline)
    const localEntry = getApiCache<T>(key);
    if (localEntry) {
        if (!isOnline || !isCacheStale(localEntry.timestamp, staleMs)) {
            memoryCache.set(key, localEntry); // Hydrate memory cache
            return localEntry.data;
        }
    }

    // If we reach here, we need to go to the network.
    if (!isOnline) {
        // We have no fresh local data and are offline
        throw new Error("You are offline and this data has not been downloaded.");
    }

    // 3. Check cloud cache (shared across users)
    try {
        const cloudEntry = await getCloudCache<T>(key);
        if (cloudEntry && !isCacheStale(cloudEntry.timestamp, staleMs)) {
            // Found in cloud, save to local caches for future offline access and speed
            setApiCache(key, cloudEntry.data); 
            memoryCache.set(key, { timestamp: cloudEntry.timestamp, data: cloudEntry.data });
            return cloudEntry.data;
        }
    } catch (e) {
        console.warn("Could not check cloud cache, proceeding to API call.", e);
        // Fall through to API call if cloud cache fails
    }

    // 4. Fetch from API (last resort)
    const freshData = await fetcher();
    
    // Save to all caches for future use
    setApiCache(key, freshData);
    memoryCache.set(key, { timestamp: Date.now(), data: freshData });
    // Don't await this, let it happen in the background
    setCloudCache(key, freshData);

    return freshData;
}

export const generateExamsByQualification = async (qualification: string, language: string): Promise<ExamByQualification[]> => {
    const cacheKey = `exams-by-qualification-v1-${qualification}-${language}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `List competitive government exams in India that a person with the qualification "${qualification}" is eligible for. For each exam, provide the exam name, a general category (e.g., "State PSC", "Banking", "Railways"), and a brief one-sentence description. The output must be a JSON array of objects, each with "examName", "examCategory", and "description" keys. Provide the response in ${language}. Do not include introduction or conclusion sections, just provide the JSON array.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            examName: { type: Type.STRING },
                            examCategory: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["examName", "examCategory", "description"]
                    }
                }
            }
        });

        return parseJsonResponse<ExamByQualification[]>(response.text);
    });
};

export const getSpecificErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('API key not valid')) {
      return "The provided API Key is invalid. Please check your configuration.";
    }
    if (error.message.includes('fetch-failed') || error.message.includes('network')) {
      return "Network error. Please check your internet connection and try again.";
    }
    return error.message;
  }
  return 'An unknown error occurred.';
};

export const generateTopicsForExam = async (examCategory: string, subCategory: string, tier: string, language: string, selectionLevel?: string): Promise<string[]> => {
    const cacheKey = `topics-v4-${examCategory}-${subCategory}-${tier}-${language}-${selectionLevel}`;
    return getCachedData(cacheKey, async () => {
        const isSchoolSyllabus = selectionLevel === 'School Syllabus (NCERT)';

        const prompt = isSchoolSyllabus
            ? `List all the chapters and the key concepts within each chapter for the subject "${subCategory}" for ${examCategory}. The response should be a simple JSON array of strings, where each string is a chapter name or a key concept indented with spaces. Example: ["Chapter 1: Number Systems", "  - Real Numbers", "  - Euclid's Division Lemma", "Chapter 2: Polynomials"]. The output should be in ${language}. Do not include introduction or conclusion sections, just provide the JSON array.`
            : `List all the topics and sub-topics for the ${subCategory} exam ${tier ? `(Tier: ${tier})` : ''} conducted by ${examCategory}. The response should be a JSON array of strings. Example: ["General Intelligence & Reasoning", "Quantitative Aptitude"]. The output should be in ${language}. Provide only the JSON array.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        return parseJsonResponse<string[]>(response.text);
    });
};

export const generateExamDetails = async (examCategory: string, subCategory: string, tier: string, language: string, selectionLevel?: string): Promise<ExamDetailGroup[]> => {
    const cacheKey = `exam-details-v4-${examCategory}-${subCategory}-${tier}-${language}-${selectionLevel}`;
    return getCachedData(cacheKey, async () => {
        const isSchoolSyllabus = selectionLevel === 'School Syllabus (NCERT)';

        const schoolPrompt = `Generate a list of learning objectives and key concepts for the subject "${subCategory}" for ${examCategory}. Structure the response as a JSON array of groups. One group for "Learning Objectives" and another for "Key Concepts". Each group should have a 'groupTitle' and a 'details' array, where each item in 'details' has a 'criteria' (the objective/concept) and 'details' (a brief explanation). Provide the response in ${language}. Only output the JSON.`;
        
        const examPrompt = `Provide a detailed breakdown for the ${subCategory} exam ${tier ? `(Tier: ${tier})` : ''} by ${examCategory}. Include groups for "Eligibility Criteria", "Exam Pattern", and "Selection Process". Structure the response as a JSON array of groups. Each group should have a 'groupTitle' and a 'details' array, where each item in 'details' has a 'criteria' (e.g., "Age Limit", "Educational Qualification") and 'details' (the specific requirement). Provide the response in ${language}. Only output the JSON.`;

        const prompt = isSchoolSyllabus ? schoolPrompt : examPrompt;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            groupTitle: { type: Type.STRING },
                            details: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        criteria: { type: Type.STRING },
                                        details: { type: Type.STRING }
                                    },
                                    required: ['criteria', 'details']
                                }
                            }
                        },
                        required: ['groupTitle', 'details']
                    }
                }
            }
        });
        
        return parseJsonResponse<ExamDetailGroup[]>(response.text);
    });
};

export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number, language: string): Promise<Quiz> => {
    const prompt = `Generate a quiz with ${numQuestions} questions about "${topic}" at a ${difficulty} difficulty level. For each question, provide a 'question', an array of 4 'options', and the 'correctAnswer'. If the original question is in a language other than English, also provide an English translation for the question ('questionEnglish') and options ('optionsEnglish'). The entire output must be a single JSON object with a "title" and a "questions" array. Respond in ${language}.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                questionEnglish: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                optionsEnglish: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING },
                            },
                            required: ["question", "options", "correctAnswer"],
                        },
                    },
                },
                required: ["title", "questions"],
            },
        },
    });
    return parseJsonResponse<Quiz>(response.text);
};

export const generateStudyNotes = async (topic: string, language: string): Promise<StudyMaterial> => {
    const prompt = `Create a comprehensive study package for the topic "${topic}". It should be in ${language}. The output must be a single JSON object with the following keys:
- "notes": Detailed study notes in markdown format. Use headings, bold text, and lists.
- "summary": A concise summary of the key points.
- "story": A short, memorable story or analogy to help understand the topic.
- "practiceQuestions": An array of 3 objects, each with a "question" and a detailed "answer".
- "imageUrl": A placeholder value of null.
Provide only the JSON object.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    notes: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    story: { type: Type.STRING },
                    practiceQuestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                            required: ["question", "answer"],
                        },
                    },
                    imageUrl: { type: Type.NULL },
                },
                required: ["notes", "summary", "story", "practiceQuestions", "imageUrl"],
            },
        },
    });
    return parseJsonResponse<StudyMaterial>(response.text);
};

export const generateDeepDiveForTopic = async (topic: string, language: string): Promise<DeepDiveMaterial> => {
    const prompt = `Generate a "deep dive" analysis for the topic "${topic}" in ${language}. The output must be a single JSON object with these keys:
- "coreConcepts": An array of 3-5 core concept strings.
- "realWorldExample": A string describing a real-world application or example.
- "commonMistakes": An array of 2-3 common mistakes students make.
- "quickQuiz": An array of 2 quiz objects, each with a "question" and "answer" string.
- "relatedTopics": An array of 3-4 related topic strings.
Provide only the JSON object.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    coreConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    realWorldExample: { type: Type.STRING },
                    commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    quickQuiz: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                            required: ["question", "answer"],
                        },
                    },
                    relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["coreConcepts", "realWorldExample", "commonMistakes", "quickQuiz", "relatedTopics"],
            },
        },
    });
    return parseJsonResponse<DeepDiveMaterial>(response.text);
};

export const generateSyllabusInfo = async (jobRole: string, language: string): Promise<string> => {
    const prompt = `Provide a typical syllabus overview for a mock interview for the job role: "${jobRole}". The response should be a brief, well-structured summary in markdown format, suitable for display. Use headings and lists. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const createInterviewSession = (jobRole: string, language: string): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert interviewer conducting a mock interview for the role of "${jobRole}". Start by introducing yourself and the role. Ask one question at a time. After the user answers, provide brief, constructive feedback and then ask the next question. Keep the interview conversational and professional. Conduct the interview in ${language}.`,
        }
    });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
    return await chat.sendMessage({ message });
};

export const generateMicroTopics = async (mainTopic: string, language: string): Promise<string[]> => {
    const prompt = `Break down the main topic "${mainTopic}" into a list of 10-15 specific micro-topics suitable for individual study sessions. The response must be a JSON array of strings. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
    });
    return parseJsonResponse<string[]>(response.text);
};

export const generateSyllabus = async (selectedExam: string, language: string): Promise<SyllabusTopic[]> => {
    const prompt = `Generate a detailed, hierarchical syllabus for the exam: "${selectedExam}". The output must be a JSON array of topic objects. Each object must have a unique "id" (string), a "title" (string), an optional "details" (string), and an optional "children" array of topic objects for sub-topics. Create a deep, well-structured hierarchy. Respond in ${language}.`;
    return getCachedData(
        `syllabus-v2-${selectedExam}-${language}`,
        async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                details: { type: Type.STRING },
                                children: {
                                    type: Type.ARRAY,
                                    items: { $ref: "#" } // Self-referencing for recursive structure
                                },
                            },
                            required: ["id", "title"],
                        },
                    },
                },
            });
            return parseJsonResponse<SyllabusTopic[]>(response.text);
        }
    );
};

export const generateStatusUpdate = async (exam: string, subCategory: string, tier: string, language: string, type: 'Result' | 'Admit Card'): Promise<ExamStatusUpdate> => {
    const prompt = `Check the latest status for the ${type} of the ${exam} ${subCategory} ${tier ? `(${tier})` : ''} exam. Provide the current status, a brief detail, and if possible, the official link. Respond in ${language}. The entire output must be a single JSON object with "status", "details", and an optional "link" key.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    status: { type: Type.STRING },
                    details: { type: Type.STRING },
                    link: { type: Type.STRING },
                },
                required: ["status", "details"],
            },
        },
    });
    return parseJsonResponse<ExamStatusUpdate>(response.text);
};

export const generateGuessPaper = async (topic: string, language: string): Promise<GuessPaper> => {
    const prompt = `Create a guess paper for the topic "${topic}". It should contain 5 highly probable questions based on common exam patterns. The output must be a JSON object with a "title" and a "questions" array. Each question object should have a "question" and a detailed "answer" in markdown format. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                            required: ["question", "answer"],
                        },
                    },
                },
                required: ["title", "questions"],
            },
        },
    });
    return parseJsonResponse<GuessPaper>(response.text);
};

export const predictRank = async (summary: PerformanceSummary, exam: string, language: string): Promise<RankPrediction> => {
    const prompt = `Based on the following performance summary for the "${exam}" exam, predict a likely performance bracket or rank. Provide a concise analysis and 3 actionable recommendations. Performance data: ${JSON.stringify(summary)}. Respond in ${language}. The output must be a JSON object with keys "predictedRank", "analysis", and "recommendations" (an array of strings).`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    predictedRank: { type: Type.STRING },
                    analysis: { type: Type.STRING },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["predictedRank", "analysis", "recommendations"],
            },
        },
    });
    return parseJsonResponse<RankPrediction>(response.text);
};

export const generateStudyPlan = async (summary: Omit<PerformanceSummary, 'topicsStudied'|'studyStreak'>, exam: string, topics: string[], language: string): Promise<StudyPlan> => {
    const prompt = `Create a personalized 5-day study plan for the "${exam}" exam. Prioritize weak topics and cover other important topics. Performance summary: ${JSON.stringify(summary)}. Available topics: ${topics.join(', ')}. The output must be a JSON object with a "title" and a "plan" array. Each plan item must have "day", "topic", "activity" ('Study Notes' or 'Take Quiz'), and a "reason" string explaining why this task was chosen. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING },
                                topic: { type: Type.STRING },
                                activity: { type: Type.STRING },
                                reason: { type: Type.STRING },
                            },
                            required: ["day", "topic", "activity", "reason"],
                        },
                    },
                },
                required: ["title", "plan"],
            },
        },
    });
    return parseJsonResponse<StudyPlan>(response.text);
};

export const generateShortcuts = async (topic: string, language: string): Promise<string> => {
    const prompt = `Teach me important shortcuts, tricks, and formulas for the aptitude topic: "${topic}". Provide a clear, well-structured explanation in markdown format. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const solveImageQuery = async (base64: string, mimeType: string, prompt: string, language: string): Promise<string> => {
    const imagePart = { inlineData: { data: base64, mimeType } };
    const textPart = { text: `${prompt}. Respond in ${language}.` };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const generateStoryForTopic = async (topic: string, language: string): Promise<string> => {
    const prompt = `Tell me a simple and memorable story or analogy to help me understand the topic: "${topic}". Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const generateMindMap = async (topic: string, language: string): Promise<MindMapNode> => {
    const prompt = `Create a mind map for the topic "${topic}". The output must be a JSON object with a "name" (the central topic) and a "children" array of objects. Each child object has the same structure. Create a hierarchy at least 3 levels deep. Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    children: {
                        type: Type.ARRAY,
                        items: { $ref: "#" },
                    },
                },
                required: ["name"],
            },
        },
    });
    return parseJsonResponse<MindMapNode>(response.text);
};

export const generateGroundedSummary = async (topic: string, language: string, frequency: string, exam: string): Promise<GroundedSummary> => {
    const prompt = `Provide a grounded summary of current affairs from the "${frequency}" relevant to the "${exam}" exam. If provided, focus on "${topic}". Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk as GroundingSource) || [];
    return { text: response.text, sources };
};

export const createCurrentAffairsChat = (topic: string, summary: string, language: string, frequency: string, exam: string): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful AI analyst. The user has just received a summary of current affairs about "${topic}" for the "${exam}" exam from the "${frequency}". Answer their follow-up questions based on this context and general knowledge. The summary was: """${summary}""". Respond in ${language}.`,
        }
    });
};

export const generateDailyBriefing = async (language: string): Promise<DailyBriefingData> => {
    const prompt = `Create today's daily briefing on major national and international current affairs relevant for competitive exams. The output must be a JSON object with a "summary" (a brief paragraph) and an "mcqs" array. The array should have 3 multiple-choice question objects, each with a "question", an array of 4 "options", and the "correctAnswer". Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    mcqs: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING },
                            },
                            required: ["question", "options", "correctAnswer"],
                        },
                    },
                },
                required: ["summary", "mcqs"],
            },
        },
    });
    return parseJsonResponse<DailyBriefingData>(response.text);
};

export const fetchLatestJobNotifications = async (language: string): Promise<JobNotification[]> => {
    const prompt = `Find the latest top 5 government job notifications in India from various national and state-level sources. The output must be a JSON array of objects, each with "postName", "organization", "vacancies", "lastDate", and the official "link". Respond in ${language}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        postName: { type: Type.STRING },
                        organization: { type: Type.STRING },
                        vacancies: { type: Type.STRING },
                        lastDate: { type: Type.STRING },
                        link: { type: Type.STRING },
                    },
                    required: ["postName", "organization", "vacancies", "lastDate", "link"],
                },
            },
        },
    });
    return parseJsonResponse<JobNotification[]>(response.text);
};