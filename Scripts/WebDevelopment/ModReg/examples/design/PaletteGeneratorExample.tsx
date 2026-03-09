import React, { useState } from 'react';
import { generatePalette } from '../../modules/design/palette-generator';
import { useCopyToClipboard } from '../../modules/hooks/use-copy-to-clipboard';

// --- Helper Components & Functions ---

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

const getTextColorForBackground = (hexColor: string): string => {
    if (!hexColor || !hexColor.startsWith('#') || hexColor.length < 7) return '#000000';
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#0A0A0A' : '#EAEAEA';
};

const ColorSwatch: React.FC<{ color: string }> = ({ color }) => {
    const [, copy] = useCopyToClipboard();
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const textColor = getTextColorForBackground(color);

    const handleCopy = () => {
        copy(color).then(success => {
            if (success) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            }
        });
    };

    return (
        <div 
            className="relative h-32 w-full rounded-lg flex flex-col items-center justify-center text-center p-2 transition-all duration-300 shadow-md group cursor-pointer hover:scale-105"
            style={{ backgroundColor: color }}
            onClick={handleCopy}
            role="button"
            aria-label={`Copy color ${color}`}
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                {copyStatus === 'copied' 
                    ? <span className="text-white font-bold animate-fade-in">Copied!</span>
                    : <CopyIcon className="w-8 h-8 text-white" />
                }
            </div>
            <span className="font-mono text-lg tracking-widest" style={{ color: textColor, textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{color}</span>
        </div>
    );
};


// --- Main Component ---

const presetPrompts = ["Synthwave Sunset", "Autumn Forest", "Deep Ocean Abyss", "Serene Sakura Garden", "Gothic Architecture"];

const PaletteGeneratorExample: React.FC = () => {
    const [prompt, setPrompt] = useState('Cyberpunk cityscape at night');
    const [palette, setPalette] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (currentPrompt: string) => {
        if (!currentPrompt) return;
        setIsLoading(true);
        setError(null);
        setPalette([]);
        try {
            const result = await generatePalette(currentPrompt);
            setPalette(result);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Color Palette Generator" description="Describe a theme, mood, or scene, and let Gemini generate a matching color palette for you.">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    placeholder="e.g., a quiet library with mahogany bookshelves..."
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
                    {isLoading ? 'Generating...' : 'Generate Palette'}
                </FuturisticButton>
            </FuturisticCard>
            
            {(isLoading || error || palette.length > 0) && (
                <FuturisticCard title="Result">
                    {isLoading && (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-teal"></div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-neon-red font-mono">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {palette.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
                            {palette.map((color, index) => (
                                <ColorSwatch key={`${color}-${index}`} color={color} />
                            ))}
                        </div>
                    )}
                </FuturisticCard>
            )}
        </div>
    );
};

export default PaletteGeneratorExample;
