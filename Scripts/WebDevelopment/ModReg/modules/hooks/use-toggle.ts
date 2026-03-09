
import { useState, useCallback } from 'react';

/**
 * A simple React hook for managing boolean state.
 * @param initialState The initial boolean state. Defaults to `false`.
 * @returns A tuple containing the current state and a function to toggle it.
 */
export const useToggle = (initialState: boolean = false): [boolean, () => void] => {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback((): void => {
    setState(prevState => !prevState);
  }, []);

  return [state, toggle];
};
