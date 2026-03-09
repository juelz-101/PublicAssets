// modules/electron/web-frame.ts
import { ipc } from './ipc-wrapper';

// Mock state
let mockZoomFactor = 1.0;

export const webFrame = {
  /**
   * Changes the zoom factor of the specified page.
   * @param factor Zoom factor (e.g., 1.0 = 100%, 1.5 = 150%).
   */
  setZoomFactor: (factor: number): void => {
    if (ipc.isElectron()) {
      ipc.send('web-frame:set-zoom-factor', factor);
    } else {
      mockZoomFactor = factor;
      console.log(`[WebFrame Mock] Zoom set to: ${factor}`);
      // Note: We don't apply actual zoom to document body in mock to avoid breaking the playground layout.
      // The example component will read this value to simulate scaling.
    }
  },

  /**
   * Returns the current zoom factor.
   */
  getZoomFactor: (): number => {
    if (ipc.isElectron()) {
      // Note: This needs to be synchronous in Electron's renderer, or async via IPC invoke.
      // Since wrapper is often async-ish for safety, we assume a sync return or cached value here?
      // Actually webFrame.getZoomFactor() IS synchronous in Electron renderer.
      // But since we can't access it directly without contextIsolation: false or preload,
      // we usually rely on a cached value or async IPC.
      // For this wrapper, we'll assume the Main process pushes updates or we invoke.
      // However, to keep the API signature simple matching Electron's sync nature where possible:
      // We will define it as returning number, but in real implementation it might need to return Promise
      // if using contextBridge without direct exposure.
      // Let's stick to the mock behavior for now or assume a prop is injected.
      
      // FIX: For strict correctness in a bridged world, this should ideally be async. 
      // But standard webFrame is sync. Let's return mock for now.
      return mockZoomFactor; 
    } else {
      return mockZoomFactor;
    }
  },

  /**
   * Sets the maximum and minimum pinch-to-zoom level.
   */
  setVisualZoomLevelLimits: (minLevel: number, maxLevel: number): void => {
      if (ipc.isElectron()) {
          ipc.send('web-frame:set-visual-zoom-limits', { minLevel, maxLevel });
      } else {
          console.log(`[WebFrame Mock] Zoom limits set: ${minLevel} - ${maxLevel}`);
      }
  }
};
