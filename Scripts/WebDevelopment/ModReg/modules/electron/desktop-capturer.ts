// modules/electron/desktop-capturer.ts
import { ipc } from './ipc-wrapper';

export interface DesktopCapturerSource {
  id: string;
  name: string;
  thumbnail: string; // Data URL in our wrapper, typically NativeImage in Electron
  display_id: string;
  appIcon?: string | null;
}

export interface SourcesOptions {
  types: Array<'screen' | 'window'>;
  thumbnailSize?: {
    width: number;
    height: number;
  };
  fetchWindowIcons?: boolean;
}

// Helper to generate a dummy thumbnail
const generateMockThumbnail = (width: number, height: number, text: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = color;
        ctx.fillRect(10, 10, width - 20, height - 20);
        ctx.fillStyle = '#FFF';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
    }
    return canvas.toDataURL('image/png');
};

export const desktopCapturer = {
  /**
   * Returns a list of screen and window sources available for capture.
   * @param options Configuration for fetching sources.
   */
  getSources: async (options: SourcesOptions): Promise<DesktopCapturerSource[]> => {
    if (ipc.isElectron()) {
      return ipc.invoke('desktop-capturer:get-sources', options);
    } else {
        // Browser Mock
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        
        const w = options.thumbnailSize?.width || 150;
        const h = options.thumbnailSize?.height || 150;

        const mockSources: DesktopCapturerSource[] = [];

        if (options.types.includes('screen')) {
            mockSources.push({
                id: 'screen:1:0',
                name: 'Screen 1',
                display_id: '1',
                thumbnail: generateMockThumbnail(w, h, 'Screen 1', '#08f7fe')
            });
            mockSources.push({
                id: 'screen:2:0',
                name: 'Screen 2',
                display_id: '2',
                thumbnail: generateMockThumbnail(w, h, 'Screen 2', '#00ff9f')
            });
        }

        if (options.types.includes('window')) {
            mockSources.push({
                id: 'window:123:0',
                name: 'Visual Studio Code',
                display_id: '',
                thumbnail: generateMockThumbnail(w, h, 'VS Code', '#007acc')
            });
            mockSources.push({
                id: 'window:456:0',
                name: 'Chrome - React App',
                display_id: '',
                thumbnail: generateMockThumbnail(w, h, 'Chrome', '#F50057')
            });
        }

        return mockSources;
    }
  }
};
