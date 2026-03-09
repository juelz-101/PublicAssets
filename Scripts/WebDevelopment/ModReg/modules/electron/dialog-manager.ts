// modules/electron/dialog-manager.ts
import { ipc } from './ipc-wrapper';

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
}

export interface OpenDialogReturnValue {
  canceled: boolean;
  filePaths: string[];
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: { name: string; extensions: string[] }[];
}

export interface SaveDialogReturnValue {
  canceled: boolean;
  filePath?: string;
}

export interface MessageBoxOptions {
  message: string;
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];
  defaultId?: number;
  title?: string;
  detail?: string;
}

export interface MessageBoxReturnValue {
  response: number; // The index of the clicked button
  checkboxChecked?: boolean;
}

export const dialog = {
  /**
   * Opens a native file selection dialog.
   */
  showOpenDialog: async (options: OpenDialogOptions = {}): Promise<OpenDialogReturnValue> => {
    if (ipc.isElectron()) {
      return ipc.invoke('dialog:show-open', options);
    } else {
      // Browser Mock: Create a hidden file input to let user select a file
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        
        if (options.properties?.includes('multiSelections')) {
          input.multiple = true;
        }
        if (options.properties?.includes('openDirectory')) {
          input.setAttribute('webkitdirectory', 'true');
          input.setAttribute('directory', 'true');
        }
        
        // Handle cancellation (this is tricky in browsers, we use a timeout hack or focus check)
        const focusHandler = () => {
            window.removeEventListener('focus', focusHandler);
            setTimeout(() => {
                if (!input.files || input.files.length === 0) {
                    resolve({ canceled: true, filePaths: [] });
                }
            }, 500);
        };
        window.addEventListener('focus', focusHandler);

        input.onchange = () => {
          window.removeEventListener('focus', focusHandler);
          if (input.files && input.files.length > 0) {
            // In browser, we don't get real paths, so we mock them
            const paths = Array.from(input.files).map(f => `/mock/path/to/${f.name}`);
            resolve({ canceled: false, filePaths: paths });
          } else {
            resolve({ canceled: true, filePaths: [] });
          }
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      });
    }
  },

  /**
   * Opens a native file save dialog.
   */
  showSaveDialog: async (options: SaveDialogOptions = {}): Promise<SaveDialogReturnValue> => {
    if (ipc.isElectron()) {
      return ipc.invoke('dialog:show-save', options);
    } else {
      // Browser Mock: Use prompt to ask for filename
      const filename = window.prompt(options.title || 'Save File', options.defaultPath || 'untitled.txt');
      if (filename) {
        return { canceled: false, filePath: `/mock/path/to/${filename}` };
      }
      return { canceled: true };
    }
  },

  /**
   * Shows a native message box.
   */
  showMessageBox: async (options: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
    if (ipc.isElectron()) {
      return ipc.invoke('dialog:show-message-box', options);
    } else {
      // Browser Mock: Use confirm for Yes/No, alert for single button
      const buttons = options.buttons || ['OK'];
      const message = `${options.title ? options.title + '\n\n' : ''}${options.message}${options.detail ? '\n\n' + options.detail : ''}`;
      
      if (buttons.length > 1) {
        // Simple mapping for standard OK/Cancel or Yes/No scenarios
        const result = window.confirm(message);
        // Assuming first button is positive (0) and second is negative (1) for this mock
        return { response: result ? 0 : 1 };
      } else {
        window.alert(message);
        return { response: 0 };
      }
    }
  },

  /**
   * Displays a modal dialog that shows an error message.
   * This API can be called safely before the ready event the app module emits, it is usually used to report errors in startup stage.
   */
  showErrorBox: (title: string, content: string): void => {
    if (ipc.isElectron()) {
        ipc.send('dialog:show-error-box', { title, content });
    } else {
        window.alert(`ERROR: ${title}\n\n${content}`);
    }
  },

  /**
   * A convenience method to show a confirmation dialog.
   * Returns true if the user clicked the first button (typically 'Yes' or 'OK').
   */
  confirm: async (message: string, detail?: string): Promise<boolean> => {
      const result = await dialog.showMessageBox({
          type: 'question',
          buttons: ['Yes', 'No'],
          defaultId: 0,
          title: 'Confirm',
          message,
          detail
      });
      return result.response === 0;
  },

  /**
   * Displays the standard 'About' panel for the application.
   */
  showAboutPanel: (): void => {
      if (ipc.isElectron()) {
          ipc.send('dialog:show-about-panel');
      } else {
          // Mock
          window.alert("About This App\n\nVersion: 1.0.0 (Web Mock)\nCreated by: ZIKYinc");
      }
  }
};
