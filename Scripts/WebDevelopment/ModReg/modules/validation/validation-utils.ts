
/**
 * Checks if a string is a valid email address.
 * This is a simple regex and may not cover all edge cases.
 * @param email The string to validate.
 * @returns `true` if the string is a valid email, `false` otherwise.
 */
export const isEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if a string is a valid URL.
 * @param url The string to validate.
 * @returns `true` if the string is a valid URL, `false` otherwise.
 */
export const isURL = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a password meets a set of strength criteria.
 * Criteria:
 * - At least 8 characters long
 * - Contains at least one lowercase letter
 * - Contains at least one uppercase letter
 * - Contains at least one number
 * - Contains at least one special character
 * @param password The password string to validate.
 * @returns `true` if the password is strong, `false` otherwise.
 */
export const isStrongPassword = (password: string): boolean => {
  if (!password) return false;
  
  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar;
};

/**
 * Checks if a string is a valid JSON.
 * @param str The string to validate.
 * @returns `true` if the string is valid JSON, `false` otherwise.
 */
export const isJSON = (str: string): boolean => {
    if (!str) return false;
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Checks if a string contains only numeric characters.
 * @param str The string to validate.
 * @returns `true` if the string is numeric, `false` otherwise.
 */
export const isNumeric = (str: string): boolean => {
  if (typeof str !== 'string' || str === '') return false;
  return /^\d+$/.test(str);
};

/**
 * Checks if a string is a valid 3 or 6-digit hex color code.
 * @param str The string to validate.
 * @returns `true` if the string is a valid hex color, `false` otherwise.
 */
export const isHexColor = (str: string): boolean => {
  if (!str) return false;
  return /^#?([0-9A-F]{3}){1,2}$/i.test(str);
};
