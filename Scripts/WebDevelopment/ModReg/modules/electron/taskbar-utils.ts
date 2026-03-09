// modules/electron/taskbar-utils.ts
import { ipc } from './ipc-wrapper';

export const taskbar = {
  /**
   * Sets the progress bar value on the taskbar icon.
   * @param value Progress value between 0 and 1. Set to -1 to remove.
   */
  setProgressBar: (value: number): void => {
    if (ipc.isElectron()) {
      ipc.send('taskbar:set-progress', value);
    } else {
      console.log(`[Taskbar Mock] Set progress: ${value}`);
    }
  },

  /**
   * Sets the badge count on the dock icon (macOS/Linux).
   * @param count The count to display. 0 clears it.
   */
  setBadgeCount: (count: number): void => {
    if (ipc.isElectron()) {
      ipc.send('taskbar:set-badge', count);
    } else {
      console.log(`[Taskbar Mock] Set badge count: ${count}`);
      if (count > 0) {
          document.title = `(${count}) Electron Adapters`;
      } else {
          document.title = 'Electron Adapters';
      }
    }
  },

  /**
   * Flashes the window title bar or taskbar button.
   * @param flag Whether to start (true) or stop (false) flashing.
   */
  flashFrame: (flag: boolean): void => {
    if (ipc.isElectron()) {
      ipc.send('taskbar:flash-frame', flag);
    } else {
      console.log(`[Taskbar Mock] Flash frame: ${flag}`);
      if (flag) {
          alert("Attn: The app is requesting attention (Flash Frame)!");
      }
    }
  },

  /**
   * Sets a small overlay icon on the taskbar button (Windows only).
   * @param dataUrl The icon image as a data URL. Null to clear.
   * @param text Accessibility text for the overlay.
   */
  setOverlayIcon: (dataUrl: string | null, text: string = ''): void => {
      if (ipc.isElectron()) {
          ipc.send('taskbar:set-overlay-icon', { dataUrl, text });
      } else {
          console.log(`[Taskbar Mock] Set Overlay Icon: ${dataUrl ? 'Image Data' : 'Cleared'} (${text})`);
      }
  },

  /**
   * Sets the toolip text displayed when hovering over the taskbar thumbnail (Windows only).
   */
  setThumbnailTooltip: (tooltip: string): void => {
      if (ipc.isElectron()) {
          ipc.send('taskbar:set-thumbnail-tooltip', tooltip);
      } else {
          console.log(`[Taskbar Mock] Set Thumbnail Tooltip: "${tooltip}"`);
      }
  },

  /**
   * Adds a file path to the Recent Documents list in the taskbar jump list.
   */
  addRecentDocument: (path: string): void => {
      if (ipc.isElectron()) {
          ipc.send('taskbar:add-recent-document', path);
      } else {
          console.log(`[Taskbar Mock] Added to Recent Docs: ${path}`);
      }
  },

  /**
   * Clears the Recent Documents list.
   */
  clearRecentDocuments: (): void => {
      if (ipc.isElectron()) {
          ipc.send('taskbar:clear-recent-documents');
      } else {
          console.log(`[Taskbar Mock] Cleared Recent Documents`);
      }
  }
};
