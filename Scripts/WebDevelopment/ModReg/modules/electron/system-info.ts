// modules/electron/system-info.ts
import { ipc } from './ipc-wrapper';

export interface DisplayInfo {
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

export interface BatteryStatus {
  charging: boolean;
  level: number; // 0 to 1
  chargingTime?: number;
  dischargingTime?: number;
}

export interface MemoryInfo {
    private: number;
    shared: number;
    total: number;
}

// Browser-side mock tracking for cursor
let mockCursorPos = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        mockCursorPos = { x: e.screenX, y: e.screenY };
    });
}

export const sysInfo = {
  /**
   * Gets the OS platform identifier.
   */
  getPlatform: async (): Promise<string> => {
    if (ipc.isElectron()) {
      return ipc.invoke('sys:get-platform');
    }
    return `Web Browser (${navigator.platform})`;
  },

  /**
   * Gets details about connected displays.
   */
  getDisplays: async (): Promise<DisplayInfo[]> => {
    if (ipc.isElectron()) {
      return ipc.invoke('sys:get-displays');
    } else {
      // Browser Mock: Return current window/screen info
      return [{
        id: 1,
        bounds: { x: 0, y: 0, width: window.screen.width, height: window.screen.height },
        scaleFactor: window.devicePixelRatio,
        isPrimary: true
      }];
    }
  },

  /**
   * Gets battery status if available.
   */
  getBatteryStatus: async (): Promise<BatteryStatus> => {
    if (ipc.isElectron()) {
      return ipc.invoke('sys:get-battery');
    } else {
      // Browser API
      if ((navigator as any).getBattery) {
        const battery = await (navigator as any).getBattery();
        return {
          charging: battery.charging,
          level: battery.level,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
      return { charging: true, level: 1 }; // Fallback for desktop/unsupported
    }
  },

  /**
   * Gets the global mouse cursor position.
   */
  getCursorPosition: async (): Promise<{x: number, y: number}> => {
      if (ipc.isElectron()) {
          return ipc.invoke('sys:get-cursor-position');
      } else {
          return mockCursorPos;
      }
  },

  /**
   * Checks if the OS is in Dark Mode.
   */
  isDarkMode: async (): Promise<boolean> => {
      if (ipc.isElectron()) {
          return ipc.invoke('sys:is-dark-mode');
      } else {
          return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
  },

  /**
   * Returns memory usage information for the current process (in KB).
   */
  getProcessMemoryInfo: async (): Promise<MemoryInfo> => {
      if (ipc.isElectron()) {
          return ipc.invoke('sys:get-memory-info');
      } else {
          // Browser Mock (performance.memory is non-standard but works in Chrome)
          const perf = (performance as any).memory;
          if (perf) {
              return {
                  private: Math.round(perf.usedJSHeapSize / 1024),
                  shared: 0,
                  total: Math.round(perf.totalJSHeapSize / 1024)
              };
          }
          return { private: 0, shared: 0, total: 0 };
      }
  },

  /**
   * Returns the application version.
   */
  getAppVersion: async (): Promise<string> => {
      if (ipc.isElectron()) {
          return ipc.invoke('sys:get-app-version');
      } else {
          return "1.0.0-web";
      }
  }
};
