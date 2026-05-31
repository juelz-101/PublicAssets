import React, { useState } from 'react';
import { searchYouTubeVideos, YouTubeVideoItem } from '../../modules/google/youtube-api';

const YouTubeExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [query, setQuery] = useState('ZIKYinc');
    const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await searchYouTubeVideos(token, query);
            setVideos(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-red-500 max-w-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-4">YouTube API Example</h2>
            
            <div className="space-y-3 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-black/50 border border-red-500/30 p-2 rounded text-sm outline-none focus:border-red-500"
                />
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Search Query..." value={query} onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-black/50 border border-red-500/30 p-2 rounded text-sm outline-none focus:border-red-500"
                    />
                    <button 
                        onClick={handleSearch} disabled={loading}
                        className="bg-red-500/20 text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-black transition-colors"
                    >
                        {loading ? 'Searching...' : 'Search Videos'}
                    </button>
                </div>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-red-500/10 min-h-[100px] overflow-auto max-h-[300px]">
                {videos.length === 0 && !loading && <span className="text-gray-500">No videos found yet.</span>}
                {videos.map((video, i) => (
                    <div key={i} className="mb-3 border-b border-gray-800 pb-2 flex gap-4">
                        {video.snippet.thumbnails?.default?.url && (
                             <img src={video.snippet.thumbnails.default.url} alt="thumbnail" className="w-24 h-fit rounded" />
                        )}
                        <div>
                            <div className="font-bold text-sm text-gray-200">{video.snippet.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{video.snippet.channelTitle}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YouTubeExample;
