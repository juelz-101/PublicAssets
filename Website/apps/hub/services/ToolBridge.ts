/* services/ToolBridge.ts */
/* Version: 1.5.0 - Chatsir-Gener */

export const ToolBridge = {
  // Send a message to the tool's iframe
  sendToTool: (iframeRef: HTMLIFrameElement | null, action: string, payload: any) => {
    if (iframeRef && iframeRef.contentWindow) {
      iframeRef.contentWindow.postMessage({ action, payload }, '*');
    } else {
      console.error("Chatsir: The iframe is missing. Just like my motivation on Mondays.");
    }
  },

  // Listen for messages FROM the tool
  listenToTool: (callback: (data: any) => void) => {
    const handler = (event: MessageEvent) => {
      // Basic security: You should check event.origin here if you weren't lazy
      if (event.data && event.data.source === 'ZIKY_TOOL') {
        callback(event.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }
};