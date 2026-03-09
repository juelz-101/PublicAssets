
import { GoogleGenAI } from "@google/genai";

// The API key MUST be obtained exclusively from the environment variable.
// This code assumes `process.env.API_KEY` is pre-configured and accessible.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API_KEY environment variable not set. Gemini service will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface ImagePart {
    inlineData: {
        data: string; // base64 encoded string
        mimeType: string;
    };
}

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (!apiKey) {
    return Promise.resolve("Error: API key is not configured. Please set the API_KEY environment variable.");
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    return "An error occurred while communicating with the API.";
  }
};

export const generateTextFromImage = async (prompt: string, image: ImagePart): Promise<string> => {
    if (!apiKey) {
        return Promise.resolve("Error: API key is not configured. Please set the API_KEY environment variable.");
    }
    try {
        const textPart = { text: prompt };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [image, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text from image with Gemini:", error);
        return "An error occurred while communicating with the API.";
    }
};
