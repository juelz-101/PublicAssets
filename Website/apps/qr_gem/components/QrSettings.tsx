import React, { useState, useCallback, useEffect } from 'react';
import type { QrCodeOptions, DotType, CornerSquareType, CornerDotType, Gradient, BorderOptions, BorderStyle, LogoShape, ExperimentalOptions, UserPreset } from '../types';
import { Tab } from '../types';
import { ShapesIcon, ColorsIcon, LogoIcon, CornersIcon, FramesIcon, StarIcon, ExperimentalIcon } from './ui/icons';
import { svgPresets, customPresetName, cornerSquareSvgPresets } from './svg-presets';

interface QrSettingsProps {
  options: QrCodeOptions;
  setOptions: React.Dispatch<React.SetStateAction<QrCodeOptions>>;
  borderOptions: BorderOptions;
  setBorderOptions: React.Dispatch<React.SetStateAction<BorderOptions>>;
  logoShape: LogoShape;
  setLogoShape: React.Dispatch<React.SetStateAction<LogoShape>>;
  experimentalOptions: ExperimentalOptions;
  setExperimentalOptions: React.Dispatch<React.SetStateAction<ExperimentalOptions>>;
  logoSizeRatio: number;
  setLogoSizeRatio: React.Dispatch<React.SetStateAction<number>>;
  logoMargin: number;
  setLogoMargin: React.Dispatch<React.SetStateAction<number>>;
  isLogoVisible: boolean;
  setIsLogoVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onLogoUpload: (dataUrl: string) => void;
  userPresets: UserPreset[];
  onLoadPreset: (preset: UserPreset) => void;
  onDeletePreset: (name: string) => void;
  isDebugMode: boolean;
}

const dotTypes: DotType[] = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'];
const cornerSquareTypes: CornerSquareType[] = ['square', 'dot', 'extra-rounded'];
const cornerDotTypes: CornerDotType[] = ['square', 'dot'];
const borderStyles: BorderStyle[] = ['solid', 'dashed', 'dotted', 'double', 'corners', 'inset', 'ridge'];
const logoShapes: LogoShape[] = ['square', 'circle'];


const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">{title}</h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300">
        {children}
    </label>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] | {value: string, label: string}[] }> = ({ options, ...props }) => (
    <select {...props} style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-text)' }} className="w-full rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
        {options.map(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ') : opt.label;
            return <option key={value} value={value}>{label}</option>
        })}
    </select>
);


const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-text)' }} className="w-full rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-text)' }} className="w-full rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" rows={4} />
);

const ColorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <div style={{borderColor: 'var(--theme-border-color)'}} className="relative w-full h-10 rounded-md overflow-hidden border-2">
    <input type="color" {...props} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
    <div className="w-full h-full" style={{ backgroundColor: props.value as string }}></div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={active ? {
        borderColor: 'var(--theme-accent)',
        color: 'var(--theme-accent)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
    } : {}}
    className={`flex items-center justify-center text-sm font-medium px-4 py-2.5 rounded-t-lg border-b-2 transition-colors duration-200 ease-out w-full
      ${active
        ? ''
        : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
      }`}
  >
    {children}
  </button>
);

const QrSettings: React.FC<QrSettingsProps> = ({ options, setOptions, borderOptions, setBorderOptions, logoShape, setLogoShape, experimentalOptions, setExperimentalOptions, logoSizeRatio, setLogoSizeRatio, logoMargin, setLogoMargin, isLogoVisible, setIsLogoVisible, onLogoUpload, userPresets, onLoadPreset, onDeletePreset, isDebugMode }) => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Shapes);

    useEffect(() => {
        // If debug mode is turned off while on the experimental tab, switch to a default tab
        if (!isDebugMode && activeTab === Tab.Experimental) {
            setActiveTab(Tab.Shapes);
        }
    }, [isDebugMode, activeTab]);

    const handleOptionChange = useCallback(<K extends keyof QrCodeOptions,>(key: K, value: QrCodeOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    }, [setOptions]);

    const handleDotsOptionChange = useCallback(<K extends keyof QrCodeOptions['dotsOptions'],>(key: K, value: QrCodeOptions['dotsOptions'][K]) => {
        handleOptionChange('dotsOptions', { ...options.dotsOptions, [key]: value });
    }, [handleOptionChange, options.dotsOptions]);

    const handleCornersSquareOptionChange = useCallback(<K extends keyof QrCodeOptions['cornersSquareOptions'],>(key: K, value: QrCodeOptions['cornersSquareOptions'][K]) => {
        handleOptionChange('cornersSquareOptions', { ...options.cornersSquareOptions, [key]: value });
    }, [handleOptionChange, options.cornersSquareOptions]);

    const handleCornersDotOptionChange = useCallback(<K extends keyof QrCodeOptions['cornersDotOptions'],>(key: K, value: QrCodeOptions['cornersDotOptions'][K]) => {
        handleOptionChange('cornersDotOptions', { ...options.cornersDotOptions, [key]: value });
    }, [handleOptionChange, options.cornersDotOptions]);
    
    const handleBackgroundOptionChange = useCallback(<K extends keyof QrCodeOptions['backgroundOptions'],>(key: K, value: QrCodeOptions['backgroundOptions'][K]) => {
        handleOptionChange('backgroundOptions', { ...options.backgroundOptions, [key]: value });
    }, [handleOptionChange, options.backgroundOptions]);
    
    const handleImageOptionChange = useCallback(<K extends keyof QrCodeOptions['imageOptions'],>(key: K, value: QrCodeOptions['imageOptions'][K]) => {
        setOptions(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, [key]: value } }));
    }, [setOptions]);

    const handleBorderOptionChange = useCallback(<K extends keyof BorderOptions>(key: K, value: BorderOptions[K]) => {
        setBorderOptions(prev => ({ ...prev, [key]: value }));
    }, [setBorderOptions]);
    
    const handleExperimentalOptionChange = useCallback(<K extends keyof ExperimentalOptions>(key: K, value: ExperimentalOptions[K]) => {
        setExperimentalOptions(prev => ({ ...prev, [key]: value }));
    }, [setExperimentalOptions]);

    const handleSvgPresetChange = useCallback((name: string) => {
        const preset = svgPresets.find(p => p.name === name);
        if (preset) {
            setExperimentalOptions(prev => ({
                ...prev,
                presetName: name,
                dotSvg: preset.path || prev.dotSvg
            }));
        }
    }, [setExperimentalOptions]);

    const handleCustomSvgPathChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExperimentalOptions(prev => ({
            ...prev,
            presetName: customPresetName,
            dotSvg: e.target.value
        }));
    };
    
    const handleCornerSquareSvgPresetChange = useCallback((name: string) => {
        const preset = cornerSquareSvgPresets.find(p => p.name === name);
        if (preset) {
            setExperimentalOptions(prev => ({
                ...prev,
                cornerSquarePresetName: name,
                cornerSquareSvg: preset.path || prev.cornerSquareSvg
            }));
        }
    }, [setExperimentalOptions]);

    const handleCustomCornerSvgPathChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExperimentalOptions(prev => ({
            ...prev,
            cornerSquarePresetName: customPresetName,
            cornerSquareSvg: e.target.value
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if(event.target?.result) {
                onLogoUpload(event.target.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
    };
    
    const GradientEditor: React.FC<{
        id: string;
        gradient: Gradient | null | undefined;
        onGradientChange: (gradient: Gradient | null) => void;
    }> = ({ id, gradient, onGradientChange }) => {
        const hasGradient = !!gradient;
        const color1 = gradient?.colorStops?.[0]?.color || '#ffffff';
        const color2 = gradient?.colorStops?.[1]?.color || '#000000';
    
        return (
            <div className="space-y-3 p-3 bg-black/20 rounded-lg">
                <div className="flex items-center">
                    <input type="checkbox" id={`${id}-enable`} checked={hasGradient} onChange={e => onGradientChange(e.target.checked ? { type: 'linear', rotation: 0, colorStops: [{ offset: 0, color: color1 }, { offset: 1, color: color2 }] } : null)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                    <label htmlFor={`${id}-enable`} className="ml-2 text-sm font-medium text-gray-300">Enable Gradient</label>
                </div>
                {hasGradient && (
                    <div className="space-y-3">
                        <Select id={`${id}-type`} options={['linear', 'radial']} value={gradient.type} onChange={e => onGradientChange({ ...gradient, type: e.target.value as 'linear' | 'radial' })} />
                        <div className="grid grid-cols-2 gap-2">
                           <ColorInput value={color1} onChange={e => onGradientChange({ ...gradient, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: color2 }] })} />
                           <ColorInput value={color2} onChange={e => onGradientChange({ ...gradient, colorStops: [{ offset: 0, color: color1 }, { offset: 1, color: e.target.value }] })} />
                        </div>
                        {gradient.type === 'linear' && (
                            <div>
                                <Label htmlFor={`${id}-rotation`}>Rotation</Label>
                                <Input type="number" id={`${id}-rotation`} value={gradient.rotation} onChange={e => onGradientChange({ ...gradient, rotation: Number(e.target.value) })} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: 'var(--theme-card-bg)' }} className="rounded-lg h-full flex flex-col">
            <div style={{ borderColor: 'var(--theme-border-color)' }} className="flex-shrink-0 border-b">
                <nav className={`grid ${isDebugMode ? 'grid-cols-4 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-6'}`}>
                    <TabButton active={activeTab === Tab.Shapes} onClick={() => setActiveTab(Tab.Shapes)}><ShapesIcon /> Shapes</TabButton>
                    <TabButton active={activeTab === Tab.Colors} onClick={() => setActiveTab(Tab.Colors)}><ColorsIcon /> Colors</TabButton>
                    <TabButton active={activeTab === Tab.Logo} onClick={() => setActiveTab(Tab.Logo)}><LogoIcon /> Logo</TabButton>
                    <TabButton active={activeTab === Tab.Corners} onClick={() => setActiveTab(Tab.Corners)}><CornersIcon /> Corners</TabButton>
                    <TabButton active={activeTab === Tab.Frames} onClick={() => setActiveTab(Tab.Frames)}><FramesIcon /> Frames</TabButton>
                    <TabButton active={activeTab === Tab.Presets} onClick={() => setActiveTab(Tab.Presets)}><StarIcon /> Presets</TabButton>
                    {isDebugMode && (
                        <TabButton active={activeTab === Tab.Experimental} onClick={() => setActiveTab(Tab.Experimental)}><ExperimentalIcon /> Experimental</TabButton>
                    )}
                </nav>
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
                {activeTab === Tab.Shapes && (
                    <div>
                        <SettingsGroup title="Dot Style">
                            <Label htmlFor="dot-type">Shape of the QR code's dots</Label>
                            <Select 
                                id="dot-type" 
                                options={dotTypes} 
                                value={options.dotsOptions?.type} 
                                onChange={(e) => handleDotsOptionChange('type', e.target.value as DotType)}
                                disabled={experimentalOptions.enabled}
                            />
                             {experimentalOptions.enabled && <p className="text-xs text-amber-400 mt-1">Dot shape is controlled by Experimental settings.</p>}
                        </SettingsGroup>
                        <SettingsGroup title="QR Code Margin">
                            <Label htmlFor="qr-margin">Margin around QR code: {options.margin}px</Label>
                            <input id="qr-margin" type="range" min="0" max="40" step="1" value={options.margin} onChange={(e) => handleOptionChange('margin', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </SettingsGroup>
                    </div>
                )}

                {activeTab === Tab.Colors && (
                    <div>
                        <SettingsGroup title="Dot Color">
                            <Label htmlFor="dot-color">Color</Label>
                            <ColorInput id="dot-color" value={options.dotsOptions?.color} onChange={(e) => handleDotsOptionChange('color', e.target.value)} />
                            <Label htmlFor="dots-gradient-enable">Gradient</Label>
                            <GradientEditor id="dots-gradient" gradient={options.dotsOptions?.gradient} onGradientChange={(g) => handleDotsOptionChange('gradient', g)} />
                        </SettingsGroup>
                        <SettingsGroup title="Background Color">
                             <Label htmlFor="bg-color">Color</Label>
                            <ColorInput id="bg-color" value={options.backgroundOptions?.color} onChange={(e) => handleBackgroundOptionChange('color', e.target.value)} />
                            <Label htmlFor="bg-gradient-enable">Gradient</Label>
                            <GradientEditor id="bg-gradient" gradient={options.backgroundOptions?.gradient} onGradientChange={(g) => handleBackgroundOptionChange('gradient', g)} />
                        </SettingsGroup>
                    </div>
                )}
                
                {activeTab === Tab.Logo && (
                    <div>
                        <SettingsGroup title="Logo Visibility">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="logo-visible" 
                                    checked={isLogoVisible} 
                                    onChange={e => setIsLogoVisible(e.target.checked)} 
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" 
                                />
                                <label htmlFor="logo-visible" className="ml-2 text-sm font-medium text-gray-300">Display Logo</label>
                            </div>
                        </SettingsGroup>
                        <div className={!isLogoVisible ? 'opacity-50 pointer-events-none' : ''}>
                            <SettingsGroup title="Logo Image">
                                <Label htmlFor="logo-upload">Upload an image (PNG, JPG, SVG)</Label>
                                <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileUpload} />
                                {options.image && <img src={options.image} alt="Logo preview" className={`w-20 h-20 mx-auto mt-2 object-contain bg-white p-1 ${logoShape === 'circle' ? 'rounded-full' : 'rounded-md'}`}/>}
                                <p className="text-xs text-gray-500 mt-2 text-center">Note: The cleared area behind the logo is always square. For a circular effect, use a circular logo with a transparent background.</p>
                            </SettingsGroup>
                            <SettingsGroup title="Logo Options">
                                <Label htmlFor="logo-shape">Logo Shape (Visual)</Label>
                                <Select id="logo-shape" options={logoShapes} value={logoShape} onChange={(e) => setLogoShape(e.target.value as LogoShape)} />
                                
                                <Label htmlFor="logo-size">Logo Size: {Math.round(logoSizeRatio * 100)}%</Label>
                                <input id="logo-size" type="range" min="0.1" max="1" step="0.05" value={logoSizeRatio} onChange={(e) => setLogoSizeRatio(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />

                                <Label htmlFor="logo-margin">Logo Margin: {logoMargin}px</Label>
                                <input id="logo-margin" type="range" min="-20" max="50" step="1" value={logoMargin} onChange={(e) => setLogoMargin(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                
                                <div className="flex items-center">
                                    <input type="checkbox" id="hide-dots" checked={options.imageOptions?.hideBackgroundDots} onChange={e => handleImageOptionChange('hideBackgroundDots', e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                    <label htmlFor="hide-dots" className="ml-2 text-sm font-medium text-gray-300">Hide dots behind logo</label>
                                </div>
                            </SettingsGroup>
                        </div>
                    </div>
                )}

                {activeTab === Tab.Corners && (
                    <div>
                        <SettingsGroup title="Corner Squares (Outer)">
                            <Label htmlFor="corner-square-type">Shape</Label>
                            <Select 
                                id="corner-square-type" 
                                options={cornerSquareTypes} 
                                value={options.cornersSquareOptions?.type} 
                                onChange={(e) => handleCornersSquareOptionChange('type', e.target.value as CornerSquareType)} 
                                disabled={experimentalOptions.cornerSquareEnabled}
                            />
                             {experimentalOptions.cornerSquareEnabled && <p className="text-xs text-amber-400 mt-1">Corner shape is controlled by Experimental settings.</p>}
                            <Label htmlFor="corner-square-color">Color</Label>
                            <ColorInput id="corner-square-color" value={options.cornersSquareOptions?.color} onChange={(e) => handleCornersSquareOptionChange('color', e.target.value)} />
                            <Label htmlFor="corner-square-gradient-enable">Gradient</Label>
                            <GradientEditor id="corner-square-gradient" gradient={options.cornersSquareOptions?.gradient} onGradientChange={(g) => handleCornersSquareOptionChange('gradient', g)} />
                        </SettingsGroup>
                        <SettingsGroup title="Corner Dots (Inner)">
                            <Label htmlFor="corner-dot-type">Shape</Label>
                            <Select id="corner-dot-type" options={cornerDotTypes} value={options.cornersDotOptions?.type} onChange={(e) => handleCornersDotOptionChange('type', e.target.value as CornerDotType)} />
                            <Label htmlFor="corner-dot-color">Color</Label>
                            <ColorInput id="corner-dot-color" value={options.cornersDotOptions?.color} onChange={(e) => handleCornersDotOptionChange('color', e.target.value)} />
                            <Label htmlFor="corner-dot-gradient-enable">Gradient</Label>
                            <GradientEditor id="corner-dot-gradient" gradient={options.cornersDotOptions?.gradient} onGradientChange={(g) => handleCornersDotOptionChange('gradient', g)} />
                        </SettingsGroup>
                    </div>
                )}

                {activeTab === Tab.Frames && (
                    <div>
                        <SettingsGroup title="Frame Style">
                            <Label htmlFor="border-style">Style</Label>
                            <Select id="border-style" options={borderStyles} value={borderOptions.style} onChange={(e) => handleBorderOptionChange('style', e.target.value as BorderStyle)} />
                            
                            <Label htmlFor="border-width">Width: {borderOptions.width}px</Label>
                            <input id="border-width" type="range" min="0" max="50" step="1" value={borderOptions.width} onChange={(e) => handleBorderOptionChange('width', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            
                            {borderOptions.style === 'corners' && (
                                <>
                                    <Label htmlFor="corner-length">Corner Length: {borderOptions.cornerLength}px</Label>
                                    <input id="corner-length" type="range" min="5" max="100" step="1" value={borderOptions.cornerLength} onChange={(e) => handleBorderOptionChange('cornerLength', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                </>
                            )}
                            
                            <Label htmlFor="border-color">Color</Label>
                            <ColorInput id="border-color" value={borderOptions.color} onChange={(e) => handleBorderOptionChange('color', e.target.value)} />
                        </SettingsGroup>
                    </div>
                )}

                {activeTab === Tab.Presets && (
                     <div>
                        <SettingsGroup title="Manage Saved Presets">
                           {userPresets.length === 0 ? (
                                <p className="text-gray-400 text-sm">You haven't saved any presets yet. Use the '+' button next to the main preset dropdown to save your current design.</p>
                           ) : (
                                <ul className="space-y-2">
                                    {userPresets.map(preset => (
                                        <li key={preset.name} className="flex items-center justify-between bg-black/20 p-3 rounded-md">
                                            <span className="font-medium">{preset.name}</span>
                                            <div className="space-x-2">
                                                <button onClick={() => onLoadPreset(preset)} className="text-sm text-indigo-400 hover:text-indigo-300">Load</button>
                                                <button onClick={() => onDeletePreset(preset.name)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                           )}
                        </SettingsGroup>
                    </div>
                )}

                 {activeTab === Tab.Experimental && isDebugMode && (
                    <div>
                        <SettingsGroup title="Custom Dot Shapes">
                            <div className="flex items-center">
                                <input type="checkbox" id="custom-svg-enable" checked={experimentalOptions.enabled} onChange={e => handleExperimentalOptionChange('enabled', e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                <label htmlFor="custom-svg-enable" className="ml-2 text-sm font-medium text-gray-300">Use Custom SVG for Dots</label>
                            </div>
                            {experimentalOptions.enabled && (
                                <div className="space-y-3">
                                    <Label htmlFor="custom-svg-preset">Shape Preset</Label>
                                    <Select 
                                        id="custom-svg-preset"
                                        options={svgPresets.map(p => ({ value: p.name, label: p.name }))}
                                        value={experimentalOptions.presetName}
                                        onChange={e => handleSvgPresetChange(e.target.value)}
                                    />
                                    <Label htmlFor="custom-svg-path">SVG Path Data</Label>
                                    <Textarea 
                                        id="custom-svg-path" 
                                        value={experimentalOptions.dotSvg}
                                        onChange={handleCustomSvgPathChange}
                                        placeholder="M50 0L100 50L50 100L0 50Z"
                                    />
                                    <p className="text-xs text-gray-500">Provide the `d` attribute of an SVG &lt;path&gt;. It will be scaled to fit each dot's area. Best results with a 100x100 viewBox.</p>
                                </div>
                            )}
                        </SettingsGroup>
                        <SettingsGroup title="Custom Corner Shapes">
                            <div className="flex items-center">
                                <input type="checkbox" id="custom-corner-enable" checked={experimentalOptions.cornerSquareEnabled} onChange={e => handleExperimentalOptionChange('cornerSquareEnabled', e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                <label htmlFor="custom-corner-enable" className="ml-2 text-sm font-medium text-gray-300">Use Custom SVG for Corners</label>
                            </div>
                            {experimentalOptions.cornerSquareEnabled && (
                                <div className="space-y-3">
                                    <Label htmlFor="custom-corner-preset">Shape Preset</Label>
                                    <Select 
                                        id="custom-corner-preset"
                                        options={cornerSquareSvgPresets.map(p => ({ value: p.name, label: p.name }))}
                                        value={experimentalOptions.cornerSquarePresetName}
                                        onChange={e => handleCornerSquareSvgPresetChange(e.target.value)}
                                    />
                                    <Label htmlFor="custom-corner-path">SVG Path Data</Label>
                                    <Textarea 
                                        id="custom-corner-path" 
                                        value={experimentalOptions.cornerSquareSvg}
                                        onChange={handleCustomCornerSvgPathChange}
                                        placeholder="M0 0 H100 V100 H0Z"
                                    />
                                    <p className="text-xs text-gray-500">Provide the `d` attribute of an SVG &lt;path&gt;. It will be scaled to fit each corner's area. Best results with a 100x100 viewBox.</p>
                                </div>
                            )}
                        </SettingsGroup>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrSettings;