import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API_KEY environment variable not set. Image editor service will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface ImageEditResult {
    image?: {
        base64: string;
        mimeType: string;
    };
    text?: string;
}

/**
 * Edits an image based on a text prompt using the Gemini image editing model.
 * @param base64ImageData The base64 encoded string of the source image.
 * @param mimeType The IANA standard MIME type of the source image.
 * @param prompt The text prompt describing the desired edits.
 * @returns A promise that resolves to an object containing the new image and any text response.
 */
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<ImageEditResult> => {
    if (!apiKey) {
        return Promise.resolve({ text: "Error: API key is not configured. Please set the API_KEY environment variable." });
    }
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const result: ImageEditResult = {};
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                result.text = part.text;
            } else if (part.inlineData) {
                result.image = {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        return result;

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        return { text: "An error occurred while communicating with the API. Check the console for details." };
    }
};
