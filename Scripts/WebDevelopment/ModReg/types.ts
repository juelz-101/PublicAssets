

export type ColorValue = string | { light: string; dark: string };

export interface ModuleFunction {
  name: string;
  description: string;
  params: string[];
  returns: string;
}

export interface AIPrompt {
  title: string;
  description: string;
  content: string;
}

export interface Module {
  name: string;
  description: string;
  path: string;
  examplePath: string;
  functions: ModuleFunction[];
  dataFiles?: string[];
  functionalDataPath?: string; // Path to crucial backend data
  templateData?: any; // Example/Template data structure
  docPath?: string; // Path to markdown documentation
  aiRulesPath?: string; // Path to AI instructions/rules
  prompts?: AIPrompt[];
  version?: string; // Semantic version, defaults to "1.0"
}

export interface SystemParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select';
  description: string;
  default: any;
  options?: string[]; // For 'select' type
}

export interface System {
  name: string;
  description: string;
  path: string; // Main system component/entry point
  examplePath: string;
  docPath?: string;
  aiRulesPath?: string;
  prompts?: AIPrompt[];
  version?: string;
  functionalDataPath?: string;
  templateData?: any;
  dependencies: string[]; // Array of module names
  parameters: SystemParameter[];
}

export interface SystemCategory {
  category: string;
  description: string;
  systems: System[];
}

export interface ModuleCategory {
  category: string;
  description: string;
  modules: Module[];
}

// --- Theme Types ---

export type CoreColors = {
  '--color-background-base': ColorValue;
  '--color-background-secondary': ColorValue;
  '--color-background-tertiary': ColorValue;
  '--color-text-primary': ColorValue;
  '--color-text-secondary': ColorValue;
  '--color-accent-primary': ColorValue;
  '--color-accent-secondary': ColorValue;
  '--color-accent-tertiary': ColorValue;
  '--color-accent-error': ColorValue;
  '--color-glow': ColorValue;
  '--color-grid': ColorValue;
};

export type ExtendedColors = {
    [key: `--color-${string}`]: ColorValue | undefined;
}

export type ThemeColors = CoreColors & ExtendedColors;


export interface Theme {
  name: string;
  colors: ThemeColors;
}

export interface ThemePresetCategory {
    category: string;
    themes: Theme[];
}