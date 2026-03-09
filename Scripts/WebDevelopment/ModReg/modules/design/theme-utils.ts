import type { Theme } from '../../types';
import { downloadFile, readFileAsText } from '../file-system/file-utils';

/**
 * Applies a theme object to the document root by setting CSS variables.
 * @param theme The theme object to apply.
 * @param mode The current color mode ('light' or 'dark').
 */
export const applyTheme = (theme: Theme, mode: 'light' | 'dark'): void => {
    const root = document.documentElement;
    
    // Set color scheme for browser UI theming (scrollbars, etc.)
    root.style.colorScheme = mode;
    
    // Apply all color variables
    for (const [key, value] of Object.entries(theme.colors)) {
        if (value) {
           if (typeof value === 'string') {
               root.style.setProperty(key, value);
           } else {
               root.style.setProperty(key, value[mode]);
           }
        }
    }
};

/**
 * Exports a theme object to a JSON file and triggers a browser download.
 * @param theme The theme object to export.
 */
export const exportTheme = (theme: Theme): void => {
    const themeString = JSON.stringify(theme, null, 2);
    const fileName = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    downloadFile(themeString, fileName, 'application/json');
};

/**
 * Imports a theme from a JSON file, validates its structure, and returns it.
 * @param file The JSON file to import.
 * @returns A promise that resolves with the validated Theme object.
 */
export const importTheme = (file: File): Promise<Theme> => {
    return new Promise(async (resolve, reject) => {
        if (!file.type.includes('json')) {
            return reject(new Error('Invalid file type. Please select a JSON file.'));
        }
        
        try {
            const fileContent = await readFileAsText(file);
            const parsed = JSON.parse(fileContent);

            // Basic validation
            if (!parsed.name || typeof parsed.name !== 'string') {
                return reject(new Error('Imported theme is missing a valid "name".'));
            }
            // Support old format by deleting old property
            if (parsed.colorScheme) {
                delete parsed.colorScheme;
            }
            if (!parsed.colors || typeof parsed.colors !== 'object') {
                 return reject(new Error('Imported theme is missing a "colors" object.'));
            }
            
             // Validate color values
            for (const [key, colorValue] of Object.entries(parsed.colors)) {
                if (typeof colorValue !== 'string' && (typeof colorValue !== 'object' || !('light' in colorValue) || !('dark' in colorValue))) {
                     return reject(new Error(`Invalid color format for key "${key}". Colors must be a string or an object with "light" and "dark" properties.`));
                }
            }
            
            resolve(parsed as Theme);

        } catch (error) {
            reject(new Error('Failed to parse or validate the theme file.'));
        }
    });
};
