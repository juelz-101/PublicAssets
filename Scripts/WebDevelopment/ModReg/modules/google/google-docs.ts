import { getGoogleAuthHeaders } from './google-auth';

export const getGoogleDoc = async (accessToken: string, documentId: string): Promise<any> => {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Docs get error: ${response.statusText}`);
  return await response.json();
};

export const createGoogleDoc = async (accessToken: string, title: string): Promise<any> => {
    const url = `https://docs.googleapis.com/v1/documents`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ title })
    });
    if (!response.ok) throw new Error(`Docs create error: ${response.statusText}`);
    return await response.json();
};

export const batchUpdateGoogleDoc = async (accessToken: string, documentId: string, requests: any[]): Promise<any> => {
    const url = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ requests })
    });
    if (!response.ok) throw new Error(`Docs batch update error: ${response.statusText}`);
    return await response.json();
};

export const insertTextGoogleDoc = async (accessToken: string, documentId: string, text: string, index: number): Promise<any> => {
    return await batchUpdateGoogleDoc(accessToken, documentId, [
        { insertText: { location: { index }, text } }
    ]);
};

export const replaceAllTextGoogleDoc = async (accessToken: string, documentId: string, containsText: string, replaceText: string): Promise<any> => {
    return await batchUpdateGoogleDoc(accessToken, documentId, [
        { 
            replaceAllText: { 
                containsText: { text: containsText, matchCase: true }, 
                replaceText 
            } 
        }
    ]);
};
