import React, { useState } from 'react';

interface JsonPreviewProps {
    jsonString: string;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ jsonString }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy JSON');

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyButtonText('Failed to copy');
            setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
        });
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col h-full max-h-[calc(100vh-12rem)]">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-amber-400">JSON Output</h3>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-sm font-semibold bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                    {copyButtonText}
                </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap break-all">
                    <code>{jsonString}</code>
                </pre>
            </div>
        </div>
    );
};

export default JsonPreview;
