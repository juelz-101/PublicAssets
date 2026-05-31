import React, { useState } from 'react';
import { listGmailMessages, GmailMessage } from '../../modules/google/google-gmail';

const GmailExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [messages, setMessages] = useState<GmailMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchMessages = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await listGmailMessages(token, "is:inbox", 5);
            setMessages(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-red-400 max-w-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-4">Gmail API Example</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-red-400/30 p-2 rounded text-sm outline-none focus:border-red-400"
                />
                <button 
                    onClick={handleFetchMessages} disabled={loading}
                    className="bg-red-400/20 text-red-400 border border-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-black transition-colors"
                >
                    {loading ? 'Fetching...' : 'Show Inbox'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-red-400/10 min-h-[100px] overflow-auto max-h-[300px]">
                {messages.length === 0 && !loading && <span className="text-gray-500">No emails loaded yet.</span>}
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className="mb-3 border-b border-gray-800 pb-2">
                        <div className="text-xs font-mono text-gray-500">ID: {msg.id}</div>
                        <div className="text-sm text-gray-300 mt-1">{msg.snippet || 'No snippet available'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GmailExample;
