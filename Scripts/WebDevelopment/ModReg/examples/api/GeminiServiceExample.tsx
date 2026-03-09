
import React, { useState } from 'react';
import { generateText, generateTextFromImage } from '../../services/geminiService';

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

const GeminiServiceExample: React.FC = () => {
  const [prompt, setPrompt] = useState('Write a short story about a robot who discovers music.');
  const [systemInstruction, setSystemInstruction] = useState('You are a creative storyteller.');
  const [imagePrompt, setImagePrompt] = useState('What is in this image?');
  
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleGenerateText = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setResult('');
    try {
      const text = await generateText(prompt, systemInstruction);
      setResult(text);
    } catch (error) {
      setResult('An error occurred. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateFromImage = async () => {
    if (!imagePrompt || !imageFile) return;
    setIsLoading(true);
    setResult('');
    try {
      const base64Data = await toBase64(imageFile);
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      };
      const text = await generateTextFromImage(imagePrompt, imagePart);
      setResult(text);
    } catch (error) {
      setResult('An error occurred. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Text Generation */}
      <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-neon-teal mb-2">Text Generation</h3>
        <p className="text-text-secondary -mt-3 mb-4">Generates text content from a given prompt, with an optional system instruction.</p>
        
        <div>
            <label htmlFor="system-instruction-input" className="block text-text-secondary mb-2">System Instruction (Optional):</label>
            <input
              id="system-instruction-input"
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
              placeholder="e.g., You are a helpful assistant."
            />
          </div>
        <div>
          <label htmlFor="prompt-textarea" className="block text-text-secondary mb-2">Your Prompt:</label>
          <textarea
            id="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
            rows={4}
            placeholder="Enter your prompt here..."
          />
        </div>
        <button
          onClick={handleGenerateText}
          disabled={isLoading || !prompt}
          className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Text'}
        </button>
      </div>

      {/* Multimodal Generation */}
      <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-neon-teal mb-2">Multimodal Generation (Text + Image)</h3>
        <p className="text-text-secondary -mt-3 mb-4">Generates content based on an image and a text prompt.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="image-upload" className="block text-text-secondary mb-2">Upload Image:</label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                />
                 {imagePreview && (
                    <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg"/>
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="image-prompt-input" className="block text-text-secondary mb-2">Image Prompt:</label>
                <textarea
                    id="image-prompt-input"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    rows={4}
                    placeholder="e.g., Describe this image."
                />
            </div>
        </div>
        <button
          onClick={handleGenerateFromImage}
          disabled={isLoading || !imageFile || !imagePrompt}
          className="w-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate From Image'}
        </button>
      </div>
      
      {(isLoading || result) && (
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
          <h4 className="text-lg font-semibold text-text-primary mb-2">Result:</h4>
          <div className="mt-2 p-4 bg-base-100/50 rounded min-h-[100px] whitespace-pre-wrap">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
              </div>
            ) : (
              <p className="text-text-primary font-mono">{result}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiServiceExample;
