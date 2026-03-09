// modules/electron/crash-reporter.ts
import { ipc } from './ipc-wrapper';

export interface CrashReporterOptions {
    submitURL: string;
    productName?: string;
    companyName?: string;
    uploadToServer?: boolean;
    ignoreSystemCrashHandler?: boolean;
    rateLimit?: boolean;
    compress?: boolean;
    extra?: Record<string, string>;
}

export interface CrashReport {
    date: Date;
    id: string;
}

// Mock state
let isStarted = false;
let extraParams: Record<string, string> = {};
const mockReports: CrashReport[] = [];

export const crashReporter = {
  /**
   * Enables the crash reporter.
   */
  start: (options: CrashReporterOptions): void => {
    if (ipc.isElectron()) {
      ipc.send('crash-reporter:start', options);
    } else {
      isStarted = true;
      console.log('[CrashReporter Mock] Started with options:', options);
      // Initialize with any extra params passed in start
      if (options.extra) {
          extraParams = { ...extraParams, ...options.extra };
      }
    }
  },

  /**
   * Returns the date and ID of the last crash report.
   */
  getLastCrashReport: (): CrashReport | null => {
    if (ipc.isElectron()) {
      // In renderer, this would typically need an invoke or sync call if exposed
      // Mocking async behavior for safety in wrappers
      return null; // Simplified
    } else {
        return mockReports.length > 0 ? mockReports[mockReports.length - 1] : null;
    }
  },

  /**
   * Returns all uploaded crash reports.
   */
  getUploadedReports: (): CrashReport[] => {
      if (ipc.isElectron()) {
          // Mock return for renderer wrapper if not fully bridged
          return [];
      } else {
          return [...mockReports];
      }
  },

  /**
   * Adds an extra parameter to be sent with the crash report.
   */
  addExtraParameter: (key: string, value: string): void => {
      if (ipc.isElectron()) {
          ipc.send('crash-reporter:add-extra-parameter', { key, value });
      } else {
          extraParams[key] = value;
          console.log(`[CrashReporter Mock] Added extra param: ${key}=${value}`);
      }
  },

  /**
   * (Mock Helper) Manually trigger a "crash" to test reporting flow.
   */
  mockCrash: (): void => {
      if (isStarted) {
          console.error("[CrashReporter Mock] APP CRASHED!");
          mockReports.push({
              date: new Date(),
              id: `crash-${Math.random().toString(36).substr(2, 9)}`
          });
      } else {
          console.warn("[CrashReporter Mock] Crash ignored (reporter not started).");
      }
  }
};
