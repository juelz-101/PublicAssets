// modules/ai/gemini-chat.ts
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// The API key MUST be obtained exclusively from the environment variable.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API_KEY environment variable not set. Gemini chat service will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Creates a new chat session with the Gemini API.
 * @param options Optional parameters to initialize the chat, excluding the model name which is fixed.
 * @returns A Chat instance from the @google/genai SDK.
 */
// FIX: StartChatParams is not exported by @google/genai. Using 'any' for options to maintain flexibility and avoid import errors.
export const createChat = (options?: any): Chat => {
    if (!apiKey) {
        const errorMessage = "Error: API key is not configured. Please set the API_KEY environment variable.";
        // This is a simplified mock. The real response object is more complex, but this works for accessing `response.text`.
        // FIX: Added missing properties required by the GenerateContentResponse interface (data, functionCalls, executableCode, codeExecutionResult) 
        // and used 'as any' to satisfy the strict type checker while keeping the mock lightweight.
        const errorResponse: GenerateContentResponse = {
            text: errorMessage,
            candidates: [],
            usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            data: undefined,
            functionCalls: undefined,
            executableCode: undefined,
            codeExecutionResult: undefined
        } as any;

        // FIX: Cast the mock object to 'any' before assigning to Chat to bypass extensive internal property requirements 
        // (like apiClient and modelsModule) of the SDK's Chat type that are not needed for this fallback.
        const mockChat: Chat = {
            async sendMessage() {
                return Promise.resolve(errorResponse);
            },
            async sendMessageStream() {
                async function* streamGenerator() {
                    yield errorResponse;
                }
                return streamGenerator();
            }
        } as any;
        return mockChat;
    }

    return ai.chats.create({
        // FIX: Updated model to 'gemini-3-flash-preview' as per coding guidelines for basic text tasks.
        model: 'gemini-3-flash-preview',
        ...options,
    });
};