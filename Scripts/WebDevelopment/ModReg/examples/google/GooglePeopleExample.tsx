import React, { useState } from 'react';
import { getGoogleProfile } from '../../modules/google/google-people';

const GooglePeopleExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchProfile = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await getGoogleProfile(token);
            setProfile(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-green-400 max-w-2xl">
            <h2 className="text-xl font-bold text-green-400 mb-4">Google People API Example</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-green-400/30 p-2 rounded text-sm outline-none focus:border-green-400"
                />
                <button 
                    onClick={handleFetchProfile} disabled={loading}
                    className="bg-green-400/20 text-green-400 border border-green-400 px-4 py-2 rounded hover:bg-green-400 hover:text-black transition-colors"
                >
                    {loading ? 'Fetching...' : 'Show Profile Info'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-green-400/10 min-h-[100px] overflow-auto max-h-[300px]">
                {!profile && !loading && <span className="text-gray-500">No profile loaded yet.</span>}
                {profile && (
                    <div>
                        <div className="text-sm font-mono text-gray-300 break-all bg-black/50 p-2 rounded">
                            {JSON.stringify(profile, null, 2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GooglePeopleExample;
