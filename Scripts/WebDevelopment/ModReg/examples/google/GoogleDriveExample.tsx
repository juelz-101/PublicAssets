import React, { useState } from 'react';
import { listGoogleDriveFiles } from '../../modules/google/google-drive';

const GoogleDriveExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleListFiles = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await listGoogleDriveFiles(token);
            setFiles(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-neon-teal max-w-2xl">
            <h2 className="text-xl font-bold text-neon-teal mb-4">Google Drive Example</h2>
            <p className="mb-4 text-sm text-gray-400">List files from your Google Drive using a valid OAuth2 access token.</p>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Enter Access Token..." 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-neon-teal/30 p-2 rounded text-sm outline-none focus:border-neon-teal"
                />
                <button 
                    onClick={handleListFiles}
                    disabled={loading}
                    className="bg-neon-teal/20 text-neon-teal border border-neon-teal px-4 py-2 rounded hover:bg-neon-teal hover:text-black transition-colors"
                >
                    {loading ? 'Loading...' : 'List Files'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-neon-teal/10 min-h-[100px] overflow-auto max-h-[300px]">
                {files.length === 0 && !loading && <span className="text-gray-500">No files loaded yet.</span>}
                {files.map((file, i) => (
                    <div key={file.id || i} className="mb-2 pb-2 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0 text-sm">
                        <span className="font-bold text-gray-200">{file.name}</span>
                        <span className="text-gray-500 text-xs ml-2">({file.mimeType})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoogleDriveExample;
