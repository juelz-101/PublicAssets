import { getGoogleAuthHeaders } from './google-auth';

export const listGooglePhotosAlbums = async (accessToken: string, pageSize: number = 50): Promise<any[]> => {
  const url = `https://photoslibrary.googleapis.com/v1/albums?pageSize=${pageSize}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Photos list albums error: ${response.statusText}`);
  const data = await response.json();
  return data.albums || [];
};

export const getGooglePhotosAlbum = async (accessToken: string, albumId: string): Promise<any> => {
    const url = `https://photoslibrary.googleapis.com/v1/albums/${encodeURIComponent(albumId)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Photos get album error: ${response.statusText}`);
    return await response.json();
};

export const createGooglePhotosAlbum = async (accessToken: string, title: string): Promise<any> => {
    const url = `https://photoslibrary.googleapis.com/v1/albums`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ album: { title } })
    });
    if (!response.ok) throw new Error(`Photos create album error: ${response.statusText}`);
    return await response.json();
};

export const searchGooglePhotosMediaItems = async (accessToken: string, albumId?: string, pageSize: number = 50): Promise<any[]> => {
    const url = `https://photoslibrary.googleapis.com/v1/mediaItems:search`;
    const body: any = { pageSize };
    if (albumId) {
        body.albumId = albumId;
    }
    const response = await fetch(url, { 
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Photos search media error: ${response.statusText}`);
    const data = await response.json();
    return data.mediaItems || [];
};

export const getGooglePhotosMediaItem = async (accessToken: string, mediaItemId: string): Promise<any> => {
    const url = `https://photoslibrary.googleapis.com/v1/mediaItems/${encodeURIComponent(mediaItemId)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Photos get media item error: ${response.statusText}`);
    return await response.json();
};

export const batchGetGooglePhotosMediaItems = async (accessToken: string, mediaItemIds: string[]): Promise<any[]> => {
    const query = mediaItemIds.map(id => `mediaItemIds=${encodeURIComponent(id)}`).join('&');
    const url = `https://photoslibrary.googleapis.com/v1/mediaItems:batchGet?${query}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Photos batch get media error: ${response.statusText}`);
    const data = await response.json();
    return data.mediaItemResults || [];
};

export const uploadGooglePhotosMedia = async (accessToken: string, fileBytes: ArrayBuffer, mimeType: string, filename?: string): Promise<string> => {
    const url = `https://photoslibrary.googleapis.com/v1/uploads`;
    const headers: HeadersInit = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-Content-Type': mimeType,
        'X-Goog-Upload-Protocol': 'raw'
    };
    if (filename) headers['X-Goog-Upload-File-Name'] = filename;
    
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: fileBytes
    });
    if (!response.ok) throw new Error(`Photos upload error: ${response.statusText}`);
    return await response.text(); // returns upload token
};

export const batchCreateGooglePhotosMediaItems = async (accessToken: string, newMediaItems: Array<{description?: string, simpleMediaItem: {uploadToken: string}}>, albumId?: string): Promise<any> => {
    const url = `https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate`;
    const body: any = { newMediaItems };
    if (albumId) body.albumId = albumId;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Photos batch create media error: ${response.statusText}`);
    return await response.json();
};
