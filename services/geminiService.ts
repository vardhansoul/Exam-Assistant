



import { GoogleGenAI, Type, Chat } from "@google/genai";
// Added DailyBriefingData, GroundedSummary, GroundingSource types to imports
import type { ExamDetailGroup, SyllabusTopic, ExamStatusUpdate, StudyMaterial, ExamByQualification, MindMapNode, GuessPaper, PerformanceSummary, RankPrediction, Quiz, StudyPlan, DailyBriefingData, GroundedSummary, GroundingSource } from '../types';
import { saveStudyNotesToCache, getApiCache, setApiCache, isCacheStale } from '../utils/tracking';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getCachedData<T>(key: string, fetcher: () => Promise<T>, staleMs?: number): Promise<T> {
    const isOnline = navigator.onLine;
    const cachedEntry = getApiCache<T>(key);

    if (cachedEntry) {
        if (!isOnline || !isCacheStale(cachedEntry.timestamp, staleMs)) {
            return cachedEntry.data;
        }
    }

    if (!isOnline) {
        throw new Error("You are offline and this data has not been downloaded.");
    }

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


export const generateStudyNotes = async (topic: string, language: string): Promise<StudyMaterial> => {
    const cacheKey = `study-notes-${topic}-${language}`;
    const cachedNotes = getApiCache<StudyMaterial>(cacheKey);

    if (cachedNotes && !isCacheStale(cachedNotes.timestamp)) {
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
        
        saveStudyNotesToCache(topic, language, material);
        setApiCache(cacheKey, material);
        
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
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating story for topic ${topic}:`, error);
        throw error;
    }
};

export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number, language: string): Promise<Quiz> => {
    const prompt = `Generate a multiple-choice quiz about the topic '${topic}' for a government job exam aspirant in India.
The quiz should have a difficulty level of '${difficulty}'.
It must contain exactly ${numQuestions} questions.

For each question, provide:
1. "question": The question text in the ${language} language.
2. "questionEnglish": The same question text in English.
3. "options": An array of 4 distinct string options in the ${language} language.
4. "optionsEnglish": An array of the same 4 options in English.
5. "correctAnswer": The correct option from the "options" array.

The response must be a single JSON object with a "title" for the quiz and a "questions" array, following the structure described above. Do not include any text before or after the JSON object.`;
    
    try {
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
                                    question: { type: Type.STRING },
                                    questionEnglish: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    optionsEnglish: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error(`Error generating quiz for topic ${topic}:`, error);
        throw error;
    }
};

export const generateMicroTopics = async (mainTopic: string, language: string): Promise<string[]> => {
    const prompt = `Break down the broad subject '${mainTopic}' into a list of 5-10 specific, smaller micro-topics suitable for a study session. The response must be a JSON array of strings. All topics must be in the ${language} language.`;
    const cacheKey = `micro-topics-${mainTopic}-${language}`;

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
                                items: {
                                    type: Type.STRING
                                }
                            }
                        }
                    }
                }
            });
            const data: { topics?: string[] } = JSON.parse(response.text.trim());
            return data.topics || [];
        } catch (error) {
            console.error(`Error generating micro-topics for ${mainTopic}:`, error);
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
3. "details": A brief, one-sentence description of the topic.
4. "children": An optional array of topic objects for sub-topics, following the same structure.
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
                                    details: { type: Type.STRING },
                                    children: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                id: { type: Type.STRING },
                                                title: { type: Type.STRING },
                                                details: { type: Type.STRING },
                                                children: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            id: { type: Type.STRING },
                                                            title: { type: Type.STRING },
                                                            details: { type: Type.STRING },
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
    const cacheKey = `status-${type}-${exam}-${subCategory}-${tier}-${language}`;
    const STALE_MS = 30 * 60 * 1000; // 30 minutes

    return getCachedData(cacheKey, async () => {
        try {
            const tierPrompt = tier ? ` for the '${tier}' stage` : '';
            const prompt = `Check the latest status of the '${type}' for the '${subCategory}' exam${tierPrompt}, which is part of the '${exam}' category.
Provide a concise update. Respond with ONLY a valid JSON object with the following keys:
1. "status": A short status line (e.g., "Result Released", "Admit Card Available", "Not Yet Announced").
2. "details": A one-sentence explanation providing more context (e.g., "The official results were declared on July 20, 2024.", "Admit cards can be downloaded until the exam date.").
3. "link": The most relevant official URL for the update, if available. If not, this field should be null.
All text content must be in the ${language} language. Do not include any text before or after the JSON object.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                }
            });

            const parsed: { status: string; details: string; link?: string | null } = JSON.parse(response.text.trim());
            if (parsed.link === "null" || parsed.link === "") {
                parsed.link = null;
            }

            return parsed as ExamStatusUpdate;

        } catch (error) {
            console.error(`Error generating status update for ${subCategory}:`, error);
            throw error;
        }
    }, STALE_MS);
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

export const generateGuessPaper = async (topic: string, language: string): Promise<GuessPaper> => {
    const prompt = `Act as an expert exam analyst for Indian government job exams. Your task is to generate a "guess paper" for the topic '${topic}'.
This should consist of 5-7 high-probability, exam-style questions that a candidate should practice.
For each question, provide a detailed, comprehensive answer that explains the concept, not just the solution. Use markdown for formatting the answer.
The response must be a valid JSON object with a "title" (e.g., "Guess Paper: Indian Polity") and a "questions" array.
Each object in the "questions" array must have a "question" key and an "answer" key.
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
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    answer: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error generating guess paper for topic ${topic}:`, error);
        throw error;
    }
};

export const generateStudyPlan = async (
    summary: Omit<PerformanceSummary, 'topicsStudied' | 'studyStreak'>,
    examContext: string,
    availableTopics: string[],
    language: string
): Promise<StudyPlan> => {
    const prompt = `Act as an expert AI tutor for Indian competitive exams. The user is preparing for the '${examContext}' exam.
Their current performance summary is:
- Total Quizzes Taken: ${summary.totalQuizzes}
- Average Score: ${summary.averageScore}%
- Topics Mastered (score > 80%): ${summary.masteredTopics.join(', ') || 'None yet'}
- Weak Topics (score < 60%): ${summary.weakTopics.join(', ') || 'None yet'}
- All available study topics for this exam: ${availableTopics.join(', ')}

Based on this data, create a personalized 5-day study plan to help the user improve.
- Prioritize weak topics for study.
- Reinforce mastered topics or introduce new topics with quizzes.
- Introduce new topics from the available list that haven't been mastered or identified as weak.
- For each day, suggest one or two tasks.

The response must be a valid JSON object with a "title" (e.g., "Your 5-Day Personalized Study Plan") and a "plan" array.
Each object in the "plan" array must have:
1. "day": A string (e.g., "Day 1").
2. "topic": A string, which MUST be one of the topics from the "All available study topics" list provided above.
3. "activity": A string, either "Study Notes" or "Take Quiz".
4. "reason": A short, encouraging explanation for why this task was chosen.
All text must be in ${language}.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
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
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error generating study plan:`, error);
        throw error;
    }
};

export const predictRank = async (summary: PerformanceSummary, examContext: string, language: string): Promise<RankPrediction> => {
    const prompt = `Act as an AI-powered exam performance analyst. Given the following performance summary for a candidate preparing for the '${examContext}' exam:
- Total Quizzes Taken: ${summary.totalQuizzes}
- Average Score: ${summary.averageScore}%
- Topics Studied: ${summary.topicsStudied}
- Topics Mastered (score > 80% consistently): ${summary.masteredTopics.length}
- Weak Topics (score < 60% consistently): ${summary.weakTopics.length}
- Current Study Streak: ${summary.studyStreak} days

Based on this data, provide a realistic but encouraging analysis. The response must be a JSON object with three keys:
1. "predictedRank": A string representing a predicted performance bracket (e.g., "Top 10-15%", "Likely to Qualify", "Needs Improvement to Clear Cut-off").
2. "analysis": A brief, one-paragraph analysis explaining the prediction based on the provided stats.
3. "recommendations": A JSON array of 3-4 short, actionable recommendations for improvement.
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
                        predictedRank: { type: Type.STRING },
                        analysis: { type: Type.STRING },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error predicting rank:`, error);
        throw error;
    }
};

export const generateShortcuts = async (topic: string, language: string): Promise<string> => {
    const prompt = `Generate a list of useful shortcuts, tricks, and important formulas for the competitive exam topic: '${topic}'. The content should be practical for aspirants preparing for exams like SSC, Banking, and Railways in India. Use markdown for formatting, with headings for different types of shortcuts or formulas. All content must be in the ${language} language.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating shortcuts for topic ${topic}:`, error);
        throw error;
    }
};

// Added generateDailyBriefing function to fix import error in DailyBriefing.tsx.
export const generateDailyBriefing = async (language: string): Promise<DailyBriefingData> => {
    const prompt = `Generate a daily current affairs briefing for a student preparing for government exams in India.
The briefing should include:
1. A concise "summary" of the top 3-4 most important news items from the last 24 hours.
2. A list of 2 "mcqs" (multiple-choice questions) based on the summary to test understanding. Each MCQ should have a "question", an array of 4 "options", and the "correctAnswer".

The entire response must be a single JSON object with a "summary" key (string) and an "mcqs" key (array of objects). All text must be in the ${language} language.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
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
                                    correctAnswer: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error generating daily briefing:', error);
        throw error;
    }
};

// Added generateGroundedSummary function to fix import error in CurrentAffairsAnalyst.tsx.
export const generateGroundedSummary = async (topic: string, language: string, frequency: string, examContext: string): Promise<GroundedSummary> => {
    const focusPrompt = topic ? ` with a special focus on '${topic}'` : '';
    const prompt = `Generate a current affairs summary for a '${examContext}' exam candidate in India.
The summary should cover events from the '${frequency}' period${focusPrompt}.
Structure the output with markdown headings for different sections (e.g., ## National, ## Economy, ## International).
Provide a detailed, well-organized summary.
The entire response text must be in the ${language} language.
Crucially, use Google Search to ground the information and provide up-to-date, factual content.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        // Extract sources from grounding metadata
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .filter((chunk: any) => chunk.web)
            .map((chunk: any) => ({ web: { uri: chunk.web.uri, title: chunk.web.title || '' } }));

        return {
            text: response.text,
            sources: sources,
        };
    } catch (error) {
        console.error('Error generating grounded summary:', error);
        throw error;
    }
};

// Added createCurrentAffairsChat function to fix import error in CurrentAffairsAnalyst.tsx.
export const createCurrentAffairsChat = (topic: string, summaryText: string, language: string, frequency: string, examContext: string): Chat => {
    const focusPrompt = topic ? ` with a special focus on '${topic}'` : '';
    const systemInstruction = `You are an AI assistant and expert analyst for Indian competitive exams.
Your knowledge is based on the following current affairs summary for a '${examContext}' candidate, covering the '${frequency}' period${focusPrompt}:
---
${summaryText}
---
Answer the user's follow-up questions based *only* on the information provided in this summary.
If the answer is not in the summary, state that the information is not available in the provided context.
Keep your answers concise and to the point.
All your responses must be in the ${language} language.`;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        }
    });
};


export const getSpecificErrorMessage = (error: any): string => {
    console.error("AI Service Error:", error);
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('api key not valid')) {
        return "The provided API Key is invalid. Please check your configuration.";
    }
    if (message.includes('fetch failed') || message.includes('network error')) {
        return "Network error. Please check your internet connection and try again.";
    }
    if (message.includes('[503]') || message.includes('service unavailable')) {
        return "The AI service is currently experiencing temporary issues. Please try again in a few minutes.";
    }
    if (message.includes('json') || message.includes('unexpected token')) {
        return "The AI returned an unexpected response format. This can happen occasionally. Please try again.";
    }
    if (error.toString().includes('429')) {
        return "You have exceeded your API quota. Please check your usage and try again later.";
    }
    return `An unexpected error occurred: ${error.message || 'Unknown error. Please check the console for details.'}`;
};