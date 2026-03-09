

export type RGBColor = { r: number; g: number; b: number };
export type HSLColor = { h: number; s: number; l: number };

/**
 * Converts a HEX color string to an RGB object.
 * @param hex The HEX color string (e.g., "#RRGGBB" or "#RGB").
 * @returns An object with r, g, b properties, or null if the format is invalid.
 */
export const hexToRgb = (hex: string): RGBColor | null => {
  if (!hex || typeof hex !== 'string') return null;

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const componentToHex = (c: number): string => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

/**
 * Converts RGB color components to a HEX color string.
 * @param r Red component (0-255).
 * @param g Green component (0-255).
 * @param b Blue component (0-255).
 * @returns The HEX color string (e.g., "#RRGGBB").
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   r       The red color value
 * @param   g       The green color value
 * @param   b       The blue color value
 * @return  An HSL representation
 */
export const rgbToHsl = (r: number, g: number, b: number): HSLColor => {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s, l };
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   h       The hue
 * @param   s       The saturation
 * @param   l       The lightness
 * @return  An RGB representation
 */
export const hslToRgb = (h: number, s: number, l: number): RGBColor => {
    let r, g, b;
    h /= 360;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
};


/**
 * Lightens or darkens a HEX color by a given percentage.
 * @param hex The HEX color string.
 * @param percent A number from -100 to 100. Negative values darken, positive values lighten.
 * @returns The new HEX color string.
 */
export const lightenDarkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.floor(255 * (percent / 100));

  const clamp = (val: number) => Math.max(0, Math.min(255, val));

  const r = clamp(rgb.r + amount);
  const g = clamp(rgb.g + amount);
  const b = clamp(rgb.b + amount);

  return rgbToHex(r, g, b);
};

/**
 * Converts a HEX color to an RGBA string with a specified alpha value.
 * @param hex The HEX color string.
 * @param alpha The alpha value (0 to 1).
 * @returns The RGBA color string (e.g., "rgba(255, 0, 0, 0.5)").
 */
export const rgba = (hex: string, alpha: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Linearly interpolates between two numbers.
 */
const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

/**
 * Interpolates between two HEX colors.
 * @param hex1 The starting HEX color.
 * @param hex2 The ending HEX color.
 * @param factor The interpolation factor (0 to 1).
 * @returns The interpolated HEX color string.
 */
export const interpolateColors = (hex1: string, hex2: string, factor: number): string => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) {
        // Fallback if one of the colors is invalid
        return factor < 0.5 ? hex1 : hex2;
    }
    
    const r = lerp(rgb1.r, rgb2.r, factor);
    const g = lerp(rgb1.g, rgb2.g, factor);
    const b = lerp(rgb1.b, rgb2.b, factor);
    
    return rgbToHex(r, g, b);
};
