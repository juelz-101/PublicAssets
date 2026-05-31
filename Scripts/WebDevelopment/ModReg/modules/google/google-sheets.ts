import { getGoogleAuthHeaders } from './google-auth';

export const getGoogleSheetValues = async (accessToken: string, spreadsheetId: string, range: string): Promise<any[][]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Sheets get error: ${response.statusText}`);
  const data = await response.json();
  return data.values || [];
};

export const appendGoogleSheetValues = async (accessToken: string, spreadsheetId: string, range: string, values: any[][]): Promise<any> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
      method: 'POST',
      headers: getGoogleAuthHeaders(accessToken),
      body: JSON.stringify({ values })
  });
  if (!response.ok) throw new Error(`Sheets append error: ${response.statusText}`);
  return await response.json();
};

export const updateGoogleSheetValues = async (accessToken: string, spreadsheetId: string, range: string, values: any[][]): Promise<any> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ values })
    });
    if (!response.ok) throw new Error(`Sheets update error: ${response.statusText}`);
    return await response.json();
};

export const clearGoogleSheetValues = async (accessToken: string, spreadsheetId: string, range: string): Promise<any> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
    });
    if (!response.ok) throw new Error(`Sheets clear error: ${response.statusText}`);
    return await response.json();
};

export const batchGetGoogleSheetValues = async (accessToken: string, spreadsheetId: string, ranges: string[]): Promise<any> => {
    const query = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${query}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Sheets batch get error: ${response.statusText}`);
    return await response.json();
};

export const createGoogleSpreadsheet = async (accessToken: string, title: string): Promise<any> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ properties: { title } })
    });
    if (!response.ok) throw new Error(`Sheets create error: ${response.statusText}`);
    return await response.json();
};

export const getGoogleSpreadsheetMetadata = async (accessToken: string, spreadsheetId: string): Promise<any> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Sheets get metadata error: ${response.statusText}`);
    return await response.json();
};

export const batchUpdateGoogleSpreadsheet = async (accessToken: string, spreadsheetId: string, requests: any[]): Promise<any> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ requests })
    });
    if (!response.ok) throw new Error(`Sheets batch update error: ${response.statusText}`);
    return await response.json();
};
