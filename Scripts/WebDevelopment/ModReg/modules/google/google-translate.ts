import { getGoogleAuthHeaders } from './google-auth';

// Requires Cloud Translation API
export const translateText = async (accessToken: string, q: string | string[], target: string, source?: string, format: 'html' | 'text' = 'text'): Promise<any> => {
    const url = `https://translation.googleapis.com/language/translate/v2`;
    const body: any = { q, target, format };
    if (source) body.source = source;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Translate error: ${response.statusText}`);
    const data = await response.json();
    return data.data.translations;
};

export const detectLanguage = async (accessToken: string, q: string | string[]): Promise<any> => {
    const url = `https://translation.googleapis.com/language/translate/v2/detect`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ q })
    });
    if (!response.ok) throw new Error(`Translate detect error: ${response.statusText}`);
    const data = await response.json();
    return data.data.detections;
};

export const getSupportedLanguages = async (accessToken: string, target?: string): Promise<any> => {
    let url = `https://translation.googleapis.com/language/translate/v2/languages`;
    if (target) url += `?target=${target}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Translate list languages error: ${response.statusText}`);
    const data = await response.json();
    return data.data.languages;
};
