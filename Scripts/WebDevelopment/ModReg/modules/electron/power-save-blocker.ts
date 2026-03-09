// modules/electron/power-save-blocker.ts
import { ipc } from './ipc-wrapper';

export type PowerSaveBlockerType = 'prevent-app-suspension' | 'prevent-display-sleep';

// Mock state
const activeBlockers: Set<number> = new Set();
let nextId = 1;

export const powerSaveBlocker = {
  /**
   * Starts blocking the system from entering low-power mode.
   * @param type The type of blocking behavior.
   * @returns The blocker ID.
   */
  start: async (type: PowerSaveBlockerType): Promise<number> => {
    if (ipc.isElectron()) {
      return ipc.invoke('power-save-blocker:start', type);
    } else {
      const id = nextId++;
      activeBlockers.add(id);
      console.log(`[PowerSaveBlocker Mock] Started blocker ID ${id} (${type})`);
      return id;
    }
  },

  /**
   * Stops the specified power save blocker.
   * @param id The blocker ID returned by start.
   */
  stop: async (id: number): Promise<void> => {
    if (ipc.isElectron()) {
      await ipc.invoke('power-save-blocker:stop', id);
    } else {
      if (activeBlockers.has(id)) {
        activeBlockers.delete(id);
        console.log(`[PowerSaveBlocker Mock] Stopped blocker ID ${id}`);
      }
    }
  },

  /**
   * Checks if a power save blocker is active.
   * @param id The blocker ID.
   */
  isStarted: async (id: number): Promise<boolean> => {
    if (ipc.isElectron()) {
      return ipc.invoke('power-save-blocker:is-started', id);
    } else {
      return activeBlockers.has(id);
    }
  }
};
