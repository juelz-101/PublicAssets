// modules/electron/ipc-wrapper.ts

// Define the interface for the Electron API exposed via ContextBridge
interface IElectronAPI {
  ipcRenderer: {
    send(channel: string, ...args: any[]): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, listener: (event: any, ...args: any[]) => void): void;
    removeListener(channel: string, listener: (...args: any[]) => void): void;
  };
}

// Helper to safely access the global electron object
const getElectron = (): IElectronAPI | undefined => {
  return (window as any).electron;
};

// --- Mock Implementation for Browser Environment ---
const mockListeners: Record<string, ((event: any, ...args: any[]) => void)[]> = {};

const mockIpc = {
  send: (channel: string, ...args: any[]) => {
    console.log(`[IPC Mock] Sending to '${channel}':`, args);
  },
  invoke: async (channel: string, ...args: any[]) => {
    console.log(`[IPC Mock] Invoking '${channel}':`, args);
    // Simulate a delay and a response for common patterns
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Mock response for ${channel}`;
  },
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
    console.log(`[IPC Mock] Added listener for '${channel}'`);
    if (!mockListeners[channel]) mockListeners[channel] = [];
    mockListeners[channel].push(listener);
  },
  removeListener: (channel: string, listener: (...args: any[]) => void) => {
    console.log(`[IPC Mock] Removed listener for '${channel}'`);
    if (mockListeners[channel]) {
      mockListeners[channel] = mockListeners[channel].filter(l => l !== listener);
    }
  }
};

/**
 * A wrapper for Electron's ipcRenderer. 
 * If running in a browser without Electron, it falls back to a mock implementation that logs to the console.
 */
export const ipc = {
  /**
   * Sends an asynchronous message to the main process.
   * @param channel The channel name.
   * @param args Data to send.
   */
  send: (channel: string, ...args: any[]): void => {
    const electron = getElectron();
    if (electron) {
      electron.ipcRenderer.send(channel, ...args);
    } else {
      mockIpc.send(channel, ...args);
    }
  },

  /**
   * Sends a request to the main process and waits for a response.
   * @param channel The channel name.
   * @param args Data to send.
   * @returns A promise resolving to the response.
   */
  invoke: <T = any>(channel: string, ...args: any[]): Promise<T> => {
    const electron = getElectron();
    if (electron) {
      return electron.ipcRenderer.invoke(channel, ...args);
    } else {
      return mockIpc.invoke(channel, ...args) as Promise<T>;
    }
  },

  /**
   * Listens for messages from the main process.
   * @param channel The channel name.
   * @param listener The callback function.
   */
  on: (channel: string, listener: (event: any, ...args: any[]) => void): void => {
    const electron = getElectron();
    if (electron) {
      electron.ipcRenderer.on(channel, listener);
    } else {
      mockIpc.on(channel, listener);
    }
  },

  /**
   * Removes a listener.
   * @param channel The channel name.
   * @param listener The callback function to remove.
   */
  off: (channel: string, listener: (event: any, ...args: any[]) => void): void => {
    const electron = getElectron();
    if (electron) {
      electron.ipcRenderer.removeListener(channel, listener);
    } else {
      mockIpc.removeListener(channel, listener);
    }
  },
  
  /**
   * Checks if the app is currently running in an Electron environment.
   */
  isElectron: (): boolean => {
      return !!getElectron();
  }
};
