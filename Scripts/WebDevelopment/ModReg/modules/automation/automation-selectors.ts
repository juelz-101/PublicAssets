// modules/automation/automation-selectors.ts
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface SelectorResult {
    css: string;
    xpath: string;
    stabilityScore: number;
    explanation: string;
}

/**
 * Uses Gemini to find the most resilient CSS and XPath selectors for a given HTML snippet and target element description.
 */
export const findResilientSelector = async (html: string, targetDescription: string): Promise<SelectorResult> => {
    if (!apiKey) throw new Error("API Key not configured.");

    const prompt = `Given the following HTML snippet:
\`\`\`html
${html}
\`\`\`
Find the most stable and resilient CSS and XPath selector for the element described as: "${targetDescription}".
Prioritize data-attributes, IDs, and semantic tags over brittle class names.
Return the result as a JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        css: { type: Type.STRING },
                        xpath: { type: Type.STRING },
                        stabilityScore: { type: Type.NUMBER, description: "1-100 score of how likely this is to break on site update." },
                        explanation: { type: Type.STRING }
                    },
                    required: ["css", "xpath", "stabilityScore", "explanation"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error(e);
        throw new Error("Failed to generate resilient selector.");
    }
};

/**
 * Common selector patterns for standard UI elements.
 */
export const COMMON_PATTERNS = {
    LOGIN_SUBMIT: 'button[type="submit"], input[type="submit"]',
    SEARCH_INPUT: 'input[type="search"], input[name*="search" i]',
    PAGINATION_NEXT: 'a[rel="next"], button[aria-label*="next" i]',
    SOCIAL_LINKS: 'a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"]'
};
