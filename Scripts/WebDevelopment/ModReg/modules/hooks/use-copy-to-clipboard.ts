import { useState, useCallback } from 'react';

type CopyFn = (text: string) => Promise<boolean>;

/**
 * A React hook that provides a function to copy text to the clipboard.
 * It uses the modern navigator.clipboard API.
 * 
 * @returns A tuple containing the last successfully copied text and the copy function.
 *          The copy function returns a promise that resolves to `true` on success and `false` on failure.
 */
export function useCopyToClipboard(): [string | null, CopyFn] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
