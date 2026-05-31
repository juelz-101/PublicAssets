import React, { useState } from 'react';
import { getGoogleDoc } from '../../modules/google/google-docs';

const GoogleDocsExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [docId, setDocId] = useState('');
    const [docData, setDocData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchDoc = async () => {
        if (!token || !docId) {
            setError('Please provide token and Document ID');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await getGoogleDoc(token, docId);
            setDocData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-blue-500 max-w-2xl">
            <h2 className="text-xl font-bold text-blue-500 mb-4">Google Docs API Example</h2>
            
            <div className="space-y-3 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-black/50 border border-blue-500/30 p-2 rounded text-sm outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Document ID" value={docId} onChange={(e) => setDocId(e.target.value)}
                        className="flex-1 bg-black/50 border border-blue-500/30 p-2 rounded text-sm outline-none focus:border-blue-500"
                    />
                    <button 
                        onClick={handleFetchDoc} disabled={loading}
                        className="bg-blue-500/20 text-blue-500 border border-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-black transition-colors"
                    >
                        {loading ? 'Fetching...' : 'Get Document'}
                    </button>
                </div>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-blue-500/10 min-h-[100px] overflow-auto max-h-[300px]">
                {!docData && !loading && <span className="text-gray-500">No document loaded yet.</span>}
                {docData && (
                    <div>
                        <div className="font-bold mb-2">Title: {docData.title}</div>
                        <div className="text-xs font-mono text-gray-400 break-all bg-black/50 p-2 rounded">
                            {JSON.stringify(docData.documentStyle, null, 2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleDocsExample;
