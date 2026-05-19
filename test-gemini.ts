import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: "What is the latest government job?",
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        console.log("Success:", !!response.text);
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}
test();
