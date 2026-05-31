import React from 'react';
import { getGoogleAuthHeaders, parseGoogleAuthResponse } from '../../modules/google/google-auth';

const GoogleAuthExample: React.FC = () => {
    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-neon-teal">
            <h2 className="text-xl font-bold text-neon-teal mb-4">Google Auth Utilities</h2>
            <p className="mb-2 text-sm text-gray-300">Provides standalone utility functions for preparing Google OAuth2 headers and parsing the authorization callback hash.</p>
            
            <div className="bg-black/50 p-4 rounded-lg mt-4 font-mono text-sm border border-neon-teal/20">
                <p className="text-neon-teal mb-2">{'// Example Usage'}</p>
                <p className="text-green-400">{'const hash = "#access_token=ya29...&token_type=Bearer&expires_in=3599";'}</p>
                <p className="text-gray-300">{'const tokenData = parseGoogleAuthResponse(hash);'}</p>
                <p className="text-gray-300 mt-2">{'const headers = getGoogleAuthHeaders(tokenData.access_token);'}</p>
            </div>
        </div>
    );
};

export default GoogleAuthExample;
