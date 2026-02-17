
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = (modelName = "gemini-1.5-flash") => {
    return genAI.getGenerativeModel({ model: modelName });
};

export const generateContent = async (prompt: string, systemInstruction?: string) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            ...(systemInstruction ? { systemInstruction } : {})
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw error;
    }
};
