// Type definition for a function that manipulates pixel data.
export type EffectFunction = (data: Uint8ClampedArray) => void;
import type { RGBColor } from './color-utils';

/**
 * A non-exported helper for applying convolution kernels.
 * Creates a copy of the pixel data to avoid modifying pixels that are still needed for calculation.
 * @param imageData The ImageData object to modify.
 * @param kernel The convolution matrix.
 * @param opaque Whether to force the alpha channel to 255.
 */
const convolve = (imageData: ImageData, kernel: number[][], opaque: boolean = true): void => {
    const src = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Create a copy of the source data to read from
    const srcCopy = new Uint8ClampedArray(src);
    const dst = imageData.data; // Write directly to the destination

    const kernelHeight = kernel.length;
    const kernelWidth = kernel[0].length;
    const halfKernelH = Math.floor(kernelHeight / 2);
    const halfKernelW = Math.floor(kernelWidth / 2);

    let weight = 0;
    for (const row of kernel) {
        for (const val of row) {
            weight += val;
        }
    }
    // If the kernel weights sum to 0, default to 1 to avoid division by zero.
    // This is common for edge detection kernels.
    if (weight === 0) {
        weight = 1;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dstOff = (y * width + x) * 4;
            let r = 0, g = 0, b = 0;

            for (let ky = 0; ky < kernelHeight; ky++) {
                for (let kx = 0; kx < kernelWidth; kx++) {
                    // Clamp coordinates to stay within image bounds
                    const sy = Math.max(0, Math.min(height - 1, y + ky - halfKernelH));
                    const sx = Math.max(0, Math.min(width - 1, x + kx - halfKernelW));
                    
                    const srcOff = (sy * width + sx) * 4;
                    const wt = kernel[ky][kx];
                    r += srcCopy[srcOff] * wt;
                    g += srcCopy[srcOff + 1] * wt;
                    b += srcCopy[srcOff + 2] * wt;
                }
            }
            
            dst[dstOff] = r / weight;
            dst[dstOff + 1] = g / weight;
            dst[dstOff + 2] = b / weight;
            if (opaque) {
                 dst[dstOff + 3] = 255;
            }
        }
    }
};


/**
 * Gets the ImageData object for the entire canvas.
 * @param ctx The canvas rendering context.
 * @returns The ImageData for the canvas.
 */
export const getImageData = (ctx: CanvasRenderingContext2D): ImageData => {
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
};

/**
 * Applies a given effect function to the canvas.
 * It gets the image data, runs the effect, and puts the data back.
 * @param ctx The canvas rendering context.
 * @param effectFn The function that will modify the ImageData.
 */
export const applyEffect = (ctx: CanvasRenderingContext2D, effectFn: (imageData: ImageData) => void): void => {
    const imageData = getImageData(ctx);
    effectFn(imageData);
    ctx.putImageData(imageData, 0, 0);
};

/**
 * Converts ImageData to grayscale.
 * @param imageData The ImageData object to modify.
 */
export const grayscale = (imageData: ImageData): void => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
};

/**
 * Applies a sepia tone effect to ImageData.
 * @param imageData The ImageData object to modify.
 */
export const sepia = (imageData: ImageData): void => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
};

/**
 * Inverts the colors of the ImageData.
 * @param imageData The ImageData object to modify.
 */
export const invert = (imageData: ImageData): void => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
};

/**
 * Adjusts the brightness of the ImageData.
 * @param imageData The ImageData object to modify.
 * @param amount The brightness adjustment (-255 to 255).
 */
export const brightness = (imageData: ImageData, amount: number): void => {
    const data = imageData.data;
    amount = Math.max(-255, Math.min(255, amount));
    for (let i = 0; i < data.length; i += 4) {
        data[i] += amount;
        data[i + 1] += amount;
        data[i + 2] += amount;
    }
};

/**
 * Adjusts the contrast of the ImageData.
 * @param imageData The ImageData object to modify.
 * @param amount The contrast adjustment (-100 to 100).
 */
export const contrast = (imageData: ImageData, amount: number): void => {
    const data = imageData.data;
    const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
};

/**
 * Applies a pixelation effect to the ImageData.
 * @param imageData The ImageData object to modify.
 * @param blockSize The size of the pixel blocks.
 */
export const pixelate = (imageData: ImageData, blockSize: number): void => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    blockSize = Math.max(1, Math.floor(blockSize));

    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            for (let blockY = 0; blockY < blockSize; blockY++) {
                for (let blockX = 0; blockX < blockSize; blockX++) {
                    if (x + blockX < width && y + blockY < height) {
                        const index = ((y + blockY) * width + (x + blockX)) * 4;
                        data[index] = r;
                        data[index + 1] = g;
                        data[index + 2] = b;
                    }
                }
            }
        }
    }
};

/**
 * Applies a box blur effect to the ImageData.
 * @param imageData The ImageData object to modify.
 * @param amount The radius of the blur.
 */
export const blur = (imageData: ImageData, amount: number): void => {
    amount = Math.max(1, Math.floor(amount));
    const size = amount * 2 + 1;
    const kernelValue = 1 / (size * size);
    const kernel: number[][] = Array.from({ length: size }, () => Array(size).fill(kernelValue));
    convolve(imageData, kernel);
};

/**
 * Applies a sharpening effect to the ImageData.
 * @param imageData The ImageData object to modify.
 */
export const sharpen = (imageData: ImageData): void => {
    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];
    convolve(imageData, kernel);
};

/**
 * Converts the image to black and white based on a brightness threshold.
 * @param imageData The ImageData object to modify.
 * @param level The brightness threshold (0-100).
 */
export const threshold = (imageData: ImageData, level: number): void => {
    const data = imageData.data;
    const thresholdValue = (level / 100) * 255;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = avg > thresholdValue ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }
};

/**
 * Inverts pixel values below a certain brightness threshold.
 * @param imageData The ImageData object to modify.
 * @param level The brightness threshold (0-100).
 */
export const solarize = (imageData: ImageData, level: number): void => {
    const data = imageData.data;
    const thresholdValue = (level / 100) * 255;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] < thresholdValue) data[i] = 255 - data[i];
        if (data[i+1] < thresholdValue) data[i+1] = 255 - data[i+1];
        if (data[i+2] < thresholdValue) data[i+2] = 255 - data[i+2];
    }
};

/**
 * Adds a dark, soft border to the corners of the image.
 * @param imageData The ImageData object to modify.
 * @param strength The darkness of the vignette (0-100).
 * @param size The size of the central light area (0-100).
 */
export const vignette = (imageData: ImageData, strength: number, size: number): void => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    const vignetteSize = 1 - (size / 100); // Invert size for intuitive control
    const vignetteStrength = strength / 100;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) / maxDist; // distance normalized 0-1

            const falloff = Math.max(0, (dist - vignetteSize) / (1 - vignetteSize));
            const darkness = Math.pow(falloff, 2) * vignetteStrength; // Use pow for smoother falloff

            data[i] *= (1 - darkness);
            data[i + 1] *= (1 - darkness);
            data[i + 2] *= (1 - darkness);
        }
    }
};

/**
 * Tints an image with a specified color.
 * @param imageData The ImageData to modify.
 * @param color The tint color.
 * @param mix The strength of the tint (0 to 1).
 */
export const tint = (imageData: ImageData, color: RGBColor, mix: number): void => {
    const data = imageData.data;
    const mixAmount = Math.max(0, Math.min(1, mix));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * (1 - mixAmount) + color.r * mixAmount;
        data[i + 1] = data[i + 1] * (1 - mixAmount) + color.g * mixAmount;
        data[i + 2] = data[i + 2] * (1 - mixAmount) + color.b * mixAmount;
    }
};

/**
 * Removes a color channel from the image.
 * @param imageData The ImageData to modify.
 * @param channel The channel to remove ('r', 'g', or 'b').
 */
export const removeChannel = (imageData: ImageData, channel: 'r' | 'g' | 'b'): void => {
    const data = imageData.data;
    const channelIndex = channel === 'r' ? 0 : channel === 'g' ? 1 : 2;
    for (let i = 0; i < data.length; i += 4) {
        data[i + channelIndex] = 0;
    }
};

/**
 * Reduces the number of colors in the image.
 * @param imageData The ImageData to modify.
 * @param levels The number of color levels per channel.
 */
export const posterize = (imageData: ImageData, levels: number): void => {
    const data = imageData.data;
    levels = Math.max(2, Math.floor(levels));
    const step = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(Math.round(data[i] / step) * step);
        data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
        data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    }
};

/**
 * Adds random noise to the image.
 * @param imageData The ImageData to modify.
 * @param amount The intensity of the noise (0 to 100).
 */
export const noise = (imageData: ImageData, amount: number): void => {
    const data = imageData.data;
    amount = Math.max(0, Math.min(100, amount));
    for (let i = 0; i < data.length; i += 4) {
        const random = (Math.random() - 0.5) * amount;
        data[i] += random;
        data[i + 1] += random;
        data[i + 2] += random;
    }
};

/**
 * Applies an edge detection effect.
 * @param imageData The ImageData object to modify.
 */
export const edgeDetection = (imageData: ImageData): void => {
    const kernel = [
        [-1, -1, -1],
        [-1,  8, -1],
        [-1, -1, -1]
    ];
    grayscale(imageData); // Edge detection works best on grayscale images
    convolve(imageData, kernel);
};