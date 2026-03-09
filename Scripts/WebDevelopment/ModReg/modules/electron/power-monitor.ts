// modules/electron/power-monitor.ts
import { ipc } from './ipc-wrapper';

export type PowerEvent = 'suspend' | 'resume' | 'on-ac' | 'on-battery' | 'shutdown' | 'lock-screen' | 'unlock-screen';

const listeners: Record<string, (() => void)[]> = {};

// Setup generic listener for all power events from main
if (ipc.isElectron()) {
    ipc.on('power-monitor:event', (_event: any, type: PowerEvent) => {
        if (listeners[type]) {
            listeners[type].forEach(fn => fn());
        }
    });
}

export const powerMonitor = {
  /**
   * Adds a listener for a power event.
   * @param event The event name.
   * @param listener The callback function.
   */
  on: (event: PowerEvent, listener: () => void): void => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(listener);
    
    if (ipc.isElectron()) {
        // Inform main process we want to listen (optimization)
        ipc.send('power-monitor:listen', event);
    } else {
        console.log(`[Power Monitor Mock] Listening for '${event}'`);
    }
  },

  /**
   * Removes a listener for a power event.
   */
  off: (event: PowerEvent, listener: () => void): void => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(l => l !== listener);
  },

  /**
   * (Mock Helper) Manually triggers an event for testing in browser.
   * Not part of the official Electron API.
   */
  mockTrigger: (event: PowerEvent): void => {
      console.log(`[Power Monitor Mock] Triggering '${event}'`);
      if (listeners[event]) {
          listeners[event].forEach(fn => fn());
      }
  }
};
