// modules/electron/clipboard-extended.ts
import { ipc } from './ipc-wrapper';

export const clipboard = {
  /**
   * Writes text to the clipboard.
   */
  writeText: async (text: string): Promise<void> => {
    if (ipc.isElectron()) {
      await ipc.invoke('clipboard:write-text', text);
    } else {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        console.warn('Clipboard API not available');
      }
    }
  },

  /**
   * Reads text from the clipboard.
   */
  readText: async (): Promise<string> => {
    if (ipc.isElectron()) {
      return ipc.invoke('clipboard:read-text');
    } else {
      if (navigator.clipboard) {
        return navigator.clipboard.readText();
      }
      return '';
    }
  },

  /**
   * Writes an image (Data URL) to the clipboard.
   */
  writeImage: async (dataUrl: string): Promise<void> => {
    if (ipc.isElectron()) {
      await ipc.invoke('clipboard:write-image', dataUrl);
    } else {
      // Browser implementation
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API write not supported');
      }
      
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
      } catch (err) {
        console.error('Failed to write image to clipboard in browser:', err);
        throw err;
      }
    }
  },

  /**
   * Reads an image from the clipboard.
   * Returns a Data URL string or null if no image is present.
   */
  readImage: async (): Promise<string | null> => {
    if (ipc.isElectron()) {
      // Electron main process should return a Data URL string
      return ipc.invoke('clipboard:read-image');
    } else {
      // Browser implementation
      if (!navigator.clipboard || !navigator.clipboard.read) {
        console.warn('Clipboard API read not supported');
        return null;
      }

      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          // Look for image types
          const type = item.types.find(t => t.startsWith('image/'));
          if (type) {
            const blob = await item.getType(type);
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        }
      } catch (err) {
        console.error('Failed to read image from clipboard:', err);
      }
      return null;
    }
  },

  /**
   * Writes HTML content to the clipboard.
   * Useful for pasting into rich text editors.
   */
  writeHTML: async (html: string, plainText?: string): Promise<void> => {
      if (ipc.isElectron()) {
          await ipc.invoke('clipboard:write-html', { html, plainText });
      } else {
          // Browser implementation using ClipboardItem
          if (!navigator.clipboard || !navigator.clipboard.write) {
              console.warn('Clipboard API write not supported');
              return;
          }
          const blobHtml = new Blob([html], { type: 'text/html' });
          const blobText = new Blob([plainText || html], { type: 'text/plain' });
          const data = [new ClipboardItem({ 
              'text/html': blobHtml,
              'text/plain': blobText 
          })];
          await navigator.clipboard.write(data);
      }
  },

  /**
   * Reads HTML content from the clipboard.
   */
  readHTML: async (): Promise<string> => {
      if (ipc.isElectron()) {
          return ipc.invoke('clipboard:read-html');
      } else {
          if (!navigator.clipboard || !navigator.clipboard.read) {
              return '';
          }
          try {
              const items = await navigator.clipboard.read();
              for (const item of items) {
                  if (item.types.includes('text/html')) {
                      const blob = await item.getType('text/html');
                      return await blob.text();
                  }
              }
          } catch (e) {
              console.warn("Failed to read HTML from clipboard in browser:", e);
          }
          return '';
      }
  },

  /**
   * Clears all content from the clipboard.
   */
  clear: async (): Promise<void> => {
      if (ipc.isElectron()) {
          await ipc.invoke('clipboard:clear');
      } else {
          // Browser: Write empty string? Browser API doesn't have explicit clear.
          // Writing empty text is the closest equivalent.
          if (navigator.clipboard) {
              await navigator.clipboard.writeText('');
          }
      }
  },

  /**
   * Returns a list of formats currently available in the clipboard.
   */
  availableFormats: async (): Promise<string[]> => {
      if (ipc.isElectron()) {
          return ipc.invoke('clipboard:available-formats');
      } else {
          if (!navigator.clipboard || !navigator.clipboard.read) {
              return [];
          }
          try {
              const items = await navigator.clipboard.read();
              if (items.length > 0) {
                  return [...items[0].types];
              }
          } catch (e) {
              // Permission denied or empty
          }
          return [];
      }
  }
};
