import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Quiz, ExamDetailGroup, SyllabusTopic, ExamStatusUpdate, StudyMaterial, DailyBriefingData, ExamByQualification } from '../types';
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
                                    correctAnswer: { type: Type.STRING, description: `The correct answer from the ${nativeLanguage} options.` }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const quizData: Partial<Quiz> = JSON.parse(jsonText);
        return {
            title: quizData.title || `Quiz on ${topic}`,
            questions: quizData.questions || [],
        };
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

export const generateMicroTopics = async (topic: string, language: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a list of important, granular micro-topics for the broader subject of '${topic}' for someone preparing for a government job exam. The list of topics must be in the ${language} language. Provide only a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "A list of micro-topics."
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const data: { topics?: string[] } = JSON.parse(jsonText);
        return data.topics || [];
    } catch (error) {
        console.error("Error generating micro-topics:", error);
        throw error;
    }
};


export const generateRelevantImage = async (topic: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A clear, high-quality, educational, 3D rendered style image that visually represents the topic of '${topic}'. The image should be suitable for a student preparing for government exams. Avoid text overlays.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};

export const generateStudyNotes = async (topic: string, language: string): Promise<StudyMaterial> => {
    try {
        let textPrompt: string;
        const isAptitudeOrReasoning = topic.toLowerCase().includes('aptitude') || topic.toLowerCase().includes('reasoning');
        const isCodeMixed = language.includes('+ English');

        if (isCodeMixed) {
            let codeMixedName = language;
            let nativeLanguage = language.split(' ')[0]; // Fallback

            const match = language.match(/^(.*?) \((.*?) \+ English\)$/);
            if (match) {
                codeMixedName = match[1];
                nativeLanguage = match[2];
            }

            if (isAptitudeOrReasoning) {
                 textPrompt = `You are an expert and friendly teacher for government job aspirants. Explain the concept of '${topic}'. Your entire explanation must be in ${codeMixedName}, a natural, conversational mix of ${nativeLanguage} and English. The goal is to sound like a real teacher, not a machine translation.
- The sentence structure and grammar must primarily follow ${nativeLanguage}.
- Seamlessly integrate common English words for technical terms, key concepts, or for clarity. Do not translate common English technical terms; use them as they are. For example, use "percentage" or "ratio" within a ${nativeLanguage} sentence.
- This should mimic how a bilingual teacher would naturally code-switch in a classroom.
- Make the concept extremely easy to understand and remember. Use simple, everyday analogies and real-world examples.
- Structure the information clearly using markdown (headings, bold text, lists).`;
            } else {
                textPrompt = `You are a helpful tutor for government job aspirants. Provide a concise yet comprehensive summary of the topic: '${topic}'. The summary must be in ${codeMixedName}, a natural, conversational mix of ${nativeLanguage} and English.
- The sentence structure and grammar should primarily follow ${nativeLanguage}.
- Use common English words for technical or complex terms within natural-sounding ${nativeLanguage} sentences to ensure clarity and readability for a bilingual audience. The blend should feel natural, like how a bilingual person speaks.
- Use markdown-style headings, bullet points, and bold text to structure the information for easy learning.`;
            }

        } else {
            textPrompt = `You are a helpful tutor for government job aspirants. Provide a concise yet comprehensive summary of the topic: '${topic}'. The entire summary must be in the ${language}. Use markdown-style headings, bullet points, and bold text to structure the information for easy learning. Where appropriate, make the explanation memorable by using simple analogies or examples.`;
        }

        const textGenerationPromise = ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPrompt,
        });
        
        const imageGenerationPromise = isAptitudeOrReasoning 
            ? Promise.resolve(null) 
            : generateRelevantImage(topic).catch(err => {
                console.warn('Image generation failed but continuing with text notes:', err);
                return null;
            });

        const [textResponse, imageUrl] = await Promise.all([textGenerationPromise, imageGenerationPromise]);
        
        const material: StudyMaterial = {
            notes: textResponse.text,
            imageUrl
        };

        saveStudyNotesToCache(topic, language, material);

        return material;
    } catch (error) {
        console.error("Error generating study notes:", error);
        throw error;
    }
};

export const generateStoryForTopic = async (topic: string, language: string): Promise<string> => {
    try {
        const prompt = `You are a creative and wise storyteller who makes complex topics simple and memorable for government job aspirants.
Explain the core concept of '${topic}' through a short, simple, and engaging story, analogy, or real-world scenario.
The story must be easy to remember and directly relate to the topic.
The entire response must be in the ${language} language.
If the language is not English, try to incorporate cultural elements, names, or scenarios common to the regions where ${language} is spoken to make it more relatable and memorable.
Use markdown for formatting.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating story for topic:", error);
        throw error;
    }
};

export const generateSyllabus = async (examCategory: string, language: string): Promise<SyllabusTopic[]> => {
    try {
        const prompt = `Generate a detailed, structured syllabus for the '${examCategory}' exam category in India.
The response must be a JSON array of topic objects.
Each topic object must have:
1.  "id": A unique string identifier (e.g., "history-1").
2.  "title": The name of the syllabus topic in the ${language} language.
3.  "children": An optional array of nested topic objects for sub-topics.

Create a comprehensive, nested structure. For example, "General Studies" might have children like "History", "Geography", and "Polity". "History" could then have children like "Ancient History", "Medieval History", and "Modern History".
Provide a rich, multi-level hierarchy. Do not make it a flat list.`;

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
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    $ref: "#" // Recursive reference for nested structure
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error generating syllabus for ${examCategory}:`, error);
        throw error;
    }
};


export const generateSyllabusInfo = async (jobRole: string, language: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a brief overview of the typical exam pattern and syllabus for the '${jobRole}' role in India's government sector. Format the response clearly using markdown (headings, lists). The entire response must be in the ${language} language. Keep it concise.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating syllabus info:", error);
        throw error;
    }
};

export const createInterviewSession = (jobRole: string, language: string): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert interviewer for a ${jobRole} position in the government sector. Your tone should be professional but encouraging. The entire interview must be conducted in the ${language}. Start by introducing yourself and the role in ${language}. Ask one question at a time. After the user responds, provide brief, constructive feedback in italics (in ${language}) and then ask the next relevant question. Keep the interview flowing naturally. Do not greet the user with "Hello". Jump right into the interview.`,
        },
    });
    return chat;
};

export const generateStatusUpdate = async (
    examCategory: string,
    subCategory: string,
    tier: string,
    language: string,
    updateType: 'Result' | 'Admit Card'
): Promise<ExamStatusUpdate> => {
    try {
        const tierPrompt = tier ? ` for the '${tier}' stage` : '';
        const prompt = `Act as a real-time information tracker. Simulate using a web crawler to perform a deep search and find the absolute latest status of the ${updateType} for the '${subCategory}' exam${tierPrompt}, part of the '${examCategory}' category in India.
Your response must be a JSON object containing:
1. "status": A concise status (e.g., "Released", "Announced", "Not Yet Released", "Available for Download", "Delayed", "Unavailable").
2. "details": A short, one-sentence summary of the current situation.
3. "link": The direct, official URL to view the ${updateType} or the main notification page. Prioritize the most direct link. If no link is available, return an empty string.

Be aware of website changes (e.g., ssc.nic.in to ssc.gov.in). Verify and provide the current, official link. It is critical this data is not stale. All text must be in the ${language} language.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING },
                        details: { type: Type.STRING },
                        link: { type: Type.STRING },
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`Error generating ${updateType} status for ${subCategory}:`, error);
        throw error;
    }
};

export const generateDailyBriefing = async (language: string): Promise<DailyBriefingData> => {
    try {
        const prompt = `Generate a "Daily Briefing" for a government job aspirant in India.
1.  First, provide a concise summary (around 100-150 words) of a single, recent, and highly important current affairs topic. This topic should be relevant to major exams like UPSC, SSC, Banking, etc.
2.  After the summary, create two distinct multiple-choice questions (MCQs) based *only* on the information presented in the summary.
3.  Each MCQ must have four options.
4.  Indicate the correct answer for each MCQ.
5.  The entire response, including the summary, questions, options, and correct answers, must be in the ${language} language.

The response must be in the specified JSON format.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A concise summary of a recent current affairs topic."
                        },
                        mcqs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswer: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        // Ensure that the mcqs property is always an array to prevent runtime errors.
        return {
            summary: data.summary || '',
            mcqs: data.mcqs || [],
        };

    } catch (error) {
        console.error("Error generating daily briefing:", error);
        throw error;
    }
};


export const getSpecificErrorMessage = (error: unknown): string => {
    if (error instanceof SyntaxError) { // Specific check for JSON parsing errors
        return "The AI returned an invalid format. This might be a temporary issue. Please try again.";
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('api key not valid')) {
            return "There's an issue with the application configuration. Please contact support.";
        }
        if (message.includes('rate limit') || message.includes('resource_exhausted')) {
            return "The AI service is currently busy due to high demand. Please wait a moment and try again.";
        }
        if (message.includes('safety') || message.includes('blocked')) {
            return "The request was blocked due to safety filters. Please try a different topic or phrasing.";
        }
        if (message.includes('network') || message.includes('failed to fetch')) {
             return "A network error occurred. Please check your internet connection and try again.";
        }
        if (message.includes('json')) {
             return "The AI returned an invalid format. This might be a temporary issue. Please try again.";
        }
        // Check for our custom offline error message
        if (message.includes('offline') && message.includes('downloaded')) {
            return message;
        }
        // Generic AI error
        return "An unexpected error occurred while communicating with the AI service. Please try again later.";
    }
    // Fallback for non-Error objects
    return "An unknown error occurred. Please try again later.";
};
