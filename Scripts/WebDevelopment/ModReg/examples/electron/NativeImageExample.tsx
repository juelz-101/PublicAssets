import React, { useState } from 'react';
import { nativeImage, NativeImage } from '../../modules/electron/native-image';
import { ipc } from '../../modules/electron/ipc-wrapper';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
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

const NativeImageExample: React.FC = () => {
    const [currentImage, setCurrentImage] = useState<NativeImage | null>(null);
    const [dataUrl, setDataUrl] = useState<string>('');
    const [resizeWidth, setResizeWidth] = useState(100);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                if (ev.target?.result) {
                    const img = await nativeImage.createFromDataURL(ev.target.result as string);
                    setCurrentImage(img);
                    setDataUrl(img.toDataURL());
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResize = async () => {
        if (currentImage) {
            const resized = await currentImage.resize({ width: resizeWidth });
            setCurrentImage(resized);
            setDataUrl(resized.toDataURL());
        }
    };

    const handleCrop = async () => {
        if (currentImage) {
            // Simple center crop for demo
            const size = currentImage.getSize();
            const cropSize = Math.min(size.width, size.height) / 2;
            const x = (size.width - cropSize) / 2;
            const y = (size.height - cropSize) / 2;
            
            const cropped = await currentImage.crop({ x, y, width: cropSize, height: cropSize });
            setCurrentImage(cropped);
            setDataUrl(cropped.toDataURL());
        }
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Image manipulation is simulated using HTML5 Canvas.</p>}
            </div>

            <FuturisticCard title="Image Manipulation" description="Create, resize, and crop images using Electron's nativeImage API (or its browser mock).">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20 mb-4"
                />
                
                {dataUrl && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="border border-base-300 rounded p-2 bg-black/50">
                            <img src={dataUrl} alt="Preview" className="max-w-full max-h-64 object-contain" />
                        </div>
                        <div className="flex items-center gap-4 w-full">
                            <span className="text-text-secondary whitespace-nowrap">Resize Width:</span>
                            <input 
                                type="range" 
                                min="16" 
                                max="512" 
                                value={resizeWidth} 
                                onChange={(e) => setResizeWidth(Number(e.target.value))} 
                                className="w-full accent-neon-pink"
                            />
                            <span className="font-mono">{resizeWidth}px</span>
                        </div>
                        <div className="flex gap-4 w-full">
                            <FuturisticButton onClick={handleResize} className="flex-1">Resize</FuturisticButton>
                            <FuturisticButton onClick={handleCrop} className="flex-1">Center Crop</FuturisticButton>
                        </div>
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default NativeImageExample;
