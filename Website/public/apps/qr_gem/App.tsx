import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { ProcessedAppConfig, QrCodeOptions, FileExtension, BorderOptions, LogoShape, ExperimentalOptions, PresetName, DotInfo, CornerSquareInfo, BannerConfig, HeaderLogoConfig, UserPreset, RecentUrl, UserPresetSettings } from './types';
import QrSettings from './components/QrSettings';
import SavePresetModal from './components/SavePresetModal';
import { presets, presetOrder } from './presets';
import { svgPresets, zikyLetterPaths, cornerSquareSvgPresets } from './components/svg-presets';
import { loadConfig } from './modules/io/import-utils';
import { applyTheme } from './modules/theme/theme';
import * as db from './modules/db/idb-utils';
import Debug from './components/Debug';
import { PlusIcon } from './components/ui/icons';

const useIsMobile = (breakpoint = 1024): boolean => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};

interface TitleProps {
    bannerUrl?: string | null;
    headerLogoUrl?: string | null;
    bannerConfig?: BannerConfig;
    headerLogoConfig?: HeaderLogoConfig;
}

const Title: React.FC<TitleProps> = ({ bannerUrl, headerLogoUrl, bannerConfig, headerLogoConfig }) => {
    const isMobile = useIsMobile();
    const currentBannerConfig = isMobile ? bannerConfig?.mobile : bannerConfig?.desktop;
    const currentHeaderLogoConfig = isMobile ? headerLogoConfig?.mobile : headerLogoConfig?.desktop;

    return (
        <div className="relative mb-4 min-h-[6rem]">
            {headerLogoUrl && currentHeaderLogoConfig && (
                <img
                    src={headerLogoUrl}
                    alt="Header Logo"
                    className="absolute object-contain"
                    style={{
// FIX: Corrected typo from currentHeaderLogo_config to currentHeaderLogoConfig
                        maxHeight: `${currentHeaderLogoConfig.maxHeight}px`,
                        top: `${currentHeaderLogoConfig.top}px`,
                        left: currentHeaderLogoConfig.left !== undefined ? `${currentHeaderLogoConfig.left}px` : 'auto',
                        right: currentHeaderLogoConfig.right !== undefined ? `${currentHeaderLogoConfig.right}px` : 'auto',
                    }}
                />
            )}
            <div className="flex items-center justify-center h-full min-h-[6rem]">
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt="QR_Gem Banner"
                        className="object-contain"
                        style={{ maxHeight: `${currentBannerConfig?.maxHeight || 96}px` }}
                    />
                ) : (
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                            QR_Gem
                        </h1>
                        <p className="text-gray-400 mt-2">Craft Your Perfect QR Code</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Footer: React.FC<{ company: string; version: string; }> = ({ company, version }) => {
    return (
        <footer style={{ backgroundColor: 'var(--theme-card-bg)' }} className="mt-8 rounded-lg p-4 text-center text-sm text-gray-400 shadow-lg">
            <p>&copy; {new Date().getFullYear()} {company}. All Rights Reserved. Version {version}</p>
        </footer>
    );
};


const FramePreview: React.FC<{ borderOptions: BorderOptions; size: number; children: React.ReactNode;}> = ({ borderOptions, size, children }) => {
    const { style, width, color, cornerLength } = borderOptions;

    if (width <= 0) {
        return <div>{children}</div>;
    }
    
    if (style === 'corners') {
        const cornerElementStyle: React.CSSProperties = {
            position: 'absolute',
            backgroundColor: color,
            zIndex: 1,
        };
        const containerSize = size + width * 2;

        return (
            <div style={{ position: 'relative', width: containerSize, height: containerSize }}>
                {/* Top-left corner */}
                <div style={{...cornerElementStyle, top: 0, left: 0, width: `${cornerLength}px`, height: `${width}px`}} />
                <div style={{...cornerElementStyle, top: 0, left: 0, width: `${width}px`, height: `${cornerLength}px`}} />
                {/* Top-right corner */}
                <div style={{...cornerElementStyle, top: 0, right: 0, width: `${cornerLength}px`, height: `${width}px`}} />
                <div style={{...cornerElementStyle, top: 0, right: 0, width: `${width}px`, height: `${cornerLength}px`}} />
                {/* Bottom-left corner */}
                <div style={{...cornerElementStyle, bottom: 0, left: 0, width: `${cornerLength}px`, height: `${width}px`}} />
                <div style={{...cornerElementStyle, bottom: 0, left: 0, width: `${width}px`, height: `${cornerLength}px`}} />
                {/* Bottom-right corner */}
                <div style={{...cornerElementStyle, bottom: 0, right: 0, width: `${cornerLength}px`, height: `${width}px`}} />
                <div style={{...cornerElementStyle, bottom: 0, right: 0, width: `${width}px`, height: `${cornerLength}px`}} />
                <div style={{ position: 'absolute', top: width, left: width }}>{children}</div>
            </div>
        );
    }
    
    const borderStyle: React.CSSProperties = {
        padding: `${width}px`,
        boxSizing: 'border-box',
    };

    if (style === 'double') {
        borderStyle.border = `${width / 3}px solid ${color}`;
        borderStyle.outline = `${width / 3}px solid ${color}`;
        borderStyle.outlineOffset = `-${width/3*2}px`;
        borderStyle.backgroundColor = 'transparent';
    } else if (style === 'inset' || style === 'ridge') {
        borderStyle.border = `${width}px ${style} ${color}`;
    } else {
        borderStyle.border = `${width}px ${style} ${color}`;
    }

    return (
        <div style={borderStyle}>
            {children}
        </div>
    );
};

const DotOverlay: React.FC<{
    size: number;
    dotInfos: DotInfo[];
    options: QrCodeOptions;
    experimentalOptions: ExperimentalOptions;
}> = ({ size, dotInfos, options, experimentalOptions }) => {
    const { color, gradient } = options.dotsOptions || {};
    const gradientId = 'dot-gradient-overlay';
    let fill = color || '#000';

    if (gradient) {
        fill = `url(#${gradientId})`;
    }

    const dotPaths = React.useMemo(() => {
        if (experimentalOptions.presetName === 'Ziky') {
            return dotInfos.map(() => zikyLetterPaths[Math.floor(Math.random() * zikyLetterPaths.length)]);
        }
        // Fallback for all other presets
        return dotInfos.map(() => experimentalOptions.dotSvg);
    }, [dotInfos, experimentalOptions.presetName, experimentalOptions.dotSvg]);


    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute top-0 left-0 pointer-events-none"
        >
            {gradient && (
                <defs>
                    {gradient.type === 'linear' ? (
                        <linearGradient id={gradientId} gradientTransform={`rotate(${gradient.rotation * 180 / Math.PI})`}>
                            {gradient.colorStops.map((cs, i) => <stop key={i} offset={`${cs.offset * 100}%`} stopColor={cs.color} />)}
                        </linearGradient>
                    ) : (
                        <radialGradient id={gradientId}>
                            {gradient.colorStops.map((cs, i) => <stop key={i} offset={`${cs.offset * 100}%`} stopColor={cs.color} />)}
                        </radialGradient>
                    )}
                </defs>
            )}
            {dotInfos.map((dot, index) => (
                <g key={index} transform={`translate(${dot.x} ${dot.y}) scale(${dot.size / 100})`}>
                    <path d={dotPaths[index]} fill={fill} />
                </g>
            ))}
        </svg>
    );
};

const CornerSquareOverlay: React.FC<{
    size: number;
    cornerSquareInfos: CornerSquareInfo[];
    options: QrCodeOptions;
    experimentalOptions: ExperimentalOptions;
}> = ({ size, cornerSquareInfos, options, experimentalOptions }) => {
    const { color, gradient } = options.cornersSquareOptions || {};
    const gradientId = 'corner-square-gradient-overlay';
    let fill = color || '#000';

    if (gradient) {
        fill = `url(#${gradientId})`;
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute top-0 left-0 pointer-events-none"
        >
            {gradient && (
                <defs>
                    {gradient.type === 'linear' ? (
                        <linearGradient id={gradientId} gradientTransform={`rotate(${gradient.rotation * 180 / Math.PI})`}>
                            {gradient.colorStops.map((cs, i) => <stop key={i} offset={`${cs.offset * 100}%`} stopColor={cs.color} />)}
                        </linearGradient>
                    ) : (
                        <radialGradient id={gradientId}>
                            {gradient.colorStops.map((cs, i) => <stop key={i} offset={`${cs.offset * 100}%`} stopColor={cs.color} />)}
                        </radialGradient>
                    )}
                </defs>
            )}
            {cornerSquareInfos.map((corner, index) => (
                <g key={index} transform={`translate(${corner.x} ${corner.y}) scale(${corner.size / 100})`}>
                    <path d={experimentalOptions.cornerSquareSvg} fill={fill} />
                </g>
            ))}
        </svg>
    );
};


// Helper function to determine if a module is part of a finder pattern
const isPositioningModule = (row: number, col: number, moduleCount: number): boolean => {
    if (row < 0 || col < 0 || row >= moduleCount || col >= moduleCount) return false;
    // Top-left finder pattern
    if (row <= 6 && col <= 6) return true;
    // Top-right finder pattern
    if (row <= 6 && col >= moduleCount - 7) return true;
    // Bottom-left finder pattern
    if (row >= moduleCount - 7 && col <= 6) return true;
    return false;
};


const App: React.FC = () => {
    const [config, setConfig] = useState<ProcessedAppConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const [options, setOptions] = useState<QrCodeOptions | null>(null);
    const [size] = useState<number>(280);
    const [url, setUrl] = useState<string>('');
    const [fileExt, setFileExt] = useState<FileExtension>('png');
    const [logoShape, setLogoShape] = useState<LogoShape>('square');
    
    // States for new intuitive logo controls
    const [logoSizeRatio, setLogoSizeRatio] = useState<number>(0.36);
    const [logoMargin, setLogoMargin] = useState<number>(5);
    
    // States for logo visibility and source
    const [isLogoVisible, setIsLogoVisible] = useState<boolean>(false);
    const [logoSrc, setLogoSrc] = useState<string | undefined>(undefined);

    const [borderOptions, setBorderOptions] = useState<BorderOptions | null>(null);
    const [experimentalOptions, setExperimentalOptions] = useState<ExperimentalOptions | null>(null);
    const [dotInfos, setDotInfos] = useState<DotInfo[]>([]);
    const [cornerSquareInfos, setCornerSquareInfos] = useState<CornerSquareInfo[]>([]);
    
    // State for the unified preset dropdown
    const [selectedPresetIdentifier, setSelectedPresetIdentifier] = useState<string>('none');

    // DB states
    const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
    const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);

    // Modal state
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // Debug states
    const [logs, setLogs] = useState<string[]>([]);
    const [editableBannerConfig, setEditableBannerConfig] = useState<BannerConfig | undefined>(undefined);
    const [editableHeaderLogoConfig, setEditableHeaderLogoConfig] = useState<HeaderLogoConfig | undefined>(undefined);

    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    
    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10)); // Keep last 10 logs
    }, []);
    
    const refreshUserPresets = useCallback(() => {
        db.getPresets().then(setUserPresets);
    }, []);

    const refreshRecentUrls = useCallback(() => {
        db.getRecentUrls().then(setRecentUrls);
    }, []);

    useEffect(() => {
        const startup = async () => {
            try {
                addLog('Loading configuration...');
                const appConfig = await loadConfig('/config.json');
                setConfig(appConfig);
                applyTheme(appConfig.theme);

                addLog('Initializing database...');
                await db.initDB(appConfig.indexeddb.db, `${appConfig.indexeddb.store}_presets`, `${appConfig.indexeddb.store}_urls`);
                refreshUserPresets();
                refreshRecentUrls();
                
                const initialOptions = {
                    ...appConfig.initialQrOptions,
                    data: appConfig.initialUrl,
                };

                setOptions(initialOptions);
                setLogoSrc(appConfig.defaultLogoUrl);
                setIsLogoVisible(appConfig.initialLogoOn ?? false);
                setBorderOptions(appConfig.initialBorderOptions);
                setExperimentalOptions(appConfig.initialExperimentalOptions);
                setLogoShape(appConfig.initialLogoShape);
                setLogoSizeRatio(appConfig.initialLogoSizeRatio);
                setLogoMargin(appConfig.initialLogoMargin);
                setUrl(appConfig.initialUrl);

                if (appConfig.debug_mode) {
                    setEditableBannerConfig(appConfig.bannerConfig);
                    setEditableHeaderLogoConfig(appConfig.headerLogoConfig);
                }
                addLog('Configuration loaded successfully.');
            } catch (error) {
                console.error("Failed to load application configuration.", error);
                addLog('Error: Failed to load config!');
            } finally {
                setLoading(false);
            }
        };

        startup();
    }, [addLog, refreshUserPresets, refreshRecentUrls]);

    // Debounced effect to save recent URLs
    useEffect(() => {
        const handler = setTimeout(() => {
            if (url && config) {
                db.saveRecentUrl(url, config.indexeddb.max_recent).then(() => {
                    // Optional: refresh immediately after save
                    // refreshRecentUrls(); 
                });
            }
        }, 1000); // Debounce by 1s

        return () => {
            clearTimeout(handler);
        };
    }, [url, config, refreshRecentUrls]);


    // Effect to calculate and update imageOptions for the library based on intuitive controls
    useEffect(() => {
        setOptions(prev => {
            if (!prev) return prev;
            
            const libMargin = Math.max(0, logoMargin);
            const calculatedImageSize = logoSizeRatio + (2 * libMargin) / size;

            return {
                ...prev,
                imageOptions: {
                    ...prev.imageOptions,
                    imageSize: Math.max(0, calculatedImageSize),
                    margin: libMargin,
                }
            };
        });
    }, [logoSizeRatio, logoMargin, size]);
    
    // Effect to toggle logo visibility
    useEffect(() => {
        setOptions(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                image: isLogoVisible ? logoSrc : undefined,
            };
        });
    }, [isLogoVisible, logoSrc]);
    
    const handleLogoUpload = useCallback((dataUrl: string) => {
        setLogoSrc(dataUrl);
        if (!isLogoVisible) {
            setIsLogoVisible(true);
        }
    }, [isLogoVisible]);

    const applyPresetSettings = useCallback((settings: UserPresetSettings) => {
        const { options: presetOptions, borderOptions, experimentalOptions, logoShape, logoSizeRatio, logoMargin } = settings;
        
        // This is a bit tricky because the saved options don't have data/image.
        // We preserve the current URL and image source.
        setOptions(prev => ({
            ...prev,
            ...presetOptions,
            data: prev?.data || '',
            image: prev?.image,
        }));

        setBorderOptions(borderOptions);
        setExperimentalOptions(experimentalOptions);
        setLogoShape(logoShape);
        setLogoSizeRatio(logoSizeRatio);
        setLogoMargin(logoMargin);
        
    }, []);

    const handleSavePreset = useCallback(async (name: string) => {
        if (!options || !borderOptions || !experimentalOptions) return;
        
        // Exclude transient data from saved options
        const { data, image, ...savableOptions } = options;

        const settings: UserPresetSettings = {
            options: savableOptions,
            borderOptions,
            experimentalOptions,
            logoShape,
            logoSizeRatio,
            logoMargin
        };
        await db.savePreset({ name, settings });
        addLog(`Preset "${name}" saved.`);
        refreshUserPresets();
        // Set the dropdown to the newly saved preset
        setSelectedPresetIdentifier(`user:${name}`);
    }, [options, borderOptions, experimentalOptions, logoShape, logoSizeRatio, logoMargin, addLog, refreshUserPresets]);
    
    const handleSavePresetAndCloseModal = async (name: string) => {
        await handleSavePreset(name);
        setIsSaveModalOpen(false);
    };

    const handleLoadPreset = useCallback((preset: UserPreset) => {
        applyPresetSettings(preset.settings);
        setSelectedPresetIdentifier(`user:${preset.name}`);
        addLog(`Preset "${preset.name}" loaded.`);
    }, [applyPresetSettings, addLog]);

    const handleDeletePreset = useCallback(async (name: string) => {
        if (window.confirm(`Are you sure you want to delete the preset "${name}"?`)) {
            await db.deletePreset(name);
            addLog(`Preset "${name}" deleted.`);
            refreshUserPresets();
            // If the deleted preset was selected, revert to default
            if (selectedPresetIdentifier === `user:${name}`) {
                setSelectedPresetIdentifier('none');
                // Optionally, apply the 'none' preset settings
                // applyBuiltInPreset('none');
            }
        }
    }, [addLog, refreshUserPresets, selectedPresetIdentifier]);

    const visibleBuiltInPresets = useMemo(() => {
        if (!config?.debug_mode) {
            return presetOrder;
        }
        return ['none', 'ziky', ...presetOrder.filter(p => p !== 'none')];
    }, [config?.debug_mode]);

    const visibleUserPresets = useMemo(() => {
        if (config?.debug_mode) {
            return userPresets;
        }
        return userPresets.filter(p => 
            !p.settings.experimentalOptions.enabled && 
            !p.settings.experimentalOptions.cornerSquareEnabled
        );
    }, [userPresets, config?.debug_mode]);


    const applyBuiltInPreset = useCallback((presetName: PresetName) => {
        if (!config || !options) return;

        addLog(`Applying built-in preset: ${presetName}`);
        
        const preset = presets[presetName];
        const defaultExpOptions: ExperimentalOptions = { 
            enabled: false, 
            presetName: 'Diamond', 
            dotSvg: svgPresets.find(p => p.name === 'Diamond')?.path || '',
            cornerSquareEnabled: false,
            cornerSquarePresetName: 'Square',
            cornerSquareSvg: cornerSquareSvgPresets.find(p => p.name === 'Square')?.path || ''
        };

        if (presetName === 'none' || !preset) {
            setOptions({
                ...config.initialQrOptions,
                data: url,
                image: options.image,
            });
            setBorderOptions(config.initialBorderOptions);
            setExperimentalOptions(config.initialExperimentalOptions);
            setLogoShape(config.initialLogoShape);
            setLogoMargin(config.initialLogoMargin);
            setLogoSizeRatio(config.initialLogoSizeRatio);
            return;
        }
        
        const presetImageOptions = { ...config.initialQrOptions.imageOptions, ...preset.options.imageOptions };
        const newLogoMargin = presetImageOptions.margin;
        const newLogoSizeRatio = presetImageOptions.imageSize - (2 * newLogoMargin) / size;

        setLogoMargin(newLogoMargin);
        setLogoSizeRatio(newLogoSizeRatio);

        setOptions({
            ...config.initialQrOptions,
            ...preset.options,
            data: url,
            image: options.image,
        });

        setBorderOptions({
            ...config.initialBorderOptions,
            ...preset.borderOptions
        });

        setExperimentalOptions({
            ...defaultExpOptions,
            ...preset.experimentalOptions,
        });
        
        setLogoShape(preset.logoShape || 'square');

    }, [url, options, size, config, addLog]);

    const handlePresetDropdownChange = (identifier: string) => {
        setSelectedPresetIdentifier(identifier);
    
        if (identifier.startsWith('user:')) {
            const presetName = identifier.substring(5);
            const userPreset = userPresets.find(p => p.name === presetName);
            if (userPreset) {
                handleLoadPreset(userPreset);
            }
        } else {
            applyBuiltInPreset(identifier as PresetName);
        }
    };


    // Effect to render the main QR code (which may have transparent dots)
    useEffect(() => {
        if (!options || !experimentalOptions || !ref.current) return;

        addLog('Updating QR code preview...');
        const qrOptionsForDisplay = { ...options, width: size, height: size, data: url };
        
        if (experimentalOptions.enabled) {
            qrOptionsForDisplay.dotsOptions = {
                ...qrOptionsForDisplay.dotsOptions,
                color: '#00000000', // Fully transparent
                gradient: undefined,
            };
        }
        
        if (experimentalOptions.cornerSquareEnabled) {
            qrOptionsForDisplay.cornersSquareOptions = {
                ...qrOptionsForDisplay.cornersSquareOptions,
                color: '#00000000',
                gradient: undefined,
            };
        }

        // Always create a new instance for robustness against potential library state issues.
        const qrCode = new QRCodeStyling(qrOptionsForDisplay);

        // Clean up previous QR code element before appending a new one.
        while (ref.current.firstChild) {
            ref.current.removeChild(ref.current.firstChild);
        }
        
        qrCode.append(ref.current);
        
        // Update the ref for other parts of the app (like download)
        qrCodeRef.current = qrCode;

    }, [options, url, size, experimentalOptions, addLog]);

    // Effect to calculate dot positions for the SVG overlay when in experimental mode
    const calculateDotInfos = useCallback(() => {
        if (!experimentalOptions?.enabled || !options) {
            setDotInfos([]);
            return;
        }
    
        const calculationOptions: QrCodeOptions = {
            data: url,
            qrOptions: options.qrOptions,
        };
        
        const tempQr = new QRCodeStyling(calculationOptions);
        const internalQr = (tempQr as any)._qr;
    
        if (!internalQr || typeof internalQr.getModuleCount !== 'function' || typeof internalQr.isDark !== 'function') {
            console.error("Internal QR code structure not found. Cannot calculate dot positions for experimental mode.");
            setDotInfos([]);
            return;
        }
    
        const moduleCount = internalQr.getModuleCount();
        if (moduleCount === 0) {
            setDotInfos([]);
            return;
        }
    
        const infos: DotInfo[] = [];
        const workingSize = size - (options.margin || 0) * 2;
        const moduleSize = workingSize / moduleCount;
    
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (isPositioningModule(row, col, moduleCount)) {
                    continue; // Skip finder patterns
                }
    
                if (internalQr.isDark(row, col)) {
                    infos.push({
                        x: (options.margin || 0) + col * moduleSize,
                        y: (options.margin || 0) + row * moduleSize,
                        size: moduleSize,
                    });
                }
            }
        }
        
        setDotInfos(infos);
    
    }, [experimentalOptions, options, size, url]);
    
    useEffect(() => {
        calculateDotInfos();
    }, [calculateDotInfos]);
    
    const calculateCornerSquareInfos = useCallback(() => {
        if (!experimentalOptions?.cornerSquareEnabled || !options) {
            setCornerSquareInfos([]);
            return;
        }

        const calculationOptions: QrCodeOptions = {
            data: url,
            qrOptions: options.qrOptions,
        };
        
        const tempQr = new QRCodeStyling(calculationOptions);
        const internalQr = (tempQr as any)._qr;

        if (!internalQr || typeof internalQr.getModuleCount !== 'function') {
            console.error("Internal QR code structure not found. Cannot calculate corner positions.");
            setCornerSquareInfos([]);
            return;
        }

        const moduleCount = internalQr.getModuleCount();
        if (moduleCount === 0) {
            setCornerSquareInfos([]);
            return;
        }
        
        const workingSize = size - (options.margin || 0) * 2;
        const moduleSize = workingSize / moduleCount;
        const cornerSquareSize = 7 * moduleSize;

        const infos: CornerSquareInfo[] = [
            // Top-left
            { x: (options.margin || 0), y: (options.margin || 0), size: cornerSquareSize },
            // Top-right
            { x: (options.margin || 0) + (moduleCount - 7) * moduleSize, y: (options.margin || 0), size: cornerSquareSize },
            // Bottom-left
            { x: (options.margin || 0), y: (options.margin || 0) + (moduleCount - 7) * moduleSize, size: cornerSquareSize },
        ];
        
        setCornerSquareInfos(infos);

    }, [experimentalOptions, options, size, url]);
    
    useEffect(() => {
        calculateCornerSquareInfos();
    }, [calculateCornerSquareInfos]);


    const triggerDownload = (href: string, downloadName: string) => {
        const link = document.createElement('a');
        link.href = href;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if(href.startsWith('blob:')) {
            URL.revokeObjectURL(href);
        }
    };

    const shadeColor = (color: string, percent: number) => {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        R = Math.floor(R * (100 + percent) / 100);
        G = Math.floor(G * (100 + percent) / 100);
        B = Math.floor(B * (100 + percent) / 100);
        R = Math.min(R, 255);
        G = Math.min(G, 255);
        B = Math.min(B, 255);
        const RR = R.toString(16).padStart(2, '0');
        const GG = G.toString(16).padStart(2, '0');
        const BB = B.toString(16).padStart(2, '0');
        return `#${RR}${GG}${BB}`;
    };
    
    const getFinalSvgString = useCallback(async (): Promise<string> => {
        if (!qrCodeRef.current || !options || !experimentalOptions || !borderOptions) return '';
        
        addLog('Generating final SVG string...');
        // 1. Get the base SVG (which has transparent dots/corners in experimental mode)
        const baseQrRaw = await qrCodeRef.current.getRawData('svg');
        if (!(baseQrRaw instanceof Blob)) return '';
        let baseQrSvg = await baseQrRaw.text();

        let finalQrSvg = baseQrSvg;

        // 2. Add clip-path for circular logo if needed
        if (options.image && logoShape === 'circle') {
            const imageTagRegex = /<image[^>]*>/;
            const imageMatch = finalQrSvg.match(imageTagRegex);

            if (imageMatch) {
                const imageTag = imageMatch[0];
                const getAttr = (attr: string): number => {
                    const match = imageTag.match(new RegExp(`${attr}="([^"]*)"`));
                    return match ? parseFloat(match[1]) : 0;
                };
                const x = getAttr('x');
                const y = getAttr('y');
                const width = getAttr('width');
                const height = getAttr('height');
                const cx = x + width / 2;
                const cy = y + height / 2;
                const r = Math.min(width, height) / 2;
                const clipPathId = 'logo-clip-circle-download';

                const clipPath = `<clipPath id="${clipPathId}"><circle cx="${cx}" cy="${cy}" r="${r}" /></clipPath>`;
                const clippedImageTag = imageTag.replace(/(\s*\/?>)$/, ` clip-path="url(#${clipPathId})" $1`);

                if (finalQrSvg.includes('<defs>')) {
                    finalQrSvg = finalQrSvg.replace(/<defs>/, `<defs>${clipPath}`);
                } else {
                    finalQrSvg = finalQrSvg.replace(/<svg[^>]*>/, `$&<defs>${clipPath}</defs>`);
                }
                finalQrSvg = finalQrSvg.replace(imageTag, clippedImageTag);
            }
        }

        // 3. Build overlays if necessary
        const allDefs: string[] = [];
        const allOverlays: string[] = [];

        if (experimentalOptions.enabled && dotInfos.length > 0) {
            const { color, gradient } = options.dotsOptions || {};
            const gradientId = 'dot-gradient-download';
            let fill = color || '#000';

            if (gradient) {
                fill = `url(#${gradientId})`;
                const gradientTag = gradient.type === 'linear'
                    ? `<linearGradient id="${gradientId}" gradientTransform="rotate(${gradient.rotation * 180 / Math.PI})">
                        ${gradient.colorStops.map(cs => `<stop offset="${cs.offset * 100}%" stop-color="${cs.color}" />`).join('')}
                       </linearGradient>`
                    : `<radialGradient id="${gradientId}">
                        ${gradient.colorStops.map(cs => `<stop offset="${cs.offset * 100}%" stop-color="${cs.color}" />`).join('')}
                       </radialGradient>`;
                allDefs.push(gradientTag);
            }

            const dotPaths = experimentalOptions.presetName === 'Ziky'
                ? dotInfos.map(() => zikyLetterPaths[Math.floor(Math.random() * zikyLetterPaths.length)])
                : dotInfos.map(() => experimentalOptions.dotSvg);

            const overlaySvg = dotInfos.map((dot, index) => 
                `<g transform="translate(${dot.x} ${dot.y}) scale(${dot.size / 100})">
                    <path d="${dotPaths[index]}" fill="${fill}" />
                </g>`
            ).join('');
            allOverlays.push(overlaySvg);
        }
        
        if (experimentalOptions.cornerSquareEnabled && cornerSquareInfos.length > 0) {
            const { color, gradient } = options.cornersSquareOptions || {};
            const gradientId = 'corner-square-gradient-download';
            let fill = color || '#000';

            if (gradient) {
                fill = `url(#${gradientId})`;
                const gradientTag = gradient.type === 'linear'
                    ? `<linearGradient id="${gradientId}" gradientTransform="rotate(${gradient.rotation * 180 / Math.PI})">
                        ${gradient.colorStops.map(cs => `<stop offset="${cs.offset * 100}%" stop-color="${cs.color}" />`).join('')}
                       </linearGradient>`
                    : `<radialGradient id="${gradientId}">
                        ${gradient.colorStops.map(cs => `<stop offset="${cs.offset * 100}%" stop-color="${cs.color}" />`).join('')}
                       </radialGradient>`;
                allDefs.push(gradientTag);
            }
            
            const overlaySvg = cornerSquareInfos.map((corner) => 
                `<g transform="translate(${corner.x} ${corner.y}) scale(${corner.size / 100})">
                    <path d="${experimentalOptions.cornerSquareSvg}" fill="${fill}" />
                </g>`
            ).join('');
            allOverlays.push(overlaySvg);
        }

        if (allDefs.length > 0) {
            const defsString = allDefs.join('');
             if (finalQrSvg.includes('<defs>')) {
                finalQrSvg = finalQrSvg.replace(/<defs>/, `<defs>${defsString}`);
            } else {
                finalQrSvg = finalQrSvg.replace(/<svg[^>]*>/, `$&<defs>${defsString}</defs>`);
            }
        }
        if (allOverlays.length > 0) {
             finalQrSvg = finalQrSvg.replace('</svg>', `${allOverlays.join('')}</svg>`);
        }
        
        const borderIsVisible = borderOptions.width > 0;
        if (!borderIsVisible) {
            addLog('SVG generated.');
            return finalQrSvg;
        }

        const fullSize = size + borderOptions.width * 2;
        const frameSvg = generateFrameSvg();
        const qrWithPosition = finalQrSvg.replace('<svg', `<svg x="${borderOptions.width}" y="${borderOptions.width}"`);
        
        addLog('SVG with frame generated.');
        return `
            <svg width="${fullSize}" height="${fullSize}" viewBox="0 0 ${fullSize} ${fullSize}" xmlns="http://www.w3.org/2000/svg">
                ${frameSvg}
                ${qrWithPosition}
            </svg>`;
    }, [qrCodeRef.current, experimentalOptions, dotInfos, cornerSquareInfos, borderOptions, size, options, logoShape, addLog]);

    const generateFrameSvg = () => {
        if (!borderOptions) return '';
        const { style, width, color, cornerLength } = borderOptions;
        if (width <= 0) return '';
    
        const fullSize = size + width * 2;
        const strokeWidth = style === 'double' ? width / 3 : width;
        const halfStroke = strokeWidth / 2;
    
        switch (style) {
            case 'solid':
                return `<rect x="${halfStroke}" y="${halfStroke}" width="${fullSize - strokeWidth}" height="${fullSize - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
            case 'double':
                const outerRect = `<rect x="${halfStroke}" y="${halfStroke}" width="${fullSize - strokeWidth}" height="${fullSize - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
                const innerRectPos = strokeWidth * 2;
                const innerRectSize = fullSize - (strokeWidth * 4);
                const innerRect = `<rect x="${innerRectPos + halfStroke}" y="${innerRectPos + halfStroke}" width="${innerRectSize - strokeWidth}" height="${innerRectSize - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
                return outerRect + innerRect;
            case 'dashed':
                return `<rect x="${halfStroke}" y="${halfStroke}" width="${fullSize - strokeWidth}" height="${fullSize - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="${width * 2}, ${width}" />`;
            case 'dotted':
                return `<rect x="${halfStroke}" y="${halfStroke}" width="${fullSize - strokeWidth}" height="${fullSize - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="0, ${width * 1.5}" stroke-linecap="round" />`;
            case 'inset':
            case 'ridge':
                const lightColor = shadeColor(color, style === 'ridge' ? 20 : -20);
                const darkColor = shadeColor(color, style === 'ridge' ? -20 : 20);
                return `
                    <path d="M ${0},${fullSize} L ${0},${0} L ${fullSize},${0}" stroke="${lightColor}" stroke-width="${width}" fill="none"/>
                    <path d="M ${0},${fullSize} L ${fullSize},${fullSize} L ${fullSize},${0}" stroke="${darkColor}" stroke-width="${width}" fill="none"/>
                `;
            case 'corners':
                const l = cornerLength;
                const w = width;
                const fs = fullSize;
                return `
                    <path d="M ${w/2},${l} L ${w/2},${w/2} L ${l},${w/2}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="square" />
                    <path d="M ${fs - l},${w/2} L ${fs - w/2},${w/2} L ${fs - w/2},${l}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="square" />
                    <path d="M ${w/2},${fs - l} L ${w/2},${fs - w/2} L ${l},${fs - w/2}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="square" />
                    <path d="M ${fs - l},${fs - w/2} L ${fs - w/2},${fs - w/2} L ${fs - w/2},${fs - l}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="square" />
                `;
        }
    };
    
    const handleDownload = useCallback(async () => {
        if (!qrCodeRef.current || !borderOptions) return;
        
        addLog(`Starting download as ${fileExt.toUpperCase()}...`);
        const downloadName = `qr-gem-code.${fileExt}`;

        const finalSvg = await getFinalSvgString();
        if (!finalSvg) {
            addLog('Error: Failed to generate final SVG.');
            return;
        }

        if (fileExt === 'svg') {
            const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
            triggerDownload(URL.createObjectURL(blob), downloadName);
            addLog('SVG download triggered.');
            return;
        }
    
        addLog('Converting SVG to raster format...');
        const borderIsVisible = borderOptions.width > 0;
        const fullSize = size + (borderIsVisible ? borderOptions.width * 2 : 0);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            addLog('Error: Could not create canvas context.');
            return;
        }
    
        canvas.width = fullSize;
        canvas.height = fullSize;
    
        const finalImage = new Image();
        finalImage.crossOrigin = "anonymous";
        const svgBlob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
        const objectUrl = URL.createObjectURL(svgBlob);
        finalImage.src = objectUrl;
    
        finalImage.onload = () => {
            addLog('Drawing image to canvas...');
            ctx.drawImage(finalImage, 0, 0, fullSize, fullSize);
            const url = canvas.toDataURL(`image/${fileExt}`);
            triggerDownload(url, downloadName);
            addLog(`${fileExt.toUpperCase()} download triggered.`);
            URL.revokeObjectURL(objectUrl);
        };
        finalImage.onerror = (e) => {
            console.error("Failed to load final SVG image for canvas drawing.", e);
            addLog('Error: Failed to draw SVG to canvas.');
            URL.revokeObjectURL(objectUrl);
        };
    }, [fileExt, getFinalSvgString, size, borderOptions, addLog]);

    if (loading || !options || !borderOptions || !experimentalOptions || !config) {
        return (
            <div style={{ backgroundColor: 'var(--theme-bg)' }} className="min-h-screen flex items-center justify-center">
                <div className="text-white text-2xl">Loading QR_Gem...</div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--theme-bg)' }} className="flex flex-col min-h-screen text-white p-4 sm:p-6 md:p-8">
            <main className="flex-grow max-w-7xl mx-auto w-full flex flex-col">
                <Title 
                    bannerUrl={config.bannerImageUrl} 
                    headerLogoUrl={config.headerLogoUrl} 
                    bannerConfig={config.debug_mode ? editableBannerConfig : config.bannerConfig}
                    headerLogoConfig={config.debug_mode ? editableHeaderLogoConfig : config.headerLogoConfig}
                />
                <div className="mb-8 flex justify-center">
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <label htmlFor="preset-selector" className="font-medium text-gray-300 flex-shrink-0">Load Preset:</label>
                        <select
                            id="preset-selector"
                            value={selectedPresetIdentifier}
                            onChange={(e) => handlePresetDropdownChange(e.target.value)}
                            style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)'}}
                            className="flex-grow text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <optgroup label="Built-in Presets">
                                {visibleBuiltInPresets.map((key) => (
                                    <option key={key} value={key}>{presets[key as PresetName].name}</option>
                                ))}
                            </optgroup>
                            {visibleUserPresets.length > 0 && (
                                <optgroup label="My Presets">
                                    {visibleUserPresets.map((preset) => (
                                        <option key={preset.name} value={`user:${preset.name}`}>{preset.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <button
                            onClick={() => setIsSaveModalOpen(true)}
                            style={{ backgroundColor: 'var(--theme-accent)'}}
                            className="p-2 text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save current design as a new preset"
                        >
                            <PlusIcon/>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow">
                    {/* Left Side: Preview */}
                    <div style={{ backgroundColor: 'var(--theme-card-bg)' }} className="lg:col-span-2 rounded-lg p-6 flex flex-col items-center justify-center space-y-6 shadow-lg">
                        <div className="bg-white rounded-lg shadow-inner">
                             <FramePreview borderOptions={borderOptions} size={size}>
                                <div className="relative" style={{width: size, height: size}}>
                                    <div ref={ref} style={{ width: `${size}px`, height: `${size}px`}}/>
                                    
                                    {experimentalOptions.enabled && dotInfos.length > 0 && (
                                        <DotOverlay
                                            size={size}
                                            dotInfos={dotInfos}
                                            options={options}
                                            experimentalOptions={experimentalOptions}
                                        />
                                    )}

                                    {experimentalOptions.cornerSquareEnabled && cornerSquareInfos.length > 0 && (
                                        <CornerSquareOverlay
                                            size={size}
                                            cornerSquareInfos={cornerSquareInfos}
                                            options={options}
                                            experimentalOptions={experimentalOptions}
                                        />
                                    )}
                                </div>
                            </FramePreview>
                        </div>
                        <div className="w-full">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onBlur={refreshRecentUrls}
                                list="recent-urls-list"
                                placeholder="Enter URL or text"
                                style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)'}}
                                className="w-full border text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <datalist id="recent-urls-list">
                                {recentUrls.map(item => <option key={item.timestamp} value={item.url} />)}
                            </datalist>
                        </div>
                    </div>

                    {/* Right Side: Settings */}
                    <div className="lg:col-span-3 flex flex-col">
                        <QrSettings 
                            options={options} 
                            setOptions={setOptions} 
                            borderOptions={borderOptions} 
                            setBorderOptions={setBorderOptions} 
                            logoShape={logoShape}
                            setLogoShape={setLogoShape}
                            experimentalOptions={experimentalOptions}
                            setExperimentalOptions={setExperimentalOptions}
                            logoSizeRatio={logoSizeRatio}
                            setLogoSizeRatio={setLogoSizeRatio}
                            logoMargin={logoMargin}
                            setLogoMargin={setLogoMargin}
                            isLogoVisible={isLogoVisible}
                            setIsLogoVisible={setIsLogoVisible}
                            onLogoUpload={handleLogoUpload}
                            userPresets={userPresets}
                            onLoadPreset={handleLoadPreset}
                            onDeletePreset={handleDeletePreset}
                            isDebugMode={config.debug_mode || false}
                        />
                    </div>
                </div>

                {/* Download Section */}
                <div style={{ backgroundColor: 'var(--theme-card-bg)' }} className="mt-8 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <label htmlFor="file-type" className="font-medium text-gray-300">Download as:</label>
                        <select
                            id="file-type"
                            value={fileExt}
                            onChange={(e) => setFileExt(e.target.value as FileExtension)}
                            style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)'}}
                            className="text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WEBP</option>
                            <option value="svg">SVG</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDownload}
                        style={{ backgroundColor: 'var(--theme-accent)'}}
                        className="w-full sm:w-auto hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-out shadow-md"
                    >
                        Export & Download
                    </button>
                </div>
                <Footer company={config.company} version={config.version} />
            </main>
            {config.debug_mode && editableBannerConfig && editableHeaderLogoConfig && (
                <Debug
                    logs={logs}
                    bannerConfig={editableBannerConfig}
                    setBannerConfig={setEditableBannerConfig}
                    headerLogoConfig={editableHeaderLogoConfig}
                    setHeaderLogoConfig={setEditableHeaderLogoConfig}
                />
            )}
            <SavePresetModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSavePresetAndCloseModal}
            />
        </div>
    );
};

export default App;