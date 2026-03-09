/**
 * Safely gets a nested property from an object using a string or array path.
 * Handles array access like 'posts[0].title'.
 * @param obj The object to query.
 * @param path The path of the property to retrieve.
 * @param defaultValue The value to return if the path is not found.
 * @returns The value at the path or the default value.
 */
export const get = (obj: Record<string, any>, path: string | string[], defaultValue?: any): any => {
  const pathArray = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/g, '.$1').split('.');
  
  const result = pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);

  return result === undefined ? defaultValue : result;
};

/**
 * Creates a new object with only the specified keys from the original object.
 * @param obj The source object.
 * @param keys The keys to pick.
 * @returns A new object with the picked properties.
 */
export const pick = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
  if (!obj) return {};
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Creates a new object without the specified keys from the original object.
 * @param obj The source object.
 * @param keys The keys to omit.
 * @returns A new object without the omitted properties.
 */
export const omit = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
  if (!obj) return {};
  const newObj = { ...obj };
  keys.forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 * @param obj1 The first value to compare.
 * @param obj2 The second value to compare.
 * @returns `true` if the values are equivalent, `false` otherwise.
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object') {
    if (obj1.constructor !== obj2.constructor) return false;

    let length, i;
    if (Array.isArray(obj1)) {
      length = obj1.length;
      if (length !== obj2.length) return false;
      for (i = length; i-- > 0;) {
        if (!isEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    const keys = Object.keys(obj1);
    length = keys.length;
    if (length !== Object.keys(obj2).length) return false;

    for (i = length; i-- > 0;) {
      const key = keys[i];
      if (!Object.prototype.hasOwnProperty.call(obj2, key) || !isEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  // Primitives and other cases
  return obj1 !== obj2 && typeof obj1 === 'number' && typeof obj2 === 'number' && isNaN(obj1) && isNaN(obj2);
};


/**
 * Creates a deep clone of a JSON-serializable object.
 * NOTE: This will not clone functions, undefined, Symbols, etc.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
export const cloneDeep = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // A simple, fast way to deep clone JSON-safe objects
    return JSON.parse(JSON.stringify(obj));
};
