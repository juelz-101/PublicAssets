const padZero = (num: number): string => num.toString().padStart(2, '0');

/**
 * Formats a Date object into a readable string based on a format template.
 * Supported tokens: YYYY, MM, DD, HH (24hr), hh (12hr), mm, ss, a, A
 * @param date The Date object to format.
 * @param format The format string.
 * @returns The formatted date string.
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 < 12 ? 'am' : 'pm';

  const replacements: { [key: string]: string } = {
    'YYYY': year.toString(),
    'MM': padZero(month),
    'DD': padZero(day),
    'HH': padZero(hours24),
    'hh': padZero(hours12),
    'mm': padZero(minutes),
    'ss': padZero(seconds),
    'a': ampm,
    'A': ampm.toUpperCase(),
  };
  
  return format.replace(/YYYY|MM|DD|HH|hh|mm|ss|A|a/g, (match) => replacements[match]);
};

const TIME_UNITS = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

/**
 * Returns a human-readable string representing how long ago a date was.
 * @param date The date to compare against now.
 * @returns A string like "5 minutes ago", "yesterday", "2 weeks ago".
 */
export const timeAgo = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';

  for (const { unit, seconds: unitSeconds } of TIME_UNITS) {
    const interval = Math.floor(seconds / unitSeconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now'; // Fallback for very small intervals
};

/**
 * Checks if a given date is the same day as today.
 * @param date The date to check.
 * @returns `true` if the date is today, `false` otherwise.
 */
export const isToday = (date: Date): boolean => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Adds a specified number of days to a given date.
 * @param date The date to add days to.
 * @param days The number of days to add (can be negative).
 * @returns A new Date object with the days added.
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Adds a specified number of hours to a given date.
 * @param date The date to add hours to.
 * @param hours The number of hours to add (can be negative).
 * @returns A new Date object with the hours added.
 */
export const addHours = (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
};

/**
 * Checks if a given date is in the future.
 * @param date The date to check.
 * @returns `true` if the date is in the future, `false` otherwise.
 */
export const isFuture = (date: Date): boolean => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return false;
    }
    return date.getTime() > new Date().getTime();
};

/**
 * Checks if a given year is a leap year.
 * @param year The year to check.
 * @returns `true` if it's a leap year, `false` otherwise.
 */
export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Formats a duration in seconds into a HH:MM:SS string.
 * @param totalSeconds The duration in seconds.
 * @returns The formatted duration string.
 */
export const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00:00';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};

/**
 * Returns a new Date object set to the start of the day (00:00:00.000) for the given date.
 * @param date The date to get the start of.
 * @returns A new Date object representing the start of the day.
 */
export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Returns a new Date object set to the end of the day (23:59:59.999) for the given date.
 * @param date The date to get the end of.
 * @returns A new Date object representing the end of the day.
 */
export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};
