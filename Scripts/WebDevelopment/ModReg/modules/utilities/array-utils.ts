
export const chunk = <T,>(arr: T[], size: number): T[][] => {
  if (!arr || size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const unique = <T,>(arr: T[]): T[] => {
  if (!arr) return [];
  return [...new Set(arr)];
};

export const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const flatten = (arr: any[]): any[] => {
  if (!arr) return [];
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
};

export const shuffle = <T,>(arr: T[]): T[] => {
  if (!arr) return [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const compact = <T,>(arr: (T | null | undefined | false | '' | 0)[]): T[] => {
  if (!arr) return [];
  return arr.filter(Boolean) as T[];
};
