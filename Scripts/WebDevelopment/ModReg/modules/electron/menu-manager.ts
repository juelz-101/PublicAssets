// modules/electron/menu-manager.ts
import { ipc } from './ipc-wrapper';

export interface MenuItem {
  label?: string;
  type?: 'normal' | 'separator' | 'checkbox' | 'radio';
  checked?: boolean;
  enabled?: boolean;
  click?: () => void;
  submenu?: MenuItem[];
  id?: string;
}

// Internal map to store callbacks for menu items since functions can't be sent via IPC
const callbackMap: Record<string, () => void> = {};
// Internal map to store menu items by ID for state tracking
const itemStateMap: Record<string, MenuItem> = {};

// Helper to process template and register callbacks
const processTemplate = (template: MenuItem[]): any[] => {
  return template.map(item => {
    const processedItem: any = { ...item };
    
    // Store reference if ID exists or generate one if needed for tracking
    const id = item.id || `menu-item-${Math.random().toString(36).substr(2, 9)}`;
    processedItem.id = id;
    itemStateMap[id] = item; // Helper to track local state

    if (item.click) {
      callbackMap[id] = item.click;
      delete processedItem.click; // Remove function before sending
    }

    if (item.submenu) {
      processedItem.submenu = processTemplate(item.submenu);
    }

    return processedItem;
  });
};

// Listen for menu clicks from the main process
if (ipc.isElectron()) {
    ipc.on('menu:action', (_event: any, itemId: string) => {
        if (callbackMap[itemId]) {
            callbackMap[itemId]();
        }
    });
}

// --- Browser Mock Helper ---
const renderMockMenu = (template: MenuItem[], x: number, y: number) => {
    const existing = document.getElementById('mock-context-menu');
    if (existing) existing.remove();

    const menuEl = document.createElement('div');
    menuEl.id = 'mock-context-menu';
    menuEl.style.position = 'fixed';
    menuEl.style.left = `${x}px`;
    menuEl.style.top = `${y}px`;
    menuEl.style.minWidth = '200px';
    menuEl.style.background = '#1A1A1A';
    menuEl.style.border = '1px solid #333';
    menuEl.style.borderRadius = '4px';
    menuEl.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    menuEl.style.zIndex = '9999';
    menuEl.style.padding = '4px 0';

    template.forEach(item => {
        // Allow dynamic updates to reflected in next render by checking state map
        const currentItem = item.id && itemStateMap[item.id] ? itemStateMap[item.id] : item;

        if (currentItem.type === 'separator') {
            const sep = document.createElement('div');
            sep.style.height = '1px';
            sep.style.background = '#333';
            sep.style.margin = '4px 0';
            menuEl.appendChild(sep);
            return;
        }

        const itemEl = document.createElement('div');
        itemEl.innerText = currentItem.label || '';
        itemEl.style.padding = '8px 16px';
        itemEl.style.cursor = 'pointer';
        itemEl.style.color = '#EAEAEA';
        itemEl.style.fontSize = '14px';
        itemEl.style.display = 'flex';
        itemEl.style.justifyContent = 'space-between';

        if (currentItem.checked) {
            itemEl.innerText = `✓ ${currentItem.label}`;
        }

        if (currentItem.enabled === false) {
            itemEl.style.opacity = '0.5';
            itemEl.style.cursor = 'default';
        } else {
            itemEl.onmouseenter = () => { itemEl.style.background = '#08f7fe'; itemEl.style.color = '#000'; };
            itemEl.onmouseleave = () => { itemEl.style.background = 'transparent'; itemEl.style.color = '#EAEAEA'; };
            itemEl.onclick = (e) => {
                e.stopPropagation();
                if (currentItem.click) currentItem.click();
                menuEl.remove();
            };
        }
        
        if (currentItem.submenu) {
             const subArrow = document.createElement('span');
             subArrow.innerText = '▶';
             subArrow.style.fontSize = '10px';
             itemEl.appendChild(subArrow);
        }

        menuEl.appendChild(itemEl);
    });

    document.body.appendChild(menuEl);

    const closeHandler = () => {
        menuEl.remove();
        window.removeEventListener('click', closeHandler);
    };
    setTimeout(() => window.addEventListener('click', closeHandler), 0);
};


export const menu = {
  /**
   * Sets the application menu (top bar on Windows/Linux, Menu Bar on macOS).
   */
  setApplicationMenu: (template: MenuItem[]): void => {
    const processed = processTemplate(template);
    if (ipc.isElectron()) {
      ipc.send('menu:set-application-menu', processed);
    } else {
      console.log('[Menu Mock] Application menu set:', template);
    }
  },

  /**
   * Shows a context menu at the specified position.
   */
  showContextMenu: (template: MenuItem[], position?: { x: number, y: number }): void => {
    const processed = processTemplate(template);
    if (ipc.isElectron()) {
      ipc.send('menu:popup-context-menu', { template: processed, position });
    } else {
      const x = position?.x ?? 100;
      const y = position?.y ?? 100;
      console.log('[Menu Mock] Showing context menu at', x, y);
      renderMockMenu(template, x, y);
    }
  },

  /**
   * Updates a menu item's properties by its ID.
   * Useful for toggling enabled/checked state dynamically.
   */
  updateMenuItem: (id: string, options: Partial<MenuItem>): void => {
      // Update local state map
      if (itemStateMap[id]) {
          Object.assign(itemStateMap[id], options);
      } else {
          console.warn(`[Menu Manager] Item with ID "${id}" not found.`);
      }

      if (ipc.isElectron()) {
          ipc.send('menu:update-item', { id, options });
      } else {
          console.log(`[Menu Mock] Updated item "${id}":`, options);
      }
  },

  /**
   * Retrieves the current state of a menu item by its ID.
   */
  getMenuItemById: (id: string): MenuItem | undefined => {
      return itemStateMap[id];
  },

  /**
   * Closes the currently open context menu.
   */
  closePopup: (windowId?: number): void => {
      if (ipc.isElectron()) {
          ipc.send('menu:close-popup', windowId);
      } else {
          const menuEl = document.getElementById('mock-context-menu');
          if (menuEl) menuEl.remove();
          console.log('[Menu Mock] Context menu closed.');
      }
  }
};
