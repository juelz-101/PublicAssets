// modules/electron/window-shell-utils.ts
import { ipc } from './ipc-wrapper';

/**
 * Utilities for controlling the application window (minimize, maximize, close).
 * These functions rely on the Main process listening for specific channels.
 * Standard channels expected: 'window:minimize', 'window:maximize', 'window:close'.
 */
export const windowControls = {
  minimize: (): void => {
    ipc.send('window:minimize');
  },
  maximize: (): void => {
    ipc.send('window:maximize');
  },
  close: (): void => {
    ipc.send('window:close');
  }
};

/**
 * Utilities for shell operations like opening external links.
 */
export const shellUtils = {
  /**
   * Opens the given URL in the user's default browser.
   * In a real Electron app, this uses `shell.openExternal`.
   * In the browser, it uses `window.open`.
   */
  openExternal: async (url: string): Promise<void> => {
    if (ipc.isElectron()) {
      await ipc.invoke('shell:open-external', url);
    } else {
      console.log(`[Shell Mock] Opening external URL: ${url}`);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },

  /**
   * Show the given file in a file manager.
   * In browser, this just logs.
   */
  showItemInFolder: (fullPath: string): void => {
    if (ipc.isElectron()) {
      ipc.send('shell:show-item-in-folder', fullPath);
    } else {
      console.log(`[Shell Mock] Showing item in folder: ${fullPath}`);
      alert(`[Mock] Opened folder for: ${fullPath}`);
    }
  }
};
