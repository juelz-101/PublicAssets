import React, { useState, useRef } from 'react';
import { clipboard } from '../../modules/electron/clipboard-extended';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const ClipboardExtendedExample: React.FC = () => {
    const [textInput, setTextInput] = useState('Hello Clipboard!');
    const [pastedText, setPastedText] = useState('');
    const [pastedImage, setPastedImage] = useState<string | null>(null);
    const [htmlInput, setHtmlInput] = useState('<h1 style="color:red">Hello Rich Text</h1>');
    const [pastedHtml, setPastedHtml] = useState('');
    const [formats, setFormats] = useState<string[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCopyText = async () => {
        await clipboard.writeText(textInput);
        alert('Text copied!');
    };

    const handlePasteText = async () => {
        const text = await clipboard.readText();
        setPastedText(text);
    };

    const generateCanvasImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw a cool pattern
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = '#08f7fe';
        ctx.font = '20px monospace';
        ctx.fillText('ZIKYinc', 60, 55);
        ctx.strokeStyle = '#F50057';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(190, 90);
        ctx.stroke();
    };

    const handleCopyImage = async () => {
        generateCanvasImage(); // Ensure content exists
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        try {
            await clipboard.writeImage(dataUrl);
            alert('Image copied from canvas!');
        } catch (e: any) {
            alert(`Failed to copy image: ${e.message}`);
        }
    };

    const handlePasteImage = async () => {
        try {
            const imgData = await clipboard.readImage();
            if (imgData) {
                setPastedImage(imgData);
            } else {
                alert('No image found in clipboard.');
            }
        } catch (e: any) {
            alert(`Failed to paste image: ${e.message}`);
        }
    };

    const handleCopyHtml = async () => {
        try {
            await clipboard.writeHTML(htmlInput, htmlInput.replace(/<[^>]*>?/gm, ''));
            alert('HTML copied! Try pasting into a rich text editor or the box below.');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    const handlePasteHtml = async () => {
        const html = await clipboard.readHTML();
        setPastedHtml(html || "No HTML content found.");
    };

    const handleCheckFormats = async () => {
        const f = await clipboard.availableFormats();
        setFormats(f);
    };

    const handleClear = async () => {
        await clipboard.clear();
        setFormats([]);
        alert('Clipboard cleared.');
    };

    // Draw initial canvas
    React.useEffect(generateCanvasImage, []);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Text Operations" description="Standard text clipboard access.">
                <div className="flex gap-4 mb-4">
                    <input 
                        type="text" 
                        value={textInput} 
                        onChange={e => setTextInput(e.target.value)} 
                        className="flex-1 bg-base-100/50 border border-base-300 rounded p-2 text-text-primary"
                    />
                    <button onClick={handleCopyText} className="bg-neon-teal/20 text-neon-teal px-4 rounded border border-neon-teal">Copy</button>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={handlePasteText} className="bg-base-300 text-text-primary px-4 py-2 rounded">Paste Text</button>
                    <span className="text-text-secondary font-mono bg-base-100/30 px-2 py-1 rounded">{pastedText || '(Waiting for paste...)'}</span>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Rich Text (HTML)" description="Copy and paste formatted HTML content.">
                 <div className="flex gap-4 mb-4">
                    <input 
                        type="text" 
                        value={htmlInput} 
                        onChange={e => setHtmlInput(e.target.value)} 
                        className="flex-1 bg-base-100/50 border border-base-300 rounded p-2 text-text-primary font-mono text-sm"
                    />
                    <button onClick={handleCopyHtml} className="bg-neon-teal/20 text-neon-teal px-4 rounded border border-neon-teal">Copy HTML</button>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={handlePasteHtml} className="bg-base-300 text-text-primary px-4 py-2 rounded self-start">Paste HTML</button>
                    <div className="p-2 bg-base-100/30 rounded border border-base-300 min-h-[50px]">
                        <p className="text-xs text-text-secondary mb-1">Raw Content:</p>
                        <div className="font-mono text-sm break-all">{pastedHtml}</div>
                        {pastedHtml && (
                            <>
                                <p className="text-xs text-text-secondary mt-2 mb-1">Rendered:</p>
                                <div className="bg-white p-2 text-black rounded" dangerouslySetInnerHTML={{ __html: pastedHtml }} />
                            </>
                        )}
                    </div>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Image Operations" description="Copy generated canvas data or paste images from your OS clipboard.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-text-primary">Source Canvas</h4>
                        <canvas ref={canvasRef} width="200" height="100" className="rounded border border-base-300 shadow-lg" />
                        <button onClick={handleCopyImage} className="w-full bg-neon-pink/20 text-neon-pink px-4 py-2 rounded border border-neon-pink hover:bg-neon-pink/30 transition">
                            Copy Canvas to Clipboard
                        </button>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-text-primary">Paste Target</h4>
                        <div className="w-[200px] h-[100px] bg-base-100/50 border border-dashed border-base-300 rounded flex items-center justify-center overflow-hidden">
                            {pastedImage ? <img src={pastedImage} alt="Pasted" className="max-w-full max-h-full" /> : <span className="text-xs text-text-secondary">No Image</span>}
                        </div>
                        <button onClick={handlePasteImage} className="w-full bg-base-300 text-text-primary px-4 py-2 rounded hover:bg-base-200 transition">
                            Paste Image from Clipboard
                        </button>
                    </div>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Clipboard Info & Management" description="Inspect current clipboard formats or clear it.">
                <div className="flex gap-4 mb-4">
                    <button onClick={handleCheckFormats} className="bg-neon-green/20 text-neon-green px-4 py-2 rounded border border-neon-green">Check Available Formats</button>
                    <button onClick={handleClear} className="bg-neon-red/20 text-neon-red px-4 py-2 rounded border border-neon-red">Clear Clipboard</button>
                </div>
                {formats.length > 0 ? (
                    <div className="bg-base-100/30 p-2 rounded">
                        <p className="text-sm font-semibold mb-1">Detected Formats:</p>
                        <ul className="list-disc list-inside text-sm font-mono text-text-secondary">
                            {formats.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary italic">No formats detected (or clipboard empty/access denied).</p>
                )}
            </FuturisticCard>
        </div>
    );
};

export default ClipboardExtendedExample;
