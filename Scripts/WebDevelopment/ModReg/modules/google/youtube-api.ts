import { getGoogleAuthHeaders } from './google-auth';

export interface YouTubeVideoItem {
    id: any;
    snippet: Record<string, any>;
    contentDetails?: Record<string, any>;
    statistics?: Record<string, any>;
}

export const searchYouTubeVideos = async (accessToken: string, query: string, maxResults: number = 5): Promise<YouTubeVideoItem[]> => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube search error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const getYouTubeVideoDetails = async (accessToken: string, videoId: string): Promise<YouTubeVideoItem> => {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube video details error: ${response.statusText}`);
    const data = await response.json();
    return data.items?.[0];
};

export const listYouTubePlaylists = async (accessToken: string, maxResults: number = 5): Promise<any[]> => {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=${maxResults}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube list playlists error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const getYouTubePlaylistItems = async (accessToken: string, playlistId: string, maxResults: number = 10): Promise<any[]> => {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=${maxResults}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube get playlist items error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const listYouTubeSubscriptions = async (accessToken: string, maxResults: number = 10): Promise<any[]> => {
    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet,contentDetails&mine=true&maxResults=${maxResults}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube subscriptions error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const rateYouTubeVideo = async (accessToken: string, videoId: string, rating: 'like' | 'dislike' | 'none'): Promise<void> => {
    const url = `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(videoId)}&rating=${rating}`;
    const response = await fetch(url, { method: 'POST', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube rate video error: ${response.statusText}`);
};

export const listYouTubeComments = async (accessToken: string, videoId: string, maxResults: number = 10): Promise<any[]> => {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${encodeURIComponent(videoId)}&maxResults=${maxResults}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`YouTube list comments error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const insertYouTubeComment = async (accessToken: string, videoId: string, textOriginal: string): Promise<any> => {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet`;
    const body = {
        snippet: {
            videoId,
            topLevelComment: { snippet: { textOriginal } }
        }
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`YouTube insert comment error: ${response.statusText}`);
    return await response.json();
};
