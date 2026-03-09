// examples/automation/PuppeteerHelperExample.tsx
import React, { useState } from 'react';
import { generateAutomationScript, getBoilerplate, formatPuppeteerCode } from '../../modules/automation/puppeteer-helper';
import { findResilientSelector } from '../../modules/automation/automation-selectors';
import { useCopyToClipboard } from '../../modules/hooks/use-copy-to-clipboard';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string, className?: string }> = ({ children, title, description, className = "" }) => (
    <div className={`flex flex-col h-full ${className}`}>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4 text-sm">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

const PuppeteerHelperExample: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'script' | 'selector'>('script');
    
    // Script Generator State
    const [prompt, setPrompt] = useState('Go to news.ycombinator.com and log the top 5 story titles.');
    const [output, setOutput] = useState(getBoilerplate('base'));
    const [isGenerating, setIsGenerating] = useState(false);

    // Selector Lab State
    const [htmlSnippet, setHtmlSnippet] = useState('<div class="header">\n  <button id="login-btn" data-qa="submit-auth">Login</button>\n</div>');
    const [targetDesc, setTargetDesc] = useState('The login button inside the header');
    const [selectorResult, setSelectorResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [, copy] = useCopyToClipboard();

    const handleGenerate = async () => {
        setIsGenerating(true);
        const code = await generateAutomationScript(prompt);
        setOutput(code);
        setIsGenerating(false);
    };

    const handleAnalyzeSelector = async () => {
        setIsAnalyzing(true);
        try {
            const result = await findResilientSelector(htmlSnippet, targetDesc);
            setSelectorResult(result);
        } catch (e) {
            alert("Error analyzing selector.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const applyTemplate = (type: any) => {
        const snippet = getBoilerplate(type);
        if (type === 'base') setOutput(snippet);
        else setOutput(formatPuppeteerCode(snippet));
    };

    return (
        <div className="space-y-6 h-full pb-10">
            {/* Tabs */}
            <div className="flex bg-base-300/50 p-1 rounded-lg w-fit border border-neon-teal/20">
                <button 
                    onClick={() => setActiveTab('script')}
                    className={`px-6 py-2 rounded-md font-bold text-xs transition-all ${activeTab === 'script' ? 'bg-neon-teal text-black shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    SCRIPT ARCHITECT
                </button>
                <button 
                    onClick={() => setActiveTab('selector')}
                    className={`px-6 py-2 rounded-md font-bold text-xs transition-all ${activeTab === 'selector' ? 'bg-neon-teal text-black shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    SELECTOR LAB
                </button>
            </div>

            {activeTab === 'script' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px] animate-fade-in">
                    <FuturisticCard title="Task Description" description="Gemini converts your natural language into Node.js Puppeteer code.">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full flex-1 bg-base-100/50 border border-base-300 rounded p-3 text-text-primary focus:ring-1 focus:ring-neon-teal outline-none resize-none font-mono text-sm mb-4"
                            placeholder="Describe the steps..."
                        />
                        <div className="space-y-4">
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-3 rounded transition flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/> : 'Generate Script'}
                            </button>
                            
                            <div className="pt-4 border-t border-neon-teal/10">
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-2 font-bold">Boilerplates</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => applyTemplate('scrape')} className="text-xs bg-base-300 hover:bg-base-100 p-2 rounded text-text-secondary transition text-left px-3">Data Scraper</button>
                                    <button onClick={() => applyTemplate('screenshot')} className="text-xs bg-base-300 hover:bg-base-100 p-2 rounded text-text-secondary transition text-left px-3">Full Screenshot</button>
                                    <button onClick={() => applyTemplate('pdf')} className="text-xs bg-base-300 hover:bg-base-100 p-2 rounded text-text-secondary transition text-left px-3">Export to PDF</button>
                                    <button onClick={() => applyTemplate('base')} className="text-xs bg-base-300 hover:bg-base-100 p-2 rounded text-text-secondary transition text-left px-3">Standard Base</button>
                                </div>
                            </div>
                        </div>
                    </FuturisticCard>

                    <FuturisticCard title="Virtual Terminal" description="Generated automation script logic.">
                        <div className="relative flex-1 bg-black/80 rounded-md border border-base-300 overflow-hidden flex flex-col">
                            <div className="bg-base-100 px-4 py-1 border-b border-base-300 flex justify-between items-center shrink-0">
                                <span className="text-[10px] font-mono text-text-secondary uppercase">automation.js</span>
                                <button onClick={() => { copy(output); alert('Copied'); }} className="text-[10px] text-neon-teal hover:underline font-bold">COPY_CODE</button>
                            </div>
                            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-neon-green/90 leading-relaxed">
                                {output}
                            </pre>
                        </div>
                    </FuturisticCard>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px] animate-fade-in">
                    <FuturisticCard title="HTML Scanner" description="Paste a snippet of HTML and describe what you want to click or scrape.">
                        <label className="text-[10px] text-text-secondary uppercase font-bold mb-1">Source HTML</label>
                        <textarea
                            value={htmlSnippet}
                            onChange={(e) => setHtmlSnippet(e.target.value)}
                            className="w-full h-1/2 bg-base-100/50 border border-base-300 rounded p-3 text-text-primary focus:ring-1 focus:ring-neon-pink outline-none resize-none font-mono text-xs mb-4"
                        />
                        <label className="text-[10px] text-text-secondary uppercase font-bold mb-1">Target Description</label>
                        <input
                            type="text"
                            value={targetDesc}
                            onChange={(e) => setTargetDesc(e.target.value)}
                            className="w-full bg-base-100/50 border border-base-300 rounded p-3 text-text-primary focus:ring-1 focus:ring-neon-pink outline-none font-mono text-sm mb-4"
                        />
                        <button 
                            onClick={handleAnalyzeSelector}
                            disabled={isAnalyzing}
                            className="w-full bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink font-bold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/> : 'Analyze for Selectors'}
                        </button>
                    </FuturisticCard>

                    <FuturisticCard title="Selector Analysis" description="AI-generated resilient paths.">
                        {selectorResult ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-base-300/50 rounded border border-base-300">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold mb-2">Primary CSS Selector</p>
                                    <div className="flex gap-2 items-center">
                                        <code className="bg-black text-neon-teal p-2 rounded flex-1 text-sm">{selectorResult.css}</code>
                                        <button onClick={() => copy(selectorResult.css)} className="text-xs text-neon-teal">Copy</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-base-300/50 rounded border border-base-300">
                                    <p className="text-[10px] text-text-secondary uppercase font-bold mb-2">Stable XPath</p>
                                    <div className="flex gap-2 items-center">
                                        <code className="bg-black text-neon-pink p-2 rounded flex-1 text-sm">{selectorResult.xpath}</code>
                                        <button onClick={() => copy(selectorResult.xpath)} className="text-xs text-neon-pink">Copy</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-base-100/50 rounded border border-base-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-text-secondary uppercase font-bold">Stability Score</p>
                                        <span className={`text-sm font-bold ${selectorResult.stabilityScore > 70 ? 'text-neon-green' : 'text-neon-orange'}`}>
                                            {selectorResult.stabilityScore}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary italic">"{selectorResult.explanation}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 italic text-sm">
                                Awaiting analysis input...
                            </div>
                        )}
                    </FuturisticCard>
                </div>
            )}

            <div className="p-4 bg-neon-teal/5 border border-neon-teal/20 rounded-lg">
                <p className="text-xs text-neon-teal font-bold uppercase mb-1">Module Concept</p>
                <p className="text-xs text-text-secondary">
                    These utilities are designed to be imported into local worker scripts. The CrawlManager helps maintain state in the background while the PuppeteerHelper generates the interface-level logic.
                </p>
            </div>
        </div>
    );
};

export default PuppeteerHelperExample;
