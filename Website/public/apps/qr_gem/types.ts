import type { Options as QrCodeOptions, DotType, CornerSquareType, CornerDotType, Gradient } from 'qr-code-styling';

export type { QrCodeOptions, DotType, CornerSquareType, CornerDotType, Gradient };

export enum Tab {
  Shapes = 'Shapes',
  Colors = 'Colors',
  Logo = 'Logo',
  Corners = 'Corners',
  Frames = 'Frames',
  Presets = 'Presets',
  Experimental = 'Experimental',
}

export type FileExtension = "svg" | "png" | "jpeg" | "webp";

export type LogoShape = 'square' | 'circle';

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'corners' | 'inset' | 'ridge';

export type BorderOptions = {
  style: BorderStyle;
  width: number;
  color: string;
  cornerLength: number;
};

export type ExperimentalOptions = {
  enabled: boolean; // For dots
  dotSvg: string;
  presetName: string;
  // New options for corner squares
  cornerSquareEnabled: boolean;
  cornerSquareSvg: string;
  cornerSquarePresetName: string;
};

export type PresetName = 'none' | 'ziky' | 'neon-funk' | 'classic-tech' | 'golden-royal';

export interface Preset {
  name: string;
  options: Partial<QrCodeOptions>;
  borderOptions: Partial<BorderOptions>;
  experimentalOptions?: Partial<ExperimentalOptions>;
  logoShape?: LogoShape;
}

// Type for storing position and size info for each dot in the QR code
export type DotInfo = {
  x: number;
  y: number;
  size: number;
};

// Type for storing position and size info for each corner square
export type CornerSquareInfo = {
  x: number;
  y: number;
  size: number;
};


// Type for the selectable SVG shape presets
export type SvgPreset = {
  name: string;
  path: string;
};

export interface Theme {
    backgroundColor: string;
    textColor: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    cardBackgroundColor: string;
    inputBackgroundColor: string;
    borderColor: string;
}

export interface CommonImageConfig {
  maxHeight: number;
}

export interface PositionalImageConfig extends CommonImageConfig {
  top: number;
  left?: number;
  right?: number;
}

export interface BannerConfig {
  desktop: CommonImageConfig;
  mobile: CommonImageConfig;
}

export interface HeaderLogoConfig {
  desktop: PositionalImageConfig;
  mobile: PositionalImageConfig;
}

export type ImageUrl = {
  source: 'git' | 'url' | 'local';
  url: string;
}

export type GitConfig = {
  user: string;
  repo: string;
  branch: string;
}

export type IndexedDBConfig = {
    db: string;
    store: string;
    max_recent: number;
}

export interface MasterConfig {
    use: boolean;
    source: 'git' | 'url' | 'local';
    url: string;
}

export interface AppConfig {
    theme: Theme;
    bannerImageUrl: ImageUrl;
    headerLogoUrl: ImageUrl;
    defaultLogoUrl: ImageUrl;
    initialQrOptions: QrCodeOptions;
    initialBorderOptions: BorderOptions;
    initialExperimentalOptions: ExperimentalOptions;
    initialLogoShape: LogoShape;
    initialLogoSizeRatio: number;
    initialLogoMargin: number;
    initialUrl: string;
    initialLogoOn: boolean;
    bannerConfig: BannerConfig;
    headerLogoConfig: HeaderLogoConfig;
    company: string;
    version: string;
    dev_version: number;
    git: GitConfig;
    debug_mode?: boolean;
    indexeddb: IndexedDBConfig;
    master_config: MasterConfig;
}

// A version of AppConfig where the ImageUrl objects have been resolved to strings
export interface ProcessedAppConfig extends Omit<AppConfig, 'bannerImageUrl' | 'headerLogoUrl' | 'defaultLogoUrl'> {
  bannerImageUrl: string;
  headerLogoUrl: string;
  defaultLogoUrl: string;
}

// Structure for saving user presets to IndexedDB
export interface UserPresetSettings {
    options: Partial<QrCodeOptions>;
    borderOptions: BorderOptions;
    experimentalOptions: ExperimentalOptions;
    logoShape: LogoShape;
    logoSizeRatio: number;
    logoMargin: number;
}
export interface UserPreset {
    name: string;
    settings: UserPresetSettings;
}

// Structure for saving recent URLs to IndexedDB
export interface RecentUrl {
    url: string;
    timestamp: number;
}