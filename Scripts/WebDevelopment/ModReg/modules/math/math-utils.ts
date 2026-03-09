
/**
 * Clamps a number within the inclusive lower and upper bounds.
 * @param num The number to clamp.
 * @param min The lower bound.
 * @param max The upper bound.
 * @returns The clamped number.
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Linearly interpolates between two numbers.
 * @param start The starting value.
 * @param end The ending value.
 * @param amt The amount to interpolate (usually between 0 and 1).
 * @returns The interpolated value.
 */
export const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

/**
 * Returns a random integer within a specified range (inclusive).
 * @param min The minimum value of the range.
 * @param max The maximum value of the range.
 * @returns A random integer between min and max.
 */
export const randomRange = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Formats a number as a currency string for a given locale.
 * @param num The number to format.
 * @param locale A string with a BCP 47 language tag (e.g., 'en-US', 'de-DE').
 * @param currency The ISO 4217 currency code (e.g., 'USD', 'EUR').
 * @returns The formatted currency string.
 */
export const formatCurrency = (num: number, locale: string = 'en-US', currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(num);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to a simple format if Intl fails (e.g., invalid locale/currency)
    return `${currency} ${num.toFixed(2)}`;
  }
};

/**
 * Maps a number from one range to another.
 * @param num The number to map.
 * @param inMin The lower bound of the input range.
 * @param inMax The upper bound of the input range.
 * @param outMin The lower bound of the output range.
 * @param outMax The upper bound of the output range.
 * @returns The mapped number.
 */
export const mapRange = (num: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

/**
 * Calculates the average of numbers in an array.
 * @param numbers The array of numbers.
 * @returns The average, or 0 if the array is empty.
 */
export const average = (numbers: number[]): number => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
};
