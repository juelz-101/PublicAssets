
import React, { useState, useEffect } from 'react';
import { getCookie, setCookie, deleteCookie } from '../../modules/web-apis/cookie-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'blue' | 'green' | 'red' }> = ({ children, className, variant = 'blue', ...props }) => {
    const colors = {
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400',
        red: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap">{children || 'null'}</pre>
    </div>
);

const CookieUtilsExample: React.FC = () => {
    const [cookieName, setCookieName] = useState('user-preference');
    const [cookieValue, setCookieValue] = useState('dark-theme');
    const [cookieDays, setCookieDays] = useState('7');
    
    const [getName, setGetName] = useState('user-preference');
    const [retrievedCookie, setRetrievedCookie] = useState<string | null>(null);
    const [allCookies, setAllCookies] = useState(document.cookie);

    const refreshAllCookies = () => {
        setAllCookies(document.cookie);
    };

    const handleSetCookie = () => {
        const days = parseInt(cookieDays, 10);
        setCookie(cookieName, cookieValue, { days: isNaN(days) ? undefined : days, path: '/' });
        refreshAllCookies();
    };

    const handleGetCookie = () => {
        const value = getCookie(getName);
        setRetrievedCookie(value);
    };
    
    const handleDeleteCookie = () => {
        deleteCookie(getName);
        setRetrievedCookie(null);
        refreshAllCookies();
    };
    
    useEffect(() => {
        const interval = setInterval(refreshAllCookies, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="Set Cookie"
                description="Create a new cookie or overwrite an existing one."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-text-secondary mb-1">Name:</label>
                        <input type="text" value={cookieName} onChange={e => setCookieName(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                     <div>
                        <label className="block text-text-secondary mb-1">Value:</label>
                        <input type="text" value={cookieValue} onChange={e => setCookieValue(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                    </div>
                </div>
                 <div>
                    <label className="block text-text-secondary mb-1">Expiration (days):</label>
                    <input type="number" value={cookieDays} onChange={e => setCookieDays(e.target.value)} placeholder="e.g., 7" className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                </div>
                <FuturisticButton onClick={handleSetCookie} variant="blue">Set Cookie</FuturisticButton>
            </FuturisticCard>
            
            <FuturisticCard
                title="Get / Delete Cookie"
                description="Retrieve a specific cookie's value or delete it from the browser."
            >
                <div>
                    <label className="block text-text-secondary mb-1">Cookie Name:</label>
                    <input type="text" value={getName} onChange={e => setGetName(e.target.value)} className="w-full bg-base-100/50 p-2 rounded border border-base-300 focus:outline-none focus:ring-2 focus:ring-neon-teal"/>
                </div>
                 <div className="flex flex-wrap gap-2">
                    <FuturisticButton onClick={handleGetCookie} variant="green">Get Cookie</FuturisticButton>
                    <FuturisticButton onClick={handleDeleteCookie} variant="red">Delete Cookie</FuturisticButton>
                </div>
                <OutputBox title={`Value of '${getName}':`}>
                    {retrievedCookie === null ? 'Not Found' : `"${retrievedCookie}"`}
                </OutputBox>
            </FuturisticCard>
            
            <FuturisticCard title="All Cookies" description="A live view of `document.cookie`.">
                 <OutputBox title="document.cookie:">
                    {allCookies || '(empty)'}
                </OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default CookieUtilsExample;
