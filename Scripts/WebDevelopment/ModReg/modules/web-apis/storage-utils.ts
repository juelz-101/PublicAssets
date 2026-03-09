
interface StorageAPI {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

interface StoredItem<T> {
  value: T;
  expiry: number | null;
}

const createStorage = (storage: StorageAPI) => ({
  /**
   * Retrieves and parses a JSON value from storage.
   * @param key The key of the item to retrieve.
   * @returns The parsed value, or null if the key doesn't exist, is expired, or parsing fails.
   */
  get<T>(key: string): T | null {
    const itemStr = storage.getItem(key);
    if (itemStr === null) {
      return null;
    }
    try {
      const item = JSON.parse(itemStr) as StoredItem<T>;
      // Check if item has the new structure
      if (typeof item === 'object' && item !== null && 'value' in item && 'expiry' in item) {
        if (item.expiry && Date.now() > item.expiry) {
            storage.removeItem(key); // Clean up expired item
            return null;
        }
        return item.value;
      }
      // Fallback for old data structure
      return item as T;
    } catch (e) {
      console.error(`Error parsing JSON from storage key "${key}":`, e);
      return null;
    }
  },

  /**
   * Serializes a value to JSON and stores it.
   * @param key The key to store the value under.
   * @param value The value to store (can be any JSON-serializable type).
   * @param ttlSeconds Time to live in seconds. If not provided, item will not expire.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    try {
      const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      const item: StoredItem<T> = { value, expiry };
      const serializedValue = JSON.stringify(item);
      storage.setItem(key, serializedValue);
    } catch (e) {
      console.error(`Error serializing value for storage key "${key}":`, e);
    }
  },

  /**
   * Removes an item from storage by its key.
   * @param key The key of the item to remove.
   */
  remove(key: string): void {
    storage.removeItem(key);
  },

  /**
   * Clears all items from the storage.
   */
  clear(): void {
    storage.clear();
  },
});

/**
 * A safe wrapper for window.localStorage that handles JSON serialization.
 */
export const localStore = createStorage(window.localStorage);

/**
 * A safe wrapper for window.sessionStorage that handles JSON serialization.
 */
export const sessionStore = createStorage(window.sessionStorage);
