// modules/electron/global-shortcut.ts
import { ipc } from './ipc-wrapper';

const callbackMap: Record<string, () => void> = {};

// Listen for the shortcut triggered event from Main process
if (ipc.isElectron()) {
    ipc.on('global-shortcut:triggered', (_event: any, accelerator: string) => {
        if (callbackMap[accelerator]) {
            callbackMap[accelerator]();
        }
    });
} else {
    // Browser Mock Implementation
    // We can't truly register global shortcuts, but we can listen to the window
    window.addEventListener('keydown', (e) => {
        const modifiers: string[] = [];
        if (e.metaKey || e.ctrlKey) modifiers.push('CommandOrControl');
        else if (e.ctrlKey) modifiers.push('Ctrl');
        else if (e.metaKey) modifiers.push('Command');
        
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');

        let key = e.key.toUpperCase();
        if (key === 'CONTROL' || key === 'SHIFT' || key === 'ALT' || key === 'META') return;
        
        // Simple mapping for demonstration
        const accelerator = [...modifiers, key].join('+');
        
        // Check exact match
        if (callbackMap[accelerator]) {
            e.preventDefault();
            console.log(`[Global Shortcut Mock] Triggered: ${accelerator}`);
            callbackMap[accelerator]();
        }
    });
}

export const globalShortcut = {
  /**
   * Registers a global shortcut.
   * @param accelerator The shortcut string (e.g., "CommandOrControl+X").
   * @param callback The function to call when the shortcut is triggered.
   * @returns True if registration was successful (simulated in browser).
   */
  register: (accelerator: string, callback: () => void): boolean => {
    if (callbackMap[accelerator]) {
        console.warn(`[Global Shortcut] Accelerator "${accelerator}" is already registered.`);
        return false;
    }

    callbackMap[accelerator] = callback;

    if (ipc.isElectron()) {
      // Send registration request to main process
      // Note: ipc.send is void, actual success check would require invoke in a robust implementation
      ipc.send('global-shortcut:register', accelerator);
      return true; 
    } else {
      console.log(`[Global Shortcut Mock] Registered: ${accelerator}`);
      return true;
    }
  },

  /**
   * Unregisters a global shortcut.
   * @param accelerator The shortcut string.
   */
  unregister: (accelerator: string): void => {
    delete callbackMap[accelerator];
    if (ipc.isElectron()) {
      ipc.send('global-shortcut:unregister', accelerator);
    } else {
      console.log(`[Global Shortcut Mock] Unregistered: ${accelerator}`);
    }
  },

  /**
   * Unregisters all global shortcuts.
   */
  unregisterAll: (): void => {
    for (const accelerator in callbackMap) {
        delete callbackMap[accelerator];
    }
    if (ipc.isElectron()) {
      ipc.send('global-shortcut:unregister-all');
    } else {
      console.log('[Global Shortcut Mock] Unregistered all shortcuts.');
    }
  },

  /**
   * Checks if a specific accelerator is registered.
   */
  isRegistered: (accelerator: string): boolean => {
      return !!callbackMap[accelerator];
  }
};
