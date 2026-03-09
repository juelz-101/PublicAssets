/**
 * Reads a File object and returns its content as a string.
 * @param file The File object from a file input.
 * @returns A promise that resolves with the file's text content.
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Reads a File object and returns its content as a Base64 Data URL.
 * @param file The File object from a file input.
 * @returns A promise that resolves with the file's Data URL.
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Reads a File object and returns its content as an ArrayBuffer.
 * @param file The File object from a file input.
 * @returns A promise that resolves with the file's ArrayBuffer.
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Triggers a browser download for the given content.
 * @param content The content to download (string or Blob).
 * @param fileName The desired name for the downloaded file.
 * @param mimeType The MIME type of the content (e.g., 'application/json', 'text/csv').
 */
export const downloadFile = (content: string | Blob, fileName: string, mimeType: string): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Formats a size in bytes into a human-readable string (e.g., KB, MB, GB).
 * @param bytes The number of bytes.
 * @param decimals The number of decimal places to include.
 * @returns The formatted file size string.
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Extracts the file extension from a filename string.
 * @param fileName The full name of the file (e.g., 'image.jpeg').
 * @returns The extension without the dot (e.g., 'jpeg'), or null if not found.
 */
export const getFileExtension = (fileName: string): string | null => {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) {
        return null; // No extension or hidden file
    }
    return fileName.substring(lastDot + 1);
};

/**
 * Gets the dimensions of an image from a File object or a Data URL string.
 * @param source The image File or Data URL.
 * @returns A promise that resolves with the image's width and height.
 */
export const getImageDimensions = (source: File | string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve({ width: image.width, height: image.height });
        };
        image.onerror = (err) => {
            reject(err);
        };

        if (typeof source === 'string') {
            image.src = source;
        } else {
            image.src = URL.createObjectURL(source);
        }
    });
};

interface ResizeImageOptions {
    maxWidth: number;
    maxHeight: number;
    quality?: number; // 0 to 1, for JPEG/WebP
    type?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Resizes an image file while maintaining aspect ratio.
 * @param file The image file to resize.
 * @param options The resizing options (maxWidth, maxHeight, quality, type).
 * @returns A promise that resolves with the resized image as a Blob.
 */
export const resizeImage = (file: File, options: ResizeImageOptions): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        const { maxWidth, maxHeight, quality = 0.8, type = 'image/jpeg' } = options;

        try {
            const dataUrl = await readFileAsDataURL(file);
            const image = new Image();

            image.onload = () => {
                let { width, height } = image;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    return reject(new Error('Could not get canvas context.'));
                }

                ctx.drawImage(image, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed.'));
                        }
                    },
                    type,
                    quality
                );
            };

            image.onerror = (err) => reject(err);
            image.src = dataUrl;

        } catch (error) {
            reject(error);
        }
    });
};
