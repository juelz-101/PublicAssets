import React, { useState } from 'react';
import { translateText } from '../../modules/google/google-translate';

const GoogleTranslateExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [text, setText] = useState('Hello, world!');
    const [targetLang, setTargetLang] = useState('es');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTranslate = async () => {
        if (!token) {
            setError('Please provide an access token (with translate scope)');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await translateText(token, text, targetLang);
            if (data.data?.translations) {
                setResult(data.data.translations[0]);
            } else {
                setResult(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-purple-400 max-w-2xl">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Google Cloud Translation Example</h2>
            
            <div className="space-y-3 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-black/50 border border-purple-400/30 p-2 rounded text-sm outline-none focus:border-purple-400"
                />
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Text to translate" value={text} onChange={(e) => setText(e.target.value)}
                        className="flex-1 bg-black/50 border border-purple-400/30 p-2 rounded text-sm outline-none focus:border-purple-400"
                    />
                    <select 
                        value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-black/50 border border-purple-400/30 p-2 rounded text-sm outline-none focus:border-purple-400"
                    >
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                    </select>
                    <button 
                        onClick={handleTranslate} disabled={loading}
                        className="bg-purple-400/20 text-purple-400 border border-purple-400 px-4 py-2 rounded hover:bg-purple-400 hover:text-black transition-colors"
                    >
                        {loading ? 'Translating...' : 'Translate'}
                    </button>
                </div>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-purple-400/10 min-h-[100px]">
                {!result && !loading && <span className="text-gray-500">Translation result will appear here.</span>}
                {result && (
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Detected Source Language: {result.detectedSourceLanguage}</div>
                        <div className="text-lg font-medium text-white">{result.translatedText}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleTranslateExample;
