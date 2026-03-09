import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { localStore } from '../modules/web-apis/storage-utils';
import type { Theme } from '../types';
import { applyTheme } from '../modules/design/theme-utils';
import { themePresets } from '../modules/design/theme-presets';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme = themePresets[0].themes[0]; // Default to first theme ('Default')

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStore.get<Theme>('theme') as Theme) || defaultTheme;
  });

  const [mode, setMode] = useState<ThemeMode>(() => {
      return (localStore.get<ThemeMode>('themeMode') as ThemeMode) || 'dark';
  });

  useEffect(() => {
    applyTheme(theme, mode);
    localStore.set('theme', theme);
    localStore.set('themeMode', mode);
  }, [theme, mode]);

  const value = useMemo(() => ({ theme, setTheme, mode, setMode }), [theme, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
