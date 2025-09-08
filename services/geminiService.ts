import { GoogleGenAI, Type, Chat } from "@google/genai";
// Fix: Import DailyBriefing types for DailyBriefing.tsx component.
import type { Quiz, ExamDetailGroup, SyllabusTopic, ExamStatusUpdate, StudyMaterial, ExamByQualification, GroundedSummary, GroundingChunk, MindMapNode, DailyBriefingData, DailyBriefingMCQ } from '../types';
import { saveStudyNotesToCache, getApiCache, setApiCache, isCacheStale } from '../utils/tracking';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const isOnline = navigator.onLine;
    const cachedEntry = getApiCache<T>(key);

    if (cachedEntry) {
        if (!isOnline || !isCacheStale(cachedEntry.timestamp)) {
            return cachedEntry.data;
        }
    }

    if (!isOnline) {
        throw new Error("You are offline and this data has not been downloaded.");
    }

    // If online and cache is stale or missing, fetch new data
    const freshData = await fetcher();
    setApiCache(key, freshData);
    return freshData;
}

export const generateExamsByQualification = async (qualification: string, language: string): Promise<ExamByQualification[]> => {
    const cacheKey = `exams-by-qualification-${qualification}-${language}`;
    return getCachedData(cacheKey, async () => {
        try {
            const prompt = `Generate a list of suitable government jobs, competitive exams, and entrance exams in India for a candidate with the qualification: '${qualification}'.
For each exam, provide:
1. "examName": The specific name of the exam (e.g., "SSC CGL", "IBPS Clerk", "GATE").
2. "examCategory": The broad conducting body or category (e.g., "SSC", "Banking (IBPS, SBI)", "PSU Recruitment (GATE, etc.)"). This category should ideally match one of the national or state level categories for consistency.
3. "description": A very brief, one-sentence description of the role or exam purpose.

The response must be a JSON array of objects with these three keys. All text content must be in the ${language} language.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            exams: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        examName: { type: Type.STRING },
                                        examCategory: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            const data: { exams?: ExamByQualification[] } = JSON.parse(response.text.trim());
            return data.exams || [];
        } catch (error) {
            console.error(`Error generating exams for qualification ${qualification}:`, error);
            throw error;
        }
    });
};

export const generateTopicsForExam = async (
  examCategory: string,
  subCategory: string,
  tier: string,
  language: string
): Promise<string[]> => {
  const tierPrompt = tier ? ` for the '${tier}' stage` : '';
  const prompt = `Generate a concise list of the most important topics for the '${subCategory}' exam${tierPrompt}, which is part of the '${examCategory}' category in India. The list should be suitable for a student's study plan. The response must be a JSON array of strings, and all topics must be in the ${language} language.`;

  const cacheKey = `topics-${examCategory}-${subCategory}-${tier}-${language}`;
  return getCachedData(cacheKey, async () => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const data: { topics?: string[] } = JSON.parse(response.text.trim());
        return data.topics || [];
    } catch (error) {
        console.error(`Error generating topics for ${subCategory}:`, error);
        throw error;
    }
  });
};

export const generateExamDetails = async (
  examCategory: string,
  subCategory: string,
  tier: string,
  language: string
): Promise<ExamDetailGroup[]> => {
  const tierPrompt = tier ? ` for the '${tier}' stage` : '';
  const prompt = `Generate a detailed overview for the '${subCategory}' exam${tierPrompt}, part of the '${examCategory}' category in India.
Provide details grouped by relevant sections like "Exam Pattern", "Eligibility Criteria", "Marking Scheme", "Selection Process", and "Official Website".
For each detail, provide a "criteria" (e.g., "Age Limit", "Educational Qualification", "Mode of Exam") and its corresponding "details".
The response must be a JSON array of groups, where each group has a "groupTitle" and a "details" array. All text content must be in the ${language} language.`;
  
  const cacheKey = `details-${examCategory}-${subCategory}-${tier}-${language}`;
  return getCachedData(cacheKey, async () => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
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
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const data: ExamDetailGroup[] = JSON.parse(response.text.trim());
        return data || [];
    } catch (error) {
        console.error(`Error generating details for ${subCategory}:`, error);
        throw error;
    }
  });
};


export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number, language: string): Promise<Quiz> => {
    try {
        let nativeLanguage = 'English';
        if (language !== 'English') {
            const isCodeMixed = language.includes('+ English');
            if (isCodeMixed) {
                const match = language.match(/\((.*?) \+ English\)/);
                nativeLanguage = match ? match[1] : language.split(' ')[0];
            } else {
                const match = language.match(/^(.*?)\s*\(/);
                nativeLanguage = match ? match[1] : language;
            }
        }

        const prompt = `Generate a multiple-choice quiz with ${numQuestions} questions on the specific topic of '${topic}' at a '${difficulty}' difficulty level for a government job exam preparation.
For each question, provide the following:
1. The question text in ${nativeLanguage}.
2. The question text translated into English.
3. Four multiple-choice options in ${nativeLanguage}.
4. The same four options translated into English, in the same order.
5. The correct answer, which must be one of the options in ${nativeLanguage}.

The entire response must be in the specified JSON format. The quiz title should be in ${nativeLanguage}. If the native language is English, provide the same text for both native and English fields.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING, description: `The question in ${nativeLanguage}.` },
                                    questionEnglish: { type: Type.STRING, description: `The question in English.` },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: `The options in ${nativeLanguage}.`
                                    },
                                    optionsEnglish: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: `The options in English, in the same order.`
                                    },
                                    correctAnswer: { type: Type.STRING, description: `The correct answer in ${nativeLanguage}.` }
                                }
                            }
                        }
                    }
                }
            }
        });

        const quizData: Quiz = JSON.parse(response.text.trim());
        return quizData;
    } catch (error) {
        console.error(`Error generating quiz for topic ${topic}:`, error);
        throw error;
    }
};

export const generateStudyNotes = async (topic: string, language: string): Promise<StudyMaterial> => {
    const cacheKey = `study-notes-${topic}-${language}`;
    const cachedNotes = getApiCache<StudyMaterial>(cacheKey);

    if (cachedNotes && !isCacheStale(cachedNotes.timestamp)) {
        // Also save to the separate, simpler study notes cache for offline Topic Explorer/Study Helper use
        saveStudyNotesToCache(topic, language, cachedNotes.data);
        return cachedNotes.data;
    }
    
    try {
        const prompt = `Generate comprehensive study notes on the topic '${topic}' for a government job exam aspirant in India. The notes should be well-structured, easy to understand, and cover all key aspects. Use markdown for formatting (e.g., ## for headings, * for bullet points). All text content must be in the ${language} language.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const material: StudyMaterial = { notes: response.text, imageUrl: null };
        
        // Also save to the separate, simpler study notes cache for offline Topic Explorer/Study Helper use
        saveStudyNotesToCache(topic, language, material);
        setApiCache(cacheKey, material); // Update the main API cache
        
        return material;
    } catch (error) {
        console.error(`Error generating study notes for topic ${topic}:`, error);
        throw error;
    }
};

export const generateStoryForTopic = async (topic: string, language: string): Promise<string> => {
    const prompt = `Create a short, memorable story or an analogy to help a student understand and remember the core concept of '${topic}'. The story should be simple, engaging, and directly related to the topic. The story must be in the ${language} language.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // Low latency, creative task
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating story for topic ${topic}:`, error);
        throw error;
    }
};

// Fix: Add generateMicroTopics function for TopicExplorer.tsx
export const generateMicroTopics = async (topic: string, language: string): Promise<string[]> => {
    const cacheKey = `micro-topics-${topic}-${language}`;
    return getCachedData(cacheKey, async () => {
        try {
            const prompt = `Generate a list of specific, granular micro-topics for the broader subject of '${topic}'. These topics should be suitable for focused, short study sessions for a government job exam in India. The list should contain between 5 to 10 micro-topics. The response must be a JSON array of strings, and all topics must be in the ${language} language.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            microTopics: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const data: { microTopics?: string[] } = JSON.parse(response.text.trim());
            return data.microTopics || [];
        } catch (error) {
            console.error(`Error generating micro-topics for ${topic}:`, error);
            throw error;
        }
    });
};

export const createInterviewSession = (jobRole: string, language: string): Chat => {
    const systemInstruction = `You are an expert interviewer conducting a mock interview for the role of '${jobRole}' for a government job in India.
- Start with a brief greeting and then ask the first question.
- Ask a mix of technical, situational, and behavioral questions relevant to the role.
- Keep questions concise. Ask only one question at a time.
- After the user answers, provide brief, constructive feedback in italics (e.g., _"Good answer, you clearly described the situation. To make it stronger, you could also mention the outcome."_). Then, immediately ask the next question.
- Maintain a professional and encouraging tone.
- All your responses must be in the ${language} language.`;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return chat;
};


export const generateSyllabusInfo = async (jobRole: string, language: string): Promise<string> => {
    const cacheKey = `syllabus-info-${jobRole}-${language}`;
    return getCachedData(cacheKey, async () => {
        const prompt = `Provide a typical, high-level overview of the exam pattern and key syllabus topics for the '${jobRole}' government job exam in India. Use simple markdown for formatting (e.g., '## Exam Pattern', '### Tier 1', '* General Awareness'). The information should be a general guide for a prospective candidate. All content must be in the ${language} language.`;
        try {
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            return response.text;
        } catch (error) {
            console.error(`Error generating syllabus info for ${jobRole}:`, error);
            throw error;
        }
    });
};

export const generateSyllabus = async (examName: string, language: string): Promise<SyllabusTopic[]> => {
    const prompt = `Generate a structured syllabus for the '${examName}' exam category. Organize it hierarchically with main subjects and sub-topics.
The response must be a JSON array of objects. Each object should have:
1. "id": A unique string identifier (e.g., "quant-aptitude").
2. "title": The name of the topic in ${language}.
3. "children": An optional array of topic objects for sub-topics, following the same structure.
The depth can be up to 3 levels. Aim for a comprehensive yet organized structure.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        syllabus: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    children: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                id: { type: Type.STRING },
                                                title: { type: Type.STRING },
                                                children: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            id: { type: Type.STRING },
                                                            title: { type: Type.STRING }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const data: { syllabus?: SyllabusTopic[] } = JSON.parse(response.text.trim());
        return data.syllabus || [];
    } catch (error) {
        console.error(`Error generating syllabus for ${examName}:`, error);
        throw error;
    }
};


export const generateStatusUpdate = async (exam: string, subCategory: string, tier: string, language: string, type: 'Result' | 'Admit Card'): Promise<ExamStatusUpdate> => {
    const tierPrompt = tier ? ` for the '${tier}' stage` : '';
    // FIX: The prompt should ask for JSON, but the config should not enforce it when using googleSearch.
    const prompt = `Check the latest status of the '${type}' for the '${subCategory}' exam${tierPrompt}, which is part of the '${exam}' category.
Provide a concise update. Respond with ONLY a valid JSON object with the following keys:
1. "status": A short status line (e.g., "Result Released", "Admit Card Available", "Not Yet Announced").
2. "details": A one-sentence explanation providing more context (e.g., "The official results were declared on July 20, 2024.", "Admit cards can be downloaded until the exam date.").
3. "link": The most relevant official URL for the update, if available. If not, this field should be null.
All text content must be in the ${language} language. Do not include any text before or after the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // FIX: responseMimeType and responseSchema are not allowed when using the googleSearch tool.
            config: {
                tools: [{googleSearch: {}}], // Use search for real-time info
            }
        });

        // The model might return a string, even for a null link.
        const parsed: { status: string; details: string; link?: string | null } = JSON.parse(response.text.trim());
        if (parsed.link === "null" || parsed.link === "") {
            parsed.link = null;
        }

        return parsed as ExamStatusUpdate;

    } catch (error) {
        console.error(`Error generating status update for ${subCategory}:`, error);
        throw error;
    }
};

// Fix: Add generateDailyBriefing function for DailyBriefing.tsx
export const generateDailyBriefing = async (language: string): Promise<DailyBriefingData> => {
    // This function is not cached by getCachedData because it's time-sensitive (daily).
    // The component itself implements a simple daily cache.
    try {
        const prompt = `Generate a daily current affairs briefing for a government job exam aspirant in India for today.
The briefing should contain:
1.  A concise "summary" of the single most important national or international news event from the last 24 hours. The summary should be a short paragraph.
2.  A list of 2-3 multiple-choice questions ("mcqs") based on the summary to test understanding.

For each MCQ, provide:
-   "question": The question text.
-   "options": An array of 4 strings.
-   "correctAnswer": The correct option from the array.

The entire response must be ONLY a single valid JSON object with "summary" and "mcqs" keys. Do not include any text before or after the JSON object. All text must be in the ${language} language.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        const briefingData: DailyBriefingData = JSON.parse(response.text.trim());
        return briefingData;
    } catch (error) {
        console.error(`Error generating daily briefing:`, error);
        throw error;
    }
};

export const generateGroundedSummary = async (topic: string, language: string, frequency: string, examContext: string): Promise<GroundedSummary> => {
    try {
        const examPrompt = examContext ? `The user is preparing for the '${examContext}' exam.` : 'The user is a government job aspirant in India.';
        const topicPrompt = topic ? `If possible, focus on aspects related to '${topic}', but prioritize the most important general news if the topic is too niche.` : '';

        const prompt = `Act as an expert AI tutor for government job exams in India. ${examPrompt}

Your task is to generate a current affairs summary for the specified frequency: '${frequency}'.

Instructions:
1.  **Filter for Importance:** Analyze the latest news from Google Search and provide a summary of ONLY the 5-7 most important current affairs events relevant to the specified exam context. Do not include minor or irrelevant events.
2.  **Memorable Teaching Style:** For each event, explain it in simple, easy-to-remember language. Use markdown for clear formatting:
    *   Use a main heading for the entire summary (e.g., "## Monthly Current Affairs Briefing").
    *   Use subheadings (\`###\`) for each individual news event.
    *   Use bullet points (\`*\`) for key takeaways under each event.
    *   Use bold (\`**text**\`) to highlight crucial names, dates, legal articles, and terms.
    *   To emphasize critically important facts that are frequently asked in exams, wrap them in special color tags: ||red:critical fact||, ||blue:key definition||, ||green:positive outcome||, or ||orange:word of caution||.
3.  **Language:** All content must be in the ${language} language.
${topicPrompt}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        
        return {
            text: response.text,
            sources: sources
        };
    } catch (error) {
        console.error(`Error generating grounded summary for topic ${topic}:`, error);
        throw error;
    }
};

export const createCurrentAffairsChat = (topic: string, summary: string, language: string, frequency: string, examContext: string): Chat => {
    const systemInstruction = `You are a helpful AI assistant specializing in current affairs. You will be answering follow-up questions about a summary you just provided on the optional topic of '${topic}' for a '${frequency}' period, tailored for a '${examContext}' exam aspirant. The summary was: "${summary}". Keep your answers concise, accurate, and relevant to the user's questions. All responses must be in ${language}.`;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
};

export const generateMindMap = async (topic: string, language: string): Promise<MindMapNode> => {
    const prompt = `Generate a mind map for the topic '${topic}'. The mind map should be structured as a JSON object.
The root object must have a "name" key with the topic name and an optional "children" key which is an array of node objects.
Each child node object should also have a "name" and an optional "children" array.
Create a logical hierarchy that is at least 2-3 levels deep to be visually effective.
All text content must be in the ${language} language.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        children: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    children: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                children: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: { name: { type: Type.STRING } }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error generating mind map for topic ${topic}:`, error);
        throw error;
    }
};


// --- Error Handling ---
export const getSpecificErrorMessage = (error: any): string => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error && typeof error.message === 'string') {
        if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
            message = 'The service is currently busy. Please wait a moment and try again.';
        } else if (error.message.toLowerCase().includes('api key not valid')) {
            message = 'The API key is invalid. Please check the configuration.';
        } else if (error.message.toLowerCase().includes('network error') || error.message.toLowerCase().includes('failed to fetch')) {
             message = 'A network error occurred. Please check your internet connection.';
        } else if (error.message.toLowerCase().includes('safety policy')) {
            message = 'The request was blocked due to the safety policy. Please modify your prompt and try again.';
        }
    }
    return message;
};