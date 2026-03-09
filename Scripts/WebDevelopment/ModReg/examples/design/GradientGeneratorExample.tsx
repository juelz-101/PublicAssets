import React, { useState } from 'react';
import { generateGradient } from '../../modules/design/gradient-generator';
import { useCopyToClipboard } from '../../modules/hooks/use-copy-to-clipboard';

// --- Helper Components ---

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);


// --- Main Component ---

const presetPrompts = ["Fiery Sunset", "Vaporwave Dream", "Lush Forest Canopy", "Galactic Nebula", "Frozen Glacier"];

const GradientGeneratorExample: React.FC = () => {
    const [prompt, setPrompt] = useState('Ocean sunrise');
    const [gradientCss, setGradientCss] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, copy] = useCopyToClipboard();
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    const handleGenerate = async (currentPrompt: string) => {
        if (!currentPrompt) return;
        setIsLoading(true);
        setError(null);
        setGradientCss('');
        try {
            const result = await generateGradient(currentPrompt);
            setGradientCss(result);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!gradientCss) return;
        copy(gradientCss).then(success => {
            if (success) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            }
        });
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="CSS Gradient Generator" description="Describe a theme or mood, and let Gemini generate a CSS gradient.">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    placeholder="e.g., soft pastel clouds at dawn..."
                />
                <div className="flex flex-wrap gap-2">
                     <p className="text-text-secondary text-sm w-full">Or try a preset:</p>
                    {presetPrompts.map(p => (
                        <button key={p} onClick={() => { setPrompt(p); handleGenerate(p); }} disabled={isLoading} className="text-xs bg-base-300/50 hover:bg-base-300/80 text-text-secondary font-semibold py-1 px-3 rounded-full transition">
                            {p}
                        </button>
                    ))}
                </div>
                 <FuturisticButton onClick={() => handleGenerate(prompt)} disabled={isLoading || !prompt} className="w-full">
                    {isLoading ? 'Generating...' : 'Generate Gradient'}
                </FuturisticButton>
            </FuturisticCard>
            
            {(isLoading || error || gradientCss) && (
                <FuturisticCard title="Result">
                    {isLoading && (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-teal"></div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-neon-red font-mono">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {gradientCss && (
                        <div className="animate-fade-in space-y-4">
                            <div 
                                className="h-48 w-full rounded-lg shadow-lg border border-neon-teal/20"
                                style={{ background: gradientCss }}
                                aria-label="Generated gradient preview"
                            />
                             <div className="relative bg-base-100/50 p-4 rounded-md font-mono text-sm text-text-primary border border-base-300">
                                <button 
                                    onClick={handleCopy}
                                    className="absolute top-2 right-2 p-2 rounded-md bg-base-300/50 hover:bg-base-300/80 text-text-secondary hover:text-neon-teal transition"
                                    aria-label="Copy CSS to clipboard"
                                >
                                     {copyStatus === 'copied' 
                                        ? <CheckIcon className="w-5 h-5 text-neon-green" />
                                        : <CopyIcon className="w-5 h-5" />
                                     }
                                </button>
                                <code>
                                    <span className="text-neon-pink">background</span>: {gradientCss};
                                </code>
                            </div>
                        </div>
                    )}
                </FuturisticCard>
            )}
        </div>
    );
};

export default GradientGeneratorExample;
