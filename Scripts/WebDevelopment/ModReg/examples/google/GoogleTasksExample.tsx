import React, { useState } from 'react';
import { listGoogleTaskLists, GoogleTaskList } from '../../modules/google/google-tasks';

const GoogleTasksExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [lists, setLists] = useState<GoogleTaskList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchLists = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await listGoogleTaskLists(token, 10);
            setLists(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-blue-400 max-w-2xl">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Google Tasks Example</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-blue-400/30 p-2 rounded text-sm outline-none focus:border-blue-400"
                />
                <button 
                    onClick={handleFetchLists} disabled={loading}
                    className="bg-blue-400/20 text-blue-400 border border-blue-400 px-4 py-2 rounded hover:bg-blue-400 hover:text-black transition-colors"
                >
                    {loading ? 'Fetching...' : 'Show Task Lists'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-blue-400/10 min-h-[100px] overflow-auto max-h-[300px]">
                {lists.length === 0 && !loading && <span className="text-gray-500">No task lists loaded yet.</span>}
                {lists.map((list, i) => (
                    <div key={list.id || i} className="mb-2 pb-2 border-b border-gray-800 last:border-0">
                        <div className="font-bold text-gray-200">{list.title}</div>
                        <div className="text-xs text-gray-500">Updated: {new Date(list.updated).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoogleTasksExample;
