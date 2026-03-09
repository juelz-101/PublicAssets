

import React, { useState, useMemo } from 'react';
import { hexToRgb, rgbToHex, lightenDarkenColor, rgba, rgbToHsl, interpolateColors } from '../../modules/graphics/color-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const ColorSwatch: React.FC<{ color: string; label: string; textColor?: string }> = ({ color, label, textColor = '#FFFFFF' }) => (
    <div
        className="h-24 w-full rounded-lg flex items-center justify-center text-center p-2 transition-colors duration-300 shadow-inner"
        style={{ backgroundColor: color }}
    >
        <div>
            <p className="font-bold" style={{ color: textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{label}</p>
            <p className="font-mono text-sm" style={{ color: textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{color}</p>
        </div>
    </div>
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <p className="text-text-primary font-mono text-lg">{children}</p>
    </div>
);

const ColorUtilsExample: React.FC = () => {
    const [hexColor, setHexColor] = useState('#08f7fe');
    const [lightness, setLightness] = useState(0);
    const [alpha, setAlpha] = useState(1);
    
    // State for interpolation
    const [color1, setColor1] = useState('#08f7fe');
    const [color2, setColor2] = useState('#f50057');
    const [factor, setFactor] = useState(0.5);

    const rgbColor = useMemo(() => hexToRgb(hexColor), [hexColor]);
    const hslColor = useMemo(() => rgbColor ? rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b) : null, [rgbColor]);
    const adjustedHexColor = useMemo(() => lightenDarkenColor(hexColor, lightness), [hexColor, lightness]);
    const rgbaColor = useMemo(() => rgba(hexColor, alpha), [hexColor, alpha]);
    const interpolatedColor = useMemo(() => interpolateColors(color1, color2, factor), [color1, color2, factor]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Color Playground" description="Use the controls below to manipulate the color and see the results from the utility functions in real time.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="color-picker" className="block text-text-secondary mb-2">Base HEX Color:</label>
                        <div className="flex items-center space-x-2">
                             <input
                                id="color-picker"
                                type="color"
                                value={hexColor}
                                onChange={(e) => setHexColor(e.target.value)}
                                className="w-12 h-12 p-1 bg-base-100/50 border border-base-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={hexColor}
                                onChange={(e) => setHexColor(e.target.value)}
                                className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-text-secondary mb-2">Lighten / Darken: {lightness}%</label>
                         <input
                            type="range"
                            min="-100"
                            max="100"
                            value={lightness}
                            onChange={(e) => setLightness(Number(e.target.value))}
                            className="w-full accent-neon-teal"
                         />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-text-secondary mb-2">Alpha / Opacity: {alpha.toFixed(2)}</label>
                         <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={alpha}
                            onChange={(e) => setAlpha(Number(e.target.value))}
                            className="w-full accent-neon-pink"
                         />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neon-teal/20">
                    <ColorSwatch color={hexColor} label="Original" />
                    <ColorSwatch color={adjustedHexColor} label="Adjusted" />
                    <ColorSwatch color={rgbaColor} label="With Alpha" />
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="interpolateColors(c1, c2, factor)" description="Linearly interpolates between two colors.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-text-secondary mb-2">Start Color:</label>
                        <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-full h-12 p-1 bg-base-100/50 border border-base-300 rounded" />
                     </div>
                     <div>
                        <label className="block text-text-secondary mb-2">End Color:</label>
                        <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-full h-12 p-1 bg-base-100/50 border border-base-300 rounded" />
                     </div>
                </div>
                <div>
                    <label className="block text-text-secondary mb-2">Interpolation Factor: {factor.toFixed(2)}</label>
                    <input type="range" min="0" max="1" step="0.01" value={factor} onChange={(e) => setFactor(Number(e.target.value))} className="w-full accent-neon-green"/>
                </div>
                <div className="flex items-center justify-center space-x-0 w-full h-16 rounded-lg overflow-hidden" 
                    style={{ background: `linear-gradient(to right, ${color1}, ${color2})`}}>
                    <div className="w-1 h-20 bg-white shadow-lg" style={{ transform: `translateX(${(factor - 0.5) * 100}%)` }}/>
                </div>
                <ColorSwatch color={interpolatedColor} label="Interpolated Result" />
            </FuturisticCard>

            <FuturisticCard title="Function Outputs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OutputBox title="hexToRgb(hex)">
                        {rgbColor ? `{\n  r: ${rgbColor.r},\n  g: ${rgbColor.g},\n  b: ${rgbColor.b}\n}` : 'Invalid HEX'}
                    </OutputBox>
                     <OutputBox title="rgbToHsl(r, g, b)">
                        {hslColor ? `{\n  h: ${hslColor.h.toFixed(0)},\n  s: ${hslColor.s.toFixed(2)},\n  l: ${hslColor.l.toFixed(2)}\n}` : 'N/A'}
                    </OutputBox>
                    <OutputBox title="lightenDarkenColor(hex, percent)">
                        {`"${adjustedHexColor}"`}
                    </OutputBox>
                    <OutputBox title="rgba(hex, alpha)">
                        {`"${rgbaColor}"`}
                    </OutputBox>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default ColorUtilsExample;
