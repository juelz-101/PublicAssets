// modules/electron/native-image.ts
import { ipc } from './ipc-wrapper';

export interface ResizeOptions {
    width?: number;
    height?: number;
    quality?: 'good' | 'better' | 'best';
}

export interface NativeImage {
    toDataURL(options?: { scaleFactor?: number }): string;
    toPNG(): Uint8Array;
    toJPEG(quality: number): Uint8Array;
    getBitmap(): Uint8Array;
    getNativeHandle(): any; // Buffer is not available in browser context without polyfills
    isEmpty(): boolean;
    getSize(): { width: number; height: number };
    resize(options: ResizeOptions): Promise<NativeImage>;
    crop(rect: { x: number; y: number; width: number; height: number }): Promise<NativeImage>;
    aspectRatio?: number;
}

// Browser Mock Implementation of NativeImage
class MockNativeImage implements NativeImage {
    private dataUrl: string;
    private width: number = 0;
    private height: number = 0;

    constructor(dataUrl: string) {
        this.dataUrl = dataUrl;
        this.initSize();
    }

    private initSize() {
        if (typeof window === 'undefined') return;
        const img = new Image();
        img.src = this.dataUrl;
        img.onload = () => {
            this.width = img.width;
            this.height = img.height;
        };
    }

    toDataURL(options?: { scaleFactor?: number }): string {
        return this.dataUrl;
    }

    toPNG(): Uint8Array {
        console.warn("[NativeImage Mock] toPNG not fully implemented in browser mock, returning empty buffer.");
        return new Uint8Array();
    }

    toJPEG(quality: number): Uint8Array {
        console.warn("[NativeImage Mock] toJPEG not fully implemented in browser mock, returning empty buffer.");
        return new Uint8Array();
    }

    getBitmap(): Uint8Array {
        console.warn("[NativeImage Mock] getBitmap not fully implemented in browser mock.");
        return new Uint8Array();
    }

    getNativeHandle(): any {
        throw new Error("[NativeImage Mock] getNativeHandle cannot be mocked in browser.");
    }

    isEmpty(): boolean {
        return !this.dataUrl || this.dataUrl === 'data:,';
    }

    getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    async resize(options: ResizeOptions): Promise<NativeImage> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = this.dataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const targetWidth = options.width || this.width;
                const targetHeight = options.height || this.height;
                
                // Maintain aspect ratio if one dimension is missing
                if (!options.height && options.width) {
                    const ratio = this.height / this.width;
                    canvas.height = targetWidth * ratio;
                    canvas.width = targetWidth;
                } else if (!options.width && options.height) {
                    const ratio = this.width / this.height;
                    canvas.width = targetHeight * ratio;
                    canvas.height = targetHeight;
                } else {
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                }

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(new MockNativeImage(canvas.toDataURL()));
                } else {
                    resolve(this);
                }
            };
            img.onerror = () => resolve(this);
        });
    }

    async crop(rect: { x: number; y: number; width: number; height: number }): Promise<NativeImage> {
         return new Promise((resolve) => {
            const img = new Image();
            img.src = this.dataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = rect.width;
                canvas.height = rect.height;
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
                    resolve(new MockNativeImage(canvas.toDataURL()));
                } else {
                    resolve(this);
                }
            };
         });
    }

    get aspectRatio(): number {
        return this.width / (this.height || 1);
    }
}

export const nativeImage = {
    /**
     * Creates a new NativeImage instance from a file path.
     * @param path The path to the image file.
     */
    createFromPath: async (path: string): Promise<NativeImage> => {
        if (ipc.isElectron()) {
            // In a real Electron app, this returns sync, but our bridge might be async
            // or we assume it returns a serialized object we reconstruct.
            // For simplicity in this mock wrapper, we treat creation as async to allow file reading.
            const result = await ipc.invoke('native-image:create-from-path', path);
            return new MockNativeImage(result.dataUrl); 
        } else {
            // Mock: Just create a dummy placeholder or load if it's a real URL
            return new MockNativeImage(path.startsWith('http') ? path : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        }
    },

    /**
     * Creates a new NativeImage instance from a data URL.
     * @param dataURL The data URL.
     */
    createFromDataURL: async (dataURL: string): Promise<NativeImage> => {
        if (ipc.isElectron()) {
             const result = await ipc.invoke('native-image:create-from-data-url', dataURL);
             return new MockNativeImage(result.dataUrl);
        } else {
            return new MockNativeImage(dataURL);
        }
    },
    
    // Additional static methods like createEmpty() could be added here
};