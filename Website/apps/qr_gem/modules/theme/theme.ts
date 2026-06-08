import type { Theme } from '../../types';

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const themeToCssMap: Record<keyof Theme, string> = {
    backgroundColor: '--theme-bg',
    textColor: '--theme-text',
    primaryColor: '--theme-primary',
    secondaryColor: '--theme-secondary',
    accentColor: '--theme-accent',
    cardBackgroundColor: '--theme-card-bg',
    inputBackgroundColor: '--theme-input-bg',
    borderColor: '--theme-border-color',
  };

  for (const [key, value] of Object.entries(theme)) {
    const cssVar = themeToCssMap[key as keyof Theme];
    if (cssVar && value) {
      root.style.setProperty(cssVar, value);
    }
  }
}
