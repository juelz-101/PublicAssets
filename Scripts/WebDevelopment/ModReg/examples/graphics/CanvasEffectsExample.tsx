import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as canvas from '../../modules/graphics/canvas-utils';
import * as effects from '../../modules/graphics/canvas-effects';
import { hexToRgb } from '../../modules/graphics/color-utils';

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

const ToolbarSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number }> =
    ({ label, value, onChange, min, max, step }) => (
        <div className="flex flex-col">
            <label className="flex justify-between text-sm text-text-secondary">
                <span>{label}</span>
                <span>{value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-base-300 accent-neon-pink"
            />
        </div>
    );

const CanvasEffectsExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Live effect parameters
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [pixelSize, setPixelSize] = useState(1);
    const [blur, setBlur] = useState(0);
    const [vignetteStrength, setVignetteStrength] = useState(0);
    const [vignetteSize, setVignetteSize] = useState(75);
    
    // One-off effect parameters
    const [thresholdLevel, setThresholdLevel] = useState(50);
    const [solarizeLevel, setSolarizeLevel] = useState(50);
    const [posterizeLevels, setPosterizeLevels] = useState(4);
    const [noiseAmount, setNoiseAmount] = useState(20);
    const [tintColor, setTintColor] = useState("#08f7fe");
    const [tintStrength, setTintStrength] = useState(30);

    const drawOriginalImage = useCallback(() => {
        const ctx = canvas.getContext(canvasRef.current);
        const img = originalImageRef.current;
        if (ctx && img) {
            canvas.clearCanvas(ctx);
            // Fit image to canvas while maintaining aspect ratio
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;
            const hRatio = canvasWidth / img.width;
            const vRatio = canvasHeight / img.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShift_x = (canvasWidth - img.width * ratio) / 2;
            const centerShift_y = (canvasHeight - img.height * ratio) / 2;
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }
    }, []);
    
    const applyAllEffects = useCallback(() => {
        const ctx = canvas.getContext(canvasRef.current);
        if (!ctx || !imageLoaded) return;
        
        drawOriginalImage(); 
        
        effects.applyEffect(ctx, (imageData) => {
            if (brightness !== 0) effects.brightness(imageData, brightness);
            if (contrast !== 0) effects.contrast(imageData, contrast);
            if (blur > 0) effects.blur(imageData, blur);
            if (pixelSize > 1) effects.pixelate(imageData, pixelSize);
            if (vignetteStrength > 0) effects.vignette(imageData, vignetteStrength, vignetteSize);
        });

    }, [imageLoaded, drawOriginalImage, brightness, contrast, pixelSize, blur, vignetteStrength, vignetteSize]);

    useEffect(() => {
       applyAllEffects();
    }, [applyAllEffects]);

    const applySingleEffect = (effectFn: (imgData: ImageData, ...args: any[]) => void, ...args: any[]) => {
        const ctx = canvas.getContext(canvasRef.current);
        if (!ctx || !imageLoaded) return;
        drawOriginalImage();
        effects.applyEffect(ctx, (imageData) => effectFn(imageData, ...args));
        // Reset live sliders after applying a one-off effect
        setBrightness(0); setContrast(0); setPixelSize(1); setBlur(0); setVignetteStrength(0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    originalImageRef.current = img;
                    setImageLoaded(true);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        if (imageLoaded) drawOriginalImage();
    }, [imageLoaded, drawOriginalImage]);
    
     useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const resize = () => {
            const parent = canvasEl.parentElement;
            if(parent) {
                canvasEl.width = parent.clientWidth;
                canvasEl.height = 400;
                if (imageLoaded) {
                    drawOriginalImage();
                    applyAllEffects();
                }
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [drawOriginalImage, applyAllEffects, imageLoaded]);


    return (
        <div className="space-y-8">
            <FuturisticCard title="Image Effects Canvas" description="Upload an image to apply real-time pixel manipulation effects.">
                 <canvas ref={canvasRef} className="bg-base-100/50 rounded-lg w-full relative">
                     Your browser does not support the canvas element.
                 </canvas>
                 {!imageLoaded && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        Upload an image to begin
                    </div>
                 )}
            </FuturisticCard>
             <FuturisticCard title="Controls">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-teal/10 file:text-neon-teal hover:file:bg-neon-teal/20"
                />
                
                <div className="pt-4 border-t border-neon-teal/20">
                    <h4 className="text-text-primary font-semibold mb-2">Live Adjustments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <ToolbarSlider label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} step={1} />
                        <ToolbarSlider label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} step={1} />
                        <ToolbarSlider label="Blur" value={blur} onChange={setBlur} min={0} max={10} step={1} />
                        <ToolbarSlider label="Pixel Size" value={pixelSize} onChange={setPixelSize} min={1} max={30} step={1} />
                        <ToolbarSlider label="Vignette Strength" value={vignetteStrength} onChange={setVignetteStrength} min={0} max={100} step={1} />
                        <ToolbarSlider label="Vignette Size" value={vignetteSize} onChange={setVignetteSize} min={0} max={100} step={1} />
                    </div>
                </div>

                <div className="pt-4 border-t border-neon-teal/20">
                    <h4 className="text-text-primary font-semibold mb-2">One-off Filters</h4>
                    <div className="flex flex-wrap gap-2">
                        <FuturisticButton onClick={() => applySingleEffect(effects.grayscale)} disabled={!imageLoaded}>Grayscale</FuturisticButton>
                        <FuturisticButton onClick={() => applySingleEffect(effects.sepia)} disabled={!imageLoaded}>Sepia</FuturisticButton>
                        <FuturisticButton onClick={() => applySingleEffect(effects.invert)} disabled={!imageLoaded}>Invert</FuturisticButton>
                        <FuturisticButton onClick={() => applySingleEffect(effects.sharpen)} disabled={!imageLoaded}>Sharpen</FuturisticButton>
                        <FuturisticButton onClick={() => applySingleEffect(effects.edgeDetection)} disabled={!imageLoaded}>Edge Detect</FuturisticButton>
                        <FuturisticButton onClick={drawOriginalImage} disabled={!imageLoaded}>Reset</FuturisticButton>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                         <FuturisticButton onClick={() => applySingleEffect(effects.removeChannel, 'r')} disabled={!imageLoaded} className="border-red-500/50 text-red-400 hover:bg-red-500/20">Remove Red</FuturisticButton>
                         <FuturisticButton onClick={() => applySingleEffect(effects.removeChannel, 'g')} disabled={!imageLoaded} className="border-green-500/50 text-green-400 hover:bg-green-500/20">Remove Green</FuturisticButton>
                         <FuturisticButton onClick={() => applySingleEffect(effects.removeChannel, 'b')} disabled={!imageLoaded} className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20">Remove Blue</FuturisticButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-end gap-2 p-2 bg-base-100/20 rounded-md">
                           <div className="flex-grow"><ToolbarSlider label="Tint Strength" value={tintStrength} onChange={setTintStrength} min={0} max={100} step={1} /></div>
                           <input type="color" value={tintColor} onChange={(e) => setTintColor(e.target.value)} className="w-12 h-10 p-1 bg-transparent border-0 rounded cursor-pointer"/>
                           <FuturisticButton onClick={() => { const rgb = hexToRgb(tintColor); if(rgb) applySingleEffect(effects.tint, rgb, tintStrength/100); }} disabled={!imageLoaded}>Apply Tint</FuturisticButton>
                        </div>
                        <div className="flex items-end gap-2 p-2 bg-base-100/20 rounded-md">
                           <div className="flex-grow"><ToolbarSlider label="Noise Amount" value={noiseAmount} onChange={setNoiseAmount} min={0} max={100} step={1} /></div>
                           <FuturisticButton onClick={() => applySingleEffect(effects.noise, noiseAmount)} disabled={!imageLoaded}>Apply Noise</FuturisticButton>
                        </div>
                        <div className="flex items-end gap-2 p-2 bg-base-100/20 rounded-md">
                            <div className="flex-grow"><ToolbarSlider label="Posterize Levels" value={posterizeLevels} onChange={setPosterizeLevels} min={2} max={16} step={1} /></div>
                            <FuturisticButton onClick={() => applySingleEffect(effects.posterize, posterizeLevels)} disabled={!imageLoaded}>Apply Posterize</FuturisticButton>
                        </div>
                         <div className="flex items-end gap-2 p-2 bg-base-100/20 rounded-md">
                            <div className="flex-grow"><ToolbarSlider label="Threshold Level" value={thresholdLevel} onChange={setThresholdLevel} min={0} max={100} step={1} /></div>
                            <FuturisticButton onClick={() => applySingleEffect(effects.threshold, thresholdLevel)} disabled={!imageLoaded}>Apply Threshold</FuturisticButton>
                        </div>
                        <div className="flex items-end gap-2 p-2 bg-base-100/20 rounded-md">
                            <div className="flex-grow"><ToolbarSlider label="Solarize Level" value={solarizeLevel} onChange={setSolarizeLevel} min={0} max={100} step={1} /></div>
                            <FuturisticButton onClick={() => applySingleEffect(effects.solarize, solarizeLevel)} disabled={!imageLoaded}>Apply Solarize</FuturisticButton>
                        </div>
                    </div>
                </div>
             </FuturisticCard>
        </div>
    );
};

export default CanvasEffectsExample;