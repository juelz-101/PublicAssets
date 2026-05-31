import React, { useState } from 'react';
import { listGoogleCalendarEvents, GoogleCalendarEvent } from '../../modules/google/google-calendar';

const GoogleCalendarExample: React.FC = () => {
    const [token, setToken] = useState('');
    const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchEvents = async () => {
        if (!token) {
            setError('Please provide an access token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await listGoogleCalendarEvents(token);
            setEvents(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg border border-neon-teal max-w-2xl">
            <h2 className="text-xl font-bold text-neon-teal mb-4">Google Calendar Example</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)}
                    className="flex-1 bg-black/50 border border-neon-teal/30 p-2 rounded text-sm outline-none focus:border-neon-teal"
                />
                <button 
                    onClick={handleFetchEvents} disabled={loading}
                    className="bg-neon-teal/20 text-neon-teal border border-neon-teal px-4 py-2 rounded hover:bg-neon-teal hover:text-black transition-colors"
                >
                    {loading ? 'Fetching...' : 'List Upcoming Events'}
                </button>
            </div>

            {error && <p className="text-neon-red text-sm mb-4">{error}</p>}

            <div className="bg-black/30 rounded p-4 border border-neon-teal/10 min-h-[100px] overflow-auto max-h-[300px]">
                {events.length === 0 && !loading && <span className="text-gray-500">No events loaded yet.</span>}
                {events.map((event, i) => (
                    <div key={event.id || i} className="mb-3 border-b border-gray-800 pb-2">
                        <div className="font-bold">{event.summary || 'Untitled Event'}</div>
                        <div className="text-xs text-gray-400">
                            {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start?.date}
                            {' - '}
                            {event.end?.dateTime ? new Date(event.end.dateTime).toLocaleString() : event.end?.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoogleCalendarExample;
