import React, { useState } from 'react';
import { listGooglePhotosAlbums } from '../../modules/google/google-photos';

const GooglePhotosExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchAlbums = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await listGooglePhotosAlbums(token, 10);
            setAlbums(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-pink-400 max-w-2xl">
            <h2 className="text-xl font-bold text-pink-400 mb-4">Google Photos Example</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-pink-400/30 p-2 rounded text-sm outline-none focus:border-pink-400"
                />
                <button 
                    onClick={handleFetchAlbums} disabled={loading}
                    className="bg-pink-400/20 text-pink-400 border border-pink-400 px-4 py-2 rounded hover:bg-pink-400 hover:text-black transition-colors"
                >
                    {loading ? 'Fetching...' : 'Show Albums'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-pink-400/10 min-h-[100px] overflow-auto max-h-[300px]">
                {albums.length === 0 && !loading && <span className="text-gray-500">No albums loaded yet.</span>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {albums.map((album, i) => (
                        <div key={album.id || i} className="bg-black/50 border border-gray-800 rounded p-2 text-center">
                            <div className="font-bold text-sm text-gray-200 truncate" title={album.title}>{album.title}</div>
                            <div className="text-xs text-gray-500">{album.mediaItemsCount || 0} items</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GooglePhotosExample;
