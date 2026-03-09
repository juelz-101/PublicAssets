
/**
 * Triggers a browser download for the given content. This is a self-contained helper.
 * @param content The content to download (string).
 * @param fileName The desired name for the downloaded file.
 * @param mimeType The MIME type of the content (e.g., 'text/csv').
 */
const triggerDownload = (content: string, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
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
 * Converts an array of objects into a CSV string and triggers a browser download.
 * @param data An array of flat objects to export.
 * @param fileName The desired name for the downloaded file (e.g., 'data.csv').
 */
export const exportToCsv = (data: Record<string, any>[], fileName: string): void => {
  if (!data || data.length === 0) {
    console.warn('No data provided to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Helper to handle values that might contain commas or quotes
  const sanitizeValue = (value: any): string => {
    const strValue = String(value ?? ''); // Handle null/undefined
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => sanitizeValue(row[header])).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  
  triggerDownload(csvString, fileName, 'text/csv;charset=utf-8;');
};
