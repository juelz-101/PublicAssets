import { getGoogleAuthHeaders } from './google-auth';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds?: string[];
  payload?: any;
}

export const listGmailMessages = async (accessToken: string, query: string = "", maxResults: number = 10): Promise<GmailMessage[]> => {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Gmail list error: ${response.statusText}`);
  const data = await response.json();
  return data.messages || [];
};

export const getGmailMessage = async (accessToken: string, messageId: string, format: 'full' | 'metadata' | 'minimal' | 'raw' = 'full'): Promise<GmailMessage> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=${format}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Gmail get message error: ${response.statusText}`);
    return await response.json();
};

export const trashGmailMessage = async (accessToken: string, messageId: string): Promise<void> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/trash`;
    const response = await fetch(url, { method: 'POST', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Gmail trash message error: ${response.statusText}`);
};

export const sendGmailMessage = async (accessToken: string, rawBase64EncodedEmail: string): Promise<any> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ raw: rawBase64EncodedEmail })
    });
    if (!response.ok) throw new Error(`Gmail send error: ${response.statusText}`);
    return await response.json();
};

export const listGmailThreads = async (accessToken: string, query: string = "", maxResults: number = 10): Promise<any[]> => {
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=${maxResults}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Gmail list threads error: ${response.statusText}`);
    const data = await response.json();
    return data.threads || [];
};

export const getGmailThread = async (accessToken: string, threadId: string): Promise<any> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Gmail get thread error: ${response.statusText}`);
    return await response.json();
};

export const modifyGmailMessageLabels = async (accessToken: string, messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<GmailMessage> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ addLabelIds, removeLabelIds })
    });
    if (!response.ok) throw new Error(`Gmail modify labels error: ${response.statusText}`);
    return await response.json();
};

export const listGmailLabels = async (accessToken: string): Promise<any[]> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Gmail list labels error: ${response.statusText}`);
    const data = await response.json();
    return data.labels || [];
};

export const createGmailLabel = async (accessToken: string, name: string, labelListVisibility: 'labelShow' | 'labelHide', messageListVisibility: 'show' | 'hide'): Promise<any> => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ name, labelListVisibility, messageListVisibility })
    });
    if (!response.ok) throw new Error(`Gmail create label error: ${response.statusText}`);
    return await response.json();
};
