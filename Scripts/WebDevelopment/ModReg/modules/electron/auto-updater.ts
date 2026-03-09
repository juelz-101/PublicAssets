// modules/electron/auto-updater.ts
import { ipc } from './ipc-wrapper';

export type AutoUpdaterEvent = 
  | 'checking-for-update' 
  | 'update-available' 
  | 'update-not-available' 
  | 'download-progress' 
  | 'update-downloaded' 
  | 'error';

// Mock state
const listeners: Record<string, Function[]> = {};

const emitMockEvent = (event: AutoUpdaterEvent, ...args: any[]) => {
    if (listeners[event]) {
        listeners[event].forEach(fn => fn(...args));
    }
};

const simulateUpdateProcess = () => {
    emitMockEvent('checking-for-update');
    
    setTimeout(() => {
        // Random chance of update available for demo
        const isUpdateAvailable = Math.random() > 0.3;
        
        if (isUpdateAvailable) {
            emitMockEvent('update-available', { version: '1.1.0', releaseDate: new Date().toISOString() });
            
            // Simulate download progress
            let progress = 0;
            const downloadInterval = setInterval(() => {
                progress += 10;
                emitMockEvent('download-progress', { percent: progress });
                
                if (progress >= 100) {
                    clearInterval(downloadInterval);
                    emitMockEvent('update-downloaded', { version: '1.1.0' });
                }
            }, 500);
        } else {
            emitMockEvent('update-not-available');
        }
    }, 1500);
};

export const autoUpdater = {
  /**
   * Asks the server whether there is an update.
   */
  checkForUpdates: (): void => {
    if (ipc.isElectron()) {
      ipc.send('auto-updater:check-for-updates');
    } else {
      console.log('[AutoUpdater Mock] Checking for updates...');
      simulateUpdateProcess();
    }
  },

  /**
   * Restarts the app and installs the update after it has been downloaded.
   */
  quitAndInstall: (): void => {
    if (ipc.isElectron()) {
      ipc.send('auto-updater:quit-and-install');
    } else {
      console.log('[AutoUpdater Mock] Quitting and installing...');
      alert('[Mock] App is restarting to install updates...');
      window.location.reload();
    }
  },

  /**
   * Adds a listener for update events.
   */
  on: (event: AutoUpdaterEvent, listener: (arg?: any) => void): void => {
    if (ipc.isElectron()) {
      ipc.on(`auto-updater:${event}`, (_e, args) => listener(args));
    } else {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    }
  },

  /**
   * Removes a listener.
   */
  off: (event: AutoUpdaterEvent, listener: (arg?: any) => void): void => {
    if (ipc.isElectron()) {
      // Note: This naive removal works if the wrapper supports reference equality on bridged functions, 
      // otherwise robust removal in Electron often involves UUIDs or clearing all.
      // For this wrapper level, we'll try standard removal.
      ipc.off(`auto-updater:${event}`, listener);
    } else {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(l => l !== listener);
      }
    }
  }
};
