/* apps/shared/tool-client.ts */
/* Version: 1.0.1 - Chatsir-Gener */

export const ZikyToolClient = {
  // Tell the main site we are ready
  init: (toolName: string) => {
    window.parent.postMessage({ 
      source: 'ZIKY_TOOL', 
      action: 'READY', 
      payload: { name: toolName } 
    }, '*');
  },

  // Send data back to the main site
  emit: (action: string, payload: any) => {
    window.parent.postMessage({ 
      source: 'ZIKY_TOOL', 
      action, 
      payload 
    }, '*');
  }
};

// Auto-listen for commands from the parent
window.addEventListener('message', (event) => {
  console.log(`Tool received command: ${event.data.action}`, event.data.payload);
  // Here the tool handles specific actions like 'SET_THEME' or 'RESET'
});