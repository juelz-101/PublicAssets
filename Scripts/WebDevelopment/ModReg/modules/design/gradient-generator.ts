import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("API_KEY environment variable not set. Gradient generator will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface ColorStop {
    color: string; // hex format
    position: string; // e.g., "0%", "50%"
}

interface GradientResponse {
    type: 'linear-gradient' | 'radial-gradient';
    angle?: string; // e.g., "90deg" for linear
    shape?: string; // e.g., "circle" for radial
    position?: string; // e.g., "at center" for radial
    stops: ColorStop[];
}

/**
 * Generates a CSS gradient string based on a descriptive prompt using the Gemini API.
 * @param prompt A description of the desired gradient theme (e.g., "ocean sunrise").
 * @returns A promise that resolves to a valid CSS background property string.
 */
export const generateGradient = async (prompt: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a CSS gradient for: ${prompt}`,
            config: {
                systemInstruction: "You are an expert CSS gradient designer. Based on the user's prompt, generate properties for a beautiful, harmonious gradient with 3 to 5 color stops. Return only a JSON object matching the provided schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, description: "The gradient type, 'linear-gradient' or 'radial-gradient'." },
                        angle: { type: Type.STRING, description: "For linear gradients, the angle (e.g., '45deg'). Optional." },
                        shape: { type: Type.STRING, description: "For radial gradients, the shape (e.g., 'circle'). Optional." },
                        position: { type: Type.STRING, description: "For radial gradients, the position (e.g., 'at center'). Optional." },
                        stops: {
                            type: Type.ARRAY,
                            description: "An array of 3 to 5 color stops.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    color: { type: Type.STRING, description: "Hex color code (e.g., '#RRGGBB')." },
                                    position: { type: Type.STRING, description: "Position of the color stop (e.g., '0%', '50%')." },
                                },
                                required: ["color", "position"],
                            },
                        },
                    },
                    required: ["type", "stops"],
                },
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString) as GradientResponse;

        if (result && result.type && Array.isArray(result.stops)) {
            const stopsString = result.stops.map(s => `${s.color} ${s.position}`).join(', ');
            if (result.type === 'linear-gradient') {
                return `linear-gradient(${result.angle || '180deg'}, ${stopsString})`;
            } else if (result.type === 'radial-gradient') {
                const shapeAndPos = [result.shape, result.position].filter(Boolean).join(' ');
                return `radial-gradient(${shapeAndPos ? shapeAndPos + ', ' : ''}${stopsString})`;
            }
        }
        
        throw new Error("Invalid response format from API.");

    } catch (error) {
        console.error("Error generating gradient with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate gradient: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the API.");
    }
};
