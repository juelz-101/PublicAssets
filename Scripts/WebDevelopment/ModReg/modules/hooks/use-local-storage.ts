
import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { localStore } from '../web-apis/storage-utils';

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * A React hook that syncs state to localStorage, persisting it across browser sessions.
 * It provides a `useState`-like interface.
 *
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A tuple containing the stateful value and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStore.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStore.set(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.localStorage) {
         try {
            const newValue = e.newValue ? JSON.parse(e.newValue) : null;
             if (newValue && 'value' in newValue) {
                setStoredValue(newValue.value);
            } else {
                 setStoredValue(newValue);
            }
        } catch (error) {
            console.error("Error parsing storage change value:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
