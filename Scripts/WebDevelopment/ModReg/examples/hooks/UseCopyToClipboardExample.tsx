import React, { useState, useEffect } from 'react';
import { useCopyToClipboard } from '../../modules/hooks/use-copy-to-clipboard';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'green' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        green: 'bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border-neon-green',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap">{children || 'null'}</pre>
    </div>
);


const UseCopyToClipboardExample: React.FC = () => {
    const [textToCopy, setTextToCopy] = useState('Hello, world! This text will be copied.');
    const [copiedText, copy] = useCopyToClipboard();
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');

    const handleCopy = async () => {
        const success = await copy(textToCopy);
        if (success) {
            setCopyStatus('success');
        }
    };
    
    // Reset the "Copied!" button text after a delay
    useEffect(() => {
        if (copyStatus === 'success') {
            const timer = setTimeout(() => setCopyStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [copyStatus]);

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="useCopyToClipboard()"
                description="Click the button to copy the text from the text area to your clipboard using the navigator.clipboard API."
            >
                <textarea
                    value={textToCopy}
                    onChange={(e) => setTextToCopy(e.target.value)}
                    rows={4}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    placeholder="Enter text to copy..."
                />
                <div className="mt-4">
                    <FuturisticButton onClick={handleCopy} variant={copyStatus === 'success' ? 'green' : 'teal'}>
                        {copyStatus === 'success' ? 'Copied!' : 'Copy to Clipboard'}
                    </FuturisticButton>
                </div>
                 <OutputBox title="Last successfully copied text:">
                    {copiedText}
                </OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default UseCopyToClipboardExample;
