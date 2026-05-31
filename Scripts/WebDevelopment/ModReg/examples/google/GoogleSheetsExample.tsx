import React, { useState } from 'react';
import { getGoogleSheetValues } from '../../modules/google/google-sheets';

const GoogleSheetsExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [sheetId, setSheetId] = useState('');
    const [range, setRange] = useState('Sheet1!A1:D10');
    const [data, setData] = useState<any[][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchData = async () => {
        if (!token || !sheetId || !range) {
            setError('Please provide token, spreadsheet ID, and range');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await getGoogleSheetValues(token, sheetId, range);
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-neon-pink max-w-2xl">
            <h2 className="text-xl font-bold text-neon-pink mb-4">Google Sheets Example</h2>
            
            <div className="space-y-3 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-black/50 border border-neon-pink/30 p-2 rounded text-sm outline-none focus:border-neon-pink"
                />
                <input 
                    type="text" placeholder="Spreadsheet ID" value={sheetId} onChange={(e) => setSheetId(e.target.value)}
                    className="w-full bg-black/50 border border-neon-pink/30 p-2 rounded text-sm outline-none focus:border-neon-pink"
                />
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Range (e.g. Sheet1!A1:B10)" value={range} onChange={(e) => setRange(e.target.value)}
                        className="flex-1 bg-black/50 border border-neon-pink/30 p-2 rounded text-sm outline-none focus:border-neon-pink"
                    />
                    <button 
                        onClick={handleFetchData} disabled={loading}
                        className="bg-neon-pink/20 text-neon-pink border border-neon-pink px-4 py-2 rounded hover:bg-neon-pink hover:text-black transition-colors"
                    >
                        {loading ? 'Fetching...' : 'Get Data'}
                    </button>
                </div>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-neon-pink/10 min-h-[100px] overflow-auto max-h-[300px]">
                {data.length === 0 && !loading && <span className="text-gray-500">No data loaded yet.</span>}
                {data.length > 0 && (
                     <table className="w-full text-sm text-left">
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b border-gray-800 last:border-0">
                                    {row.map((cell, j) => (
                                        <td key={j} className="py-1 px-2">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                     </table>
                )}
            </div>
        </div>
    );
};

export default GoogleSheetsExample;
