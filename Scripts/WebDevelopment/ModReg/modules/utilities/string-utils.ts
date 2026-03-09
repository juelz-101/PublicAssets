
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, length: number): string => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const camelCase = (str: string): string => {
    if (!str) return '';
    return str.replace(/([-_ ][a-z])/ig, ($1) => {
        return $1.toUpperCase()
                 .replace('-', '')
                 .replace('_', '')
                 .replace(' ', '');
    });
};

export const pascalCase = (str: string): string => {
    if (!str) return '';
    const camel = camelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
};

export const snakeCase = (str: string): string => {
    if (!str) return '';
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export const kebabCase = (str: string): string => {
    if (!str) return '';
    return str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/_/g, '-');
};
