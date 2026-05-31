import { getGoogleAuthHeaders } from './google-auth';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export const listGoogleDriveFiles = async (accessToken: string, query: string = ""): Promise<GoogleDriveFile[]> => {
  let url = 'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,webViewLink,thumbnailLink,parents)';
  if (query) url += `&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Drive list error: ${response.statusText}`);
  const data = await response.json();
  return data.files || [];
};

export const getGoogleDriveFileMetadata = async (accessToken: string, fileId: string): Promise<Record<string, any>> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=*`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Drive get file error: ${response.statusText}`);
    return await response.json();
};

export const deleteGoogleDriveFile = async (accessToken: string, fileId: string): Promise<void> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const response = await fetch(url, { method: 'DELETE', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Drive delete error: ${response.statusText}`);
};

export const createGoogleDriveFolder = async (accessToken: string, name: string, parentId?: string): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files`;
    const body: any = { name, mimeType: 'application/vnd.google-apps.folder' };
    if (parentId) body.parents = [parentId];
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Drive create folder error: ${response.statusText}`);
    return await response.json();
};

export const copyGoogleDriveFile = async (accessToken: string, fileId: string, name: string, parentId?: string): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/copy`;
    const body: any = { name };
    if (parentId) body.parents = [parentId];
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Drive copy file error: ${response.statusText}`);
    return await response.json();
};

export const moveGoogleDriveFile = async (accessToken: string, fileId: string, newParentId: string, currentParentId: string): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentId}&removeParents=${currentParentId}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getGoogleAuthHeaders(accessToken)
    });
    if (!response.ok) throw new Error(`Drive move file error: ${response.statusText}`);
    return await response.json();
};

export const emptyGoogleDriveTrash = async (accessToken: string): Promise<void> => {
    const url = `https://www.googleapis.com/drive/v3/files/trash`;
    const response = await fetch(url, { method: 'DELETE', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Drive empty trash error: ${response.statusText}`);
};

export const shareGoogleDriveFile = async (accessToken: string, fileId: string, role: 'reader' | 'commenter' | 'writer', type: 'user' | 'group' | 'domain' | 'anyone', emailAddress?: string): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
    const body: any = { role, type };
    if (emailAddress) body.emailAddress = emailAddress;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Drive share file error: ${response.statusText}`);
    return await response.json();
};

export const downloadGoogleDriveMedia = async (accessToken: string, fileId: string): Promise<Blob> => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Drive download file error: ${response.statusText}`);
    return await response.blob();
};
