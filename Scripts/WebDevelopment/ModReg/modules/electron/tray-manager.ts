// modules/electron/tray-manager.ts
import { ipc } from './ipc-wrapper';
import { MenuItem, menu } from './menu-manager';

// Browser mock state
let mockTrayElement: HTMLElement | null = null;

export const tray = {
  /**
   * Creates a system tray icon.
   * @param iconPath Path to the icon file.
   * @param toolTip Hover text for the tray icon.
   */
  create: (iconPath: string, toolTip: string = 'App Tray'): void => {
    if (ipc.isElectron()) {
      ipc.send('tray:create', { iconPath, toolTip });
    } else {
      // Browser Mock
      if (mockTrayElement) return;

      mockTrayElement = document.createElement('div');
      mockTrayElement.id = 'mock-tray-icon';
      mockTrayElement.style.position = 'fixed';
      mockTrayElement.style.bottom = '10px';
      mockTrayElement.style.right = '10px';
      mockTrayElement.style.width = '32px';
      mockTrayElement.style.height = '32px';
      mockTrayElement.style.background = `url(${iconPath}) no-repeat center/cover, #333`;
      mockTrayElement.style.border = '2px solid #08f7fe';
      mockTrayElement.style.borderRadius = '50%';
      mockTrayElement.style.display = 'flex';
      mockTrayElement.style.alignItems = 'center';
      mockTrayElement.style.justifyContent = 'center';
      mockTrayElement.style.color = '#08f7fe';
      mockTrayElement.style.cursor = 'pointer';
      mockTrayElement.style.zIndex = '9999';
      mockTrayElement.title = toolTip;
      
      // Fallback text if image fails or path is dummy
      if (!iconPath || iconPath.includes('path/to')) {
          mockTrayElement.innerText = 'T';
      }

      document.body.appendChild(mockTrayElement);
      console.log('[Tray Mock] Created tray icon.');
    }
  },

  /**
   * Changes the tray icon image.
   * @param iconPath Path to the new icon image.
   */
  setImage: (iconPath: string): void => {
      if (ipc.isElectron()) {
          ipc.send('tray:set-image', iconPath);
      } else {
          if (mockTrayElement) {
              mockTrayElement.style.background = `url(${iconPath}) no-repeat center/cover, #333`;
              // Clear text if we set a valid image
              if (!iconPath.includes('path/to')) mockTrayElement.innerText = '';
              console.log(`[Tray Mock] Image updated to ${iconPath}`);
          }
      }
  },

  /**
   * Sets the context menu for the tray icon.
   * @param template The menu template.
   */
  setContextMenu: (template: MenuItem[]): void => {
    if (ipc.isElectron()) {
        console.warn("Tray context menu in Electron requires Main process setup to route clicks back to Renderer.");
        ipc.send('tray:set-context-menu', template);
    } else {
        // Browser Mock: Attach click listener to the mock element
        if (mockTrayElement) {
            mockTrayElement.onclick = (e) => {
                const rect = mockTrayElement!.getBoundingClientRect();
                // Show menu above the icon
                menu.showContextMenu(template, { x: rect.left, y: rect.top - 150 }); 
            };
        }
    }
  },

  /**
   * Updates the tooltip.
   */
  setToolTip: (toolTip: string): void => {
    if (ipc.isElectron()) {
      ipc.send('tray:set-tooltip', toolTip);
    } else {
      if (mockTrayElement) {
        mockTrayElement.title = toolTip;
      }
    }
  },

  /**
   * Sets the title displayed next to the tray icon in the status bar (macOS only).
   */
  setTitle: (title: string): void => {
      if (ipc.isElectron()) {
          ipc.send('tray:set-title', title);
      } else {
          console.log(`[Tray Mock] Title set to: "${title}" (MacOS only feature)`);
      }
  },

  /**
   * Displays a system tray balloon notification (Windows).
   */
  displayBalloon: (options: { title: string, content: string, iconType?: 'none'|'info'|'warning'|'error' }): void => {
      if (ipc.isElectron()) {
          ipc.send('tray:display-balloon', options);
      } else {
          // Mock with a temporary toast
          const toast = document.createElement('div');
          toast.style.position = 'fixed';
          toast.style.bottom = '50px';
          toast.style.right = '10px';
          toast.style.padding = '12px';
          toast.style.background = '#222';
          toast.style.color = '#fff';
          toast.style.border = '1px solid #08f7fe';
          toast.style.borderRadius = '8px';
          toast.style.zIndex = '10000';
          toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
          toast.innerHTML = `<strong>${options.title}</strong><br/>${options.content}`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
          console.log('[Tray Mock] Balloon displayed:', options);
      }
  },

  /**
   * Returns the bounds of the tray icon.
   * Useful for positioning windows near the tray.
   */
  getBounds: async (): Promise<{x: number, y: number, width: number, height: number}> => {
      if (ipc.isElectron()) {
          return ipc.invoke('tray:get-bounds');
      } else {
          if (mockTrayElement) {
              const rect = mockTrayElement.getBoundingClientRect();
              return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          }
          return { x: 0, y: 0, width: 0, height: 0 };
      }
  },

  /**
   * Destroys the tray icon.
   */
  destroy: (): void => {
    if (ipc.isElectron()) {
      ipc.send('tray:destroy');
    } else {
      if (mockTrayElement) {
        mockTrayElement.remove();
        mockTrayElement = null;
        console.log('[Tray Mock] Destroyed tray icon.');
      }
    }
  }
};
