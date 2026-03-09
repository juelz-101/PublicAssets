import React, { useState, useCallback } from 'react';
import { editImage, ImageEditResult } from '../../modules/editing/image-editor';

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

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

const ImageEditorExample: React.FC = () => {
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourcePreview, setSourcePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Add a small, futuristic drone flying in the background.');
    const [result, setResult] = useState<ImageEditResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSourceFile(file);
            setResult(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourcePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSourceFile(null);
            setSourcePreview(null);
        }
    }, []);

    const handleGenerate = async () => {
        if (!sourceFile || !prompt) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const base64Data = await toBase64(sourceFile);
            const editResult = await editImage(base64Data, sourceFile.type, prompt);
            
            if (editResult.text && !editResult.image) {
                 // Handle cases where only an error text is returned
                 setError(editResult.text);
            } else {
                setResult(editResult);
            }

        } catch (e: any) {
            setError(e.message || "An unknown error occurred during the editing process.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Image Editor with Gemini" description="Upload an image and provide a text prompt to describe the edits you want to make.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="image-upload" className="block text-text-secondary mb-2">1. Upload Source Image:</label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                        />
                        {sourcePreview && (
                            <div className="mt-4 p-2 bg-base-100/50 rounded-lg">
                                <img src={sourcePreview} alt="Source Preview" className="max-h-64 w-auto mx-auto rounded-md" />
                            </div>
                        )}
                    </div>
                     <div>
                        <label htmlFor="prompt-input" className="block text-text-secondary mb-2">2. Describe Your Edit:</label>
                         <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                            placeholder="e.g., Make the sky look like a sunset."
                         />
                    </div>
                </div>
                 <FuturisticButton onClick={handleGenerate} disabled={isLoading || !sourceFile || !prompt} className="w-full">
                    {isLoading ? 'Generating Edit...' : '3. Generate'}
                </FuturisticButton>
            </FuturisticCard>

             {(isLoading || error || result) && (
                <FuturisticCard title="Result">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-teal"></div>
                            <p className="mt-4 text-text-secondary">Editing in progress... this may take a moment.</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-neon-red font-mono">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {result && (
                         <div className="animate-fade-in space-y-4">
                            {result.image && (
                                <div>
                                    <h4 className="font-semibold text-text-primary mb-2">Edited Image:</h4>
                                    <div className="p-2 bg-base-100/50 rounded-lg">
                                        <img 
                                            src={`data:${result.image.mimeType};base64,${result.image.base64}`} 
                                            alt="Edited Result" 
                                            className="max-h-96 w-auto mx-auto rounded-md" 
                                        />
                                    </div>
                                </div>
                            )}
                             {result.text && (
                                <div>
                                    <h4 className="font-semibold text-text-primary mb-2">Model's Response:</h4>
                                     <p className="p-3 bg-base-100/50 rounded-md text-text-secondary italic">"{result.text}"</p>
                                </div>
                            )}
                         </div>
                    )}
                </FuturisticCard>
            )}

        </div>
    );
};

export default ImageEditorExample;
