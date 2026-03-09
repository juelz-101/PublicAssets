import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("API_KEY environment variable not set. Palette generator will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates a color palette based on a descriptive prompt using the Gemini API.
 * @param prompt A description of the desired palette theme (e.g., "serene forest morning").
 * @returns A promise that resolves to an array of hex color strings.
 */
export const generatePalette = async (prompt: string): Promise<string[]> => {
    if (!apiKey) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a color palette for: ${prompt}`,
            config: {
                systemInstruction: "You are an expert color palette designer. Based on the user's prompt, generate a harmonious color palette of 6 hex color codes. The colors should work well together in a user interface. Return only a JSON object with a single key 'palette' which is an array of hex code strings.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palette: {
                            type: Type.ARRAY,
                            description: "An array of 6 hex color code strings.",
                            items: {
                                type: Type.STRING,
                                description: "A hex color code string (e.g., '#RRGGBB')."
                            },
                        },
                    },
                    required: ["palette"],
                },
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (result && Array.isArray(result.palette)) {
            return result.palette;
        } else {
            throw new Error("Invalid response format from API. Expected { palette: [...] }.");
        }

    } catch (error) {
        console.error("Error generating palette with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate palette: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the API.");
    }
};
